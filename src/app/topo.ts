import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-topo',
  template: `
    <ng-container *ngIf="ready">
      <ng-container *ngFor="let y of geometry.yTiles; let iy = index">
        <ng-container *ngFor="let x of geometry.xTiles; let ix = index">
          <map-tile
            filter="saturate(4)"
            [ix]="ix"
            [iy]="iy"
            src="/topo/arcgis/{{ geometry.zoom }}/{{ x }}/{{ y }}"
          ></map-tile>
        </ng-container>
      </ng-container>
    </ng-container>
  `
})
export class TopoComponent {
  ready = false;

  constructor(private cdf: ChangeDetectorRef, public geometry: Geometry) {
    setTimeout(() => {
      this.ready = true;
      this.cdf.detectChanges();
    }, 10000);
  }
}
