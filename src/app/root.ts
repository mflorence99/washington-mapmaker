import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { PolygonsComponent } from './polygons';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HostBinding } from '@angular/core';
import { HostListener } from '@angular/core';
import { ViewChild } from '@angular/core';

import { saveAs } from 'file-saver';

import domtoimage from 'dom-to-image';

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
            <map-lot-labels></map-lot-labels>
            <map-boundary></map-boundary>
            <map-grid></map-grid>
            <map-polygons #polygons></map-polygons>
            <map-indices
              *ngIf="geometry.profile === 'washington'"
            ></map-indices>
            <map-scale></map-scale>
          </figure>
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

    <a #saver hidden></a>
  </ng-container>`
})
export class RootComponent implements AfterViewInit {
  @HostBinding('class.printing') printing = false;
  @HostBinding('class.withLegend') withLegend =
    this.geometry.profile === 'washington' &&
    !this.geometry.legendOnly &&
    !this.geometry.mapOnly &&
    !this.geometry.parcelsOnly;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('polygons', { static: false }) polygons: PolygonsComponent;
  @ViewChild('saver', { static: false }) saver: ElementRef;

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
    // @see Lot in parcels.ts
    // NOTE: we auto close by making the last point equal the first
    const geometry = {
      geometry: {
        coordinates: [[...this.coordinates, this.coordinates[0]]],
        type: 'Polygon'
      }
    };
    // NOTE: strip out leading & trailing { ... }
    let str = JSON.stringify(geometry);
    str = str.substring(1, str.length - 1);
    navigator.clipboard.writeText(str).then(() => {
      console.log(geometry);
    });
  }

  // NOTE: we know layerX, layerY is non-standard, but
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
        // NOTE: see lots.ts: this is the lot ID
        // NOTE: see styles.scss: only map-lots gets pointer events
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
    if (!this.printing && !this.geometry.legendOnly) {
      this.emitLots();
      this.emitPolygons();
      if (!this.geometry.parcelsOnly) this.emitImage();
    }
  }

  private emitImage(): void {
    // effect of "printing" will be to make overflow: unset
    // NOTE: necessary for print to show entire extent
    this.printing = true;
    this.cdf.markForCheck();
    // save the parcels index
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

  private emitLots(): void {
    const index = this.parcels.parcels.lots.reduce((acc, lot) => {
      acc[lot.id] = {
        address: lot.address,
        area: lot.area,
        centers: lot.centers,
        updatedAt: lot.updatedAt,
        usage: lot.usage,
        valueOfImprovement: lot.valueOfImprovement,
        valueOfLand: lot.valueOfLand,
        valueOfParcel: lot.valueOfParcel,
        yearOfCAMA: lot.yearOfCAMA
      };
      return acc;
    }, {});
    const blob = new Blob(
      [
        'export const DESC_BY_USAGE = ',
        JSON.stringify(this.parcels.parcels.descByUsage, null, 2),
        ';\n\n',
        'export const USAGES = ',
        JSON.stringify(this.parcels.parcels.usages, null, 2),
        ';\n\n',
        'export const LOTS = ',
        JSON.stringify(index, null, 2),
        ';\n\n'
      ],
      {
        type: 'text/plain;charset=utf-8'
      }
    );
    saveAs(blob, 'lots.ts');
  }

  private emitPolygons(): void {
    const blob = new Blob([this.polygons.nativeElement().innerHTML], {
      type: 'text/plain;charset=utf-8'
    });
    saveAs(blob, `${this.geometry.profile}.svg`);
  }
}
