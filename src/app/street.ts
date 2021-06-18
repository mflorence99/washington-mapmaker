import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

// NOTE: don't know why ArcGIS has x, y backwards!

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-street',
  template: `
    <ng-container *ngFor="let y of geometry.yTiles; let iy = index">
      <ng-container *ngFor="let x of geometry.xTiles; let ix = index">
        <map-tile
          [ix]="ix"
          [iy]="iy"
          src="/street/tile/{{ geometry.zoom }}/{{ y }}/{{ x }}"
        ></map-tile>
      </ng-container>
    </ng-container>
  `
})
export class StreetComponent {
  constructor(public geometry: Geometry) {}
}
