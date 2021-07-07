import { Geometry } from './geometry';
import { Parcels } from './parcels';

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
        [ngClass]="{ mapOnly: geometry.mapOnly }"
        class="border-1"
      >
        <div [ngClass]="{ mapOnly: geometry.mapOnly }" class="border-2">
          <div [ngClass]="{ mapOnly: geometry.mapOnly }" class="border-3">
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
                <map-paths id="thePaths"></map-paths>
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

    <aside *ngIf="geometry.profile === 'washington' && !geometry.mapOnly">
      <map-legend></map-legend>
    </aside>

    <a #saver hidden></a>`
})
export class RootComponent implements AfterViewInit {
  @HostBinding('class.dragging') dragging = false;
  @HostBinding('class.printing') printing = false;

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
    if (!this.printing) {
      // effect of "printing" will be to make overflow: unset
      // NOTE: necessary for print to show entire extent
      this.printing = true;
      this.cdf.markForCheck();
      // save all the paths
      const thePaths = document.getElementById('thePaths');
      let blob = new Blob([thePaths.innerHTML], {
        type: 'text/plain;charset=utf-8'
      });
      saveAs(blob, 'paths.svg');
      // save the parcels index
      const index = this.parcels.parcels.lots.reduce((acc, lot) => {
        acc[lot.id] = {
          address: lot.address
        };
        return acc;
      }, {});
      blob = new Blob(
        ['export const lots = ', JSON.stringify(index, null, 2), ';'],
        {
          type: 'text/plain;charset=utf-8'
        }
      );
      saveAs(blob, 'lots.ts');
      // a little later, fire up the print
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
