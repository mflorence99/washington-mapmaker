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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: Geometry },
    { provide: 'params', useValue: { thumbnail: false } }
  ],
  selector: 'map-root',
  template: `
    <main *ngIf="geometry.ready$ | async" #theMap>
      <div *ngIf="!geometry.legendOnly" class="border-1">
        <div class="border-2">
          <div class="border-3">
            <section
              (contextmenu)="logLocation($event)"
              (dblclick)="print()"
              (mousedown)="startDrag($event)"
              (mouseout)="stopDrag()"
              (mousemove)="doDrag($event)"
              (mouseup)="stopDrag()"
            >
              <figure>
                <map-clip></map-clip>
                <map-topo
                  *ngIf="!geometry.parcelsOnly"
                  [provider]="'arcgis'"
                  [tag]="'Main map topo'"
                ></map-topo>
                <map-lots></map-lots>
                <map-street
                  *ngIf="!geometry.parcelsOnly"
                  [provider]="'osm'"
                  [tag]="'Main map street'"
                ></map-street>
                <map-lot-labels></map-lot-labels>
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

    <aside *ngIf="geometry.profile === 'washington'">
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
  logLocation(event: any): boolean {
    const x = Number(event.layerX) + this.geometry.clip.x;
    const y = Number(event.layerY) + this.geometry.clip.y;
    const point = this.geometry.xy2point([x, y]);
    navigator.clipboard.writeText(JSON.stringify(point)).then(() => {
      console.log(point);
      // also log what was clicked
      // NOTE: see lots.ts: this is the lot ID
      // NOTE: see styles.scss: only map-lots gets pointer events
      console.log(event.srcElement.id);
    });
    return false;
  }

  ngAfterViewInit(): void {
    this.geometry.ready$.subscribe(() => {
      this.cdf.detectChanges();
      // scroll to the focus point
      if (!this.geometry.legendOnly) {
        const center = this.geometry.latlon2css({
          left: this.geometry.focus.lon,
          top: this.geometry.focus.lat
        });
        this.host.nativeElement.scrollBy(
          center.left - this.host.nativeElement.offsetWidth / 2,
          center.top - this.host.nativeElement.offsetHeight / 2
        );
      }
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
            saveAs(blob, `${this.geometry.profile}.png`);
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
