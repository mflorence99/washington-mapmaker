import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { PolygonsComponent } from './polygons';

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
  template: ` <main *ngIf="geometry.ready$ | async">
      <div
        *ngIf="!geometry.legendOnly"
        [ngClass]="{ hidden: geometry.mapOnly || geometry.parcelsOnly }"
        class="border-1"
      >
        <div
          [ngClass]="{ hidden: geometry.mapOnly || geometry.parcelsOnly }"
          class="border-2"
        >
          <div
            [ngClass]="{ hidden: geometry.mapOnly || geometry.parcelsOnly }"
            class="border-3"
          >
            <section (contextmenu)="logLocation($event)" (dblclick)="print()">
              <figure>
                <map-defs></map-defs>
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
                <map-polygons #polygons></map-polygons>
              </figure>

              <figcaption>
                <map-indices
                  *ngIf="geometry.profile === 'washington'"
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
      *ngIf="
        geometry.profile === 'washington' &&
        !geometry.mapOnly &&
        !geometry.parcelsOnly
      "
    >
      <map-legend></map-legend>
    </aside>

    <a #saver hidden></a>`
})
export class RootComponent implements AfterViewInit {
  @HostBinding('class.dragging') dragging = false;
  @HostBinding('class.printing') printing = false;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('polygons', { static: false }) polygons: PolygonsComponent;
  @ViewChild('saver', { static: false }) saver: ElementRef;

  today = new Date();

  constructor(
    private cdf: ChangeDetectorRef,
    private host: ElementRef,
    public geometry: Geometry,
    private parcels: Parcels
  ) {}

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
    if (!this.printing && !this.geometry.legendOnly) {
      // effect of "printing" will be to make overflow: unset
      // NOTE: necessary for print to show entire extent
      this.printing = true;
      this.cdf.markForCheck();
      // save all the lot polygons
      let blob = new Blob([this.polygons.nativeElement().innerHTML], {
        type: 'text/plain;charset=utf-8'
      });
      saveAs(blob, `${this.geometry.profile}.svg`);
      // save the parcels index
      const index = this.parcels.parcels.lots.reduce((acc, lot) => {
        acc[lot.id] = {
          address: lot.address
        };
        return acc;
      }, {});
      blob = new Blob(
        ['export const LOTS = ', JSON.stringify(index, null, 2), ';'],
        {
          type: 'text/plain;charset=utf-8'
        }
      );
      saveAs(blob, 'lots.ts');
      // a little later, fire up the print
      if (!this.geometry.parcelsOnly) {
        setTimeout(() => {
          domtoimage
            .toJpeg(this.host.nativeElement as HTMLElement, {
              bgcolor: 'white',
              quality: 0.95
            })
            .then((dataURL) => {
              //  save the map itself
              this.saver.nativeElement.download = `${this.geometry.profile}.jpeg`;
              this.saver.nativeElement.href = dataURL;
              this.saver.nativeElement.click();
              // back to our normal programming
              this.saver.nativeElement.href = null;
              this.printing = false;
              this.cdf.markForCheck();
            });
        }, 100);
      }
    }
  }
}
