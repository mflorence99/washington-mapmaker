import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

// NOTE: don't know why ArcGIS has x, y backwards!

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-street',
  template: `
    <ng-container *ngFor="let y of yTiles; let iy = index">
      <ng-container *ngFor="let x of xTiles; let ix = index">
        <map-tile
          [ix]="ix"
          [iy]="iy"
          src="/street/tile/{{ geometry.zoom }}/{{ y + iy }}/{{ x + ix }}"
        ></map-tile>
      </ng-container>
    </ng-container>
  `
})
export class StreetComponent {
  xTiles = new Array(this.geometry.dims.numXTiles).fill(
    this.geometry.tiles.left
  );
  yTiles = new Array(this.geometry.dims.numYTiles).fill(
    this.geometry.tiles.top
  );

  constructor(public geometry: Geometry) {}
}
