import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-topo',
  template: `
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
  `
})
export class TopoComponent {
  constructor(public geometry: Geometry) {}
}
