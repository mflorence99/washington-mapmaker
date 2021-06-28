import { Geometry } from './geometry';

import { AfterViewInit } from '@angular/core';
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
    <main *ngIf="geometry.ready$ | async as ready" #theMap>
      <div *ngIf="geometry.format !== 'legendOnly'" class="border-1">
        <div class="border-2">
          <div class="border-3">
            <section
              (click)="logLocation($event)"
              (dblclick)="print()"
              (mousedown)="startDrag($event)"
              (mouseout)="stopDrag()"
              (mousemove)="doDrag($event)"
              (mouseup)="stopDrag()"
            >
              <figure [ngClass]="geometry.format">
                <map-clip></map-clip>

                <ng-container [ngSwitch]="geometry.style">
                  <ng-container *ngSwitchCase="'arcgis'">
                    <map-street></map-street>
                    <map-lots></map-lots>
                  </ng-container>

                  <ng-container *ngSwitchCase="'osm'">
                    <!-- map-topo></!-->
                    <map-lots></map-lots>
                    <!-- map-street></!-->
                  </ng-container>
                </ng-container>

                <map-labels></map-labels>

                <map-boundary></map-boundary>
                <map-grid></map-grid>
              </figure>

              <figcaption>
                <map-indices
                  *ngIf="geometry.profile == 'washington'"
                ></map-indices>

                <footer>
                  <p>
                    Sources: ArcGIS, OpenStreetMap, and parcels by LOVELAND
                    Technologies at landgrid.com
                  </p>
                  <p>Published {{ today | date: 'longDate' }}</p>
                </footer>
              </figcaption>
            </section>
          </div>
        </div>
      </div>
    </main>

    <aside
      *ngIf="geometry.format !== 'tiny' && geometry.profile == 'washington'"
    >
      <map-legend></map-legend>
    </aside>
  `
})
export class RootComponent implements AfterViewInit {
  @HostBinding('class.dragging') dragging = false;
  @HostBinding('class.printing') printing = false;

  @ViewChild('theMap', { static: false }) theMap: ElementRef;

  today = new Date();

  private basis: MouseEvent;

  constructor(
    private cdf: ChangeDetectorRef,
    private host: ElementRef,
    public geometry: Geometry
  ) {}

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

  ngAfterViewInit(): void {
    this.geometry.ready$.subscribe(() => {
      this.cdf.detectChanges();
      // compute size of side matter
      if (
        this.geometry.format !== 'tiny' &&
        this.geometry.profile === 'washington'
      ) {
        const sideMatterWidth =
          this.geometry.format === 'legendOnly'
            ? 800
            : this.theMap.nativeElement.offsetWidth / 5;
        const style = document.body.style;
        style.setProperty('--map-side-matter-cx', `${sideMatterWidth}px`);
      }
      // scroll to the focus point
      const center = this.geometry.latlon2css({
        left: this.geometry.focus.lon,
        top: this.geometry.focus.lat
      });
      this.host.nativeElement.scrollBy(
        center.left - this.host.nativeElement.offsetWidth / 2,
        center.top - this.host.nativeElement.offsetHeight / 2
      );
    });
  }

  print(): void {
    if (!this.printing) {
      // effect of "printing" will be to make overflow: unset
      // NOTE: necessary for print to show entire extent
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
    }
  }

  startDrag(event: MouseEvent): void {
    this.basis = event;
    this.dragging = true;
  }

  stopDrag(): void {
    this.dragging = false;
  }
}
