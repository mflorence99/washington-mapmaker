import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-street',
  template: `
    <ng-container *ngFor="let y of geometry.yTiles; let iy = index">
      <ng-container *ngFor="let x of geometry.xTiles; let ix = index">
        <map-tile
          *ngIf="geometry.style == 'arcgis'"
          filter="saturate(1.5)"
          [ix]="ix"
          [iy]="iy"
          src="/street/arcgis/{{ geometry.zoom }}/{{ x }}/{{ y }}"
        ></map-tile>
        <map-tile
          *ngIf="geometry.style == 'osm'"
          [alpha]="0"
          [threshold]="16"
          [transparent]="[242, 239, 233]"
          [ix]="ix"
          [iy]="iy"
          src="/street/osm/{{ geometry.zoom }}/{{ x }}/{{ y }}"
        ></map-tile>
      </ng-container>
    </ng-container>
  `
})
export class StreetComponent {
  constructor(public geometry: Geometry) {}
}
