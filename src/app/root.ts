import { Geometry } from './geometry';
import { Parcels } from './parcels';

import * as htmlToImage from 'html-to-image';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HostBinding } from '@angular/core';
import { HostListener } from '@angular/core';

import { saveAs } from 'file-saver';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: Geometry },
    { provide: 'params', useValue: { thumbnail: undefined } }
  ],
  selector: 'map-root',
  template: `<ng-container *ngIf="geometry.ready$ | async">
    <main *ngIf="!geometry.legendOnly">
      <map-border>
        <map-body (click)="logLocation($event)" (dblclick)="print()">
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
            <!-- <map-symbols
              *ngIf="geometry.profile === 'washington'"
            ></map-symbols> -->
            <map-buildings></map-buildings>
            <map-lot-labels></map-lot-labels>
            <map-boundary></map-boundary>
            <map-grid></map-grid>
            <map-indices
              *ngIf="geometry.profile === 'washington'"
            ></map-indices>
          </figure>
          <map-scale *ngIf="!geometry.mapOnly"></map-scale>
        </map-body>
      </map-border>
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
  </ng-container>`
})
export class RootComponent implements AfterViewInit {
  @HostBinding('class.printing') printing = false;
  @HostBinding('class.withLegend') withLegend =
    this.geometry.profile === 'washington' &&
    !this.geometry.legendOnly &&
    !this.geometry.mapOnly &&
    !this.geometry.parcelsOnly;

  private coordinates: [number, number][] = [];

  constructor(
    private cdf: ChangeDetectorRef,
    private host: ElementRef,
    public geometry: Geometry,
    private parcels: Parcels
  ) {}

  @HostListener('window:keydown.shift') beginCoordinates(): void {
    this.coordinates = [];
  }

  collectCoordinates(coord: [number, number]): void {
    console.log('Collecting coordinates... ');
    this.coordinates.push(coord);
  }

  @HostListener('window:keyup.shift') endCoordinates(): void {
    // ????  Lot in parcels.ts
    // ???? we auto close by making the last point equal the first
    const geometry = {
      geometry: {
        coordinates: [[...this.coordinates, this.coordinates[0]]],
        type: 'Polygon'
      }
    };
    // ???? strip out leading & trailing { ... }
    let str = JSON.stringify(geometry);
    str = str.substring(1, str.length - 1);
    navigator.clipboard.writeText(str).then(() => {
      console.log(geometry);
    });
  }

  // ???? we know layerX, layerY is non-standard, but
  // it works for us and that's good enough for this non-critical API
  logLocation(event: any): void {
    const x = Number(event.layerX) + this.geometry.clip.x;
    const y = Number(event.layerY) + this.geometry.clip.y;
    const point = this.geometry.xy2point([x, y]);
    if (event.shiftKey) this.collectCoordinates([point.lon, point.lat]);
    else {
      navigator.clipboard.writeText(JSON.stringify(point)).then(() => {
        console.log(point);
        // also log what was clicked
        // ???? see lots.ts: this is the lot ID
        // ???? see styles.scss: only map-lots gets pointer events
        console.log(event.srcElement.id);
      });
    }
  }

  ngAfterViewInit(): void {
    this.geometry.ready$.subscribe(() => {
      this.cdf.detectChanges();
      // scroll to the focus point
      if (!this.geometry.legendOnly) {
        const center = this.geometry.point2xy(this.geometry.focus);
        this.host.nativeElement.scrollBy(
          center[0] -
            this.geometry.clip.x -
            this.host.nativeElement.offsetWidth / 2,
          center[1] -
            this.geometry.clip.y -
            this.host.nativeElement.offsetHeight / 2
        );
      }
      // give the focus to the map
      this.host.nativeElement.focus();
    });
  }

  print(): void {
    if (!this.printing) this.emitMap();
  }

  private emitMap(): void {
    // ???? necessary for print to show entire extent
    //    effect of "printing" will be to make overflow: unset
    this.printing = true;
    this.cdf.markForCheck();
    // save the parcels index
    // a little later, fire up the print
    setTimeout(() => {
      console.log('Printing map...');
      htmlToImage
        .toBlob(this.host.nativeElement as HTMLElement)
        .then((blob) => {
          const suffix = this.geometry.mapOnly ? '' : '-full';
          saveAs(blob, `${this.geometry.profile}${suffix}.png`);
          // back to our normal programming
          console.log('...map print complete');
          this.printing = false;
          this.cdf.markForCheck();
        });
    }, 100);
  }
}
