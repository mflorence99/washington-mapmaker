import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HostBinding } from '@angular/core';
import { ViewChild } from '@angular/core';

import { saveAs } from 'file-saver';

import domtoimage from 'dom-to-image';

type UIEvent = {
  layerX: number;
  layerY: number;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-root',
  template: `
    <main *ngIf="ready && geometry.format !== 'legendOnly'" #theMap>
      <div class="border-1">
        <div class="border-2">
          <div class="border-3">
            <section>
              <figure [ngClass]="geometry.format">
                <ng-container [ngSwitch]="geometry.style">
                  <ng-container *ngSwitchCase="'arcgis'">
                    <map-street></map-street>
                    <map-parcels></map-parcels>
                  </ng-container>

                  <ng-container *ngSwitchCase="'osm'">
                    <map-topo></map-topo>
                    <map-parcels></map-parcels>
                    <map-street></map-street>
                  </ng-container>
                </ng-container>

                <map-boundary></map-boundary>
                <map-grid></map-grid>
                <map-indices
                  *ngIf="geometry.profile == 'washington'"
                ></map-indices>
              </figure>

              <figcaption
                (click)="logLocation($event)"
                (dblclick)="print()"
                (mousedown)="startDrag($event)"
                (mouseout)="stopDrag()"
                (mousemove)="doDrag($event)"
                (mouseup)="stopDrag()"
              >
                <p>
                  Sources: ArcGIS, OpenStreetMap, and parcels by LOVELAND
                  Technologies at landgrid.com
                </p>
                <p>Published {{ today | date: 'longDate' }}</p>
              </figcaption>
            </section>
          </div>
        </div>
      </div>
    </main>

    <aside *ngIf="geometry.profile == 'washington'">
      <map-legend></map-legend>
    </aside>
  `
})
export class RootComponent {
  @HostBinding('class.dragging') dragging = false;
  @HostBinding('class.printing') printing = false;

  ready = false;

  @ViewChild('theMap', { static: false }) theMap: ElementRef;

  today = new Date();

  private basis: MouseEvent;

  // @see https://stackoverflow.com/questions/35497243
  private beep = new Audio('assets/beep.mp3');

  constructor(
    private cdf: ChangeDetectorRef,
    private host: ElementRef,
    public geometry: Geometry
  ) {
    this.geometry.ready.subscribe(() => {
      this.ready = true;
      this.cdf.detectChanges();
      // compute size of side matter
      if (this.geometry.profile === 'washington') {
        const sideMatterWidth =
          geometry.format === 'legendOnly'
            ? 800
            : this.theMap.nativeElement.offsetWidth / 3;
        const style = document.body.style;
        style.setProperty('--map-side-matter-cx', `${sideMatterWidth}px`);
      }
    });
  }

  doDrag(event: MouseEvent): void {
    if (this.dragging) {
      this.host.nativeElement.scrollBy(
        -(event.clientX - this.basis.clientX),
        -(event.clientY - this.basis.clientY)
      );
      this.basis = event;
    }
  }

  // NOTE: we know layerX, layerY is non-standard, but
  // it works for us and that's good enough for this non-critical API
  logLocation({ layerX, layerY }: UIEvent): void {
    const x = layerX + this.geometry.clip.x;
    const y = layerY + this.geometry.clip.y;
    console.log(this.geometry.xy2point([x, y]));
  }

  print(): void {
    if (!this.printing) {
      // effect of "printing" will be to make overflow: unset
      // NOTE: necessary for print to shoe entire extent
      this.printing = true;
      this.cdf.markForCheck();
      // a little later, fire up the print
      setTimeout(() => {
        domtoimage
          .toBlob(this.host.nativeElement as HTMLElement, { bgcolor: 'white ' })
          .then((blob) => {
            saveAs(
              blob,
              `${this.geometry.profile}-${this.geometry.style}-${this.geometry.format}.png`
            );
            // back to our normal programming
            this.printing = false;
            this.cdf.markForCheck();
          });
      }, 100);
    } else this.beep.play();
  }

  startDrag(event: MouseEvent): void {
    this.basis = event;
    this.dragging = true;
  }

  stopDrag(): void {
    this.dragging = false;
  }
}
