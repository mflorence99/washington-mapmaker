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
          [alpha]="0"
          [threshold]="16"
          [transparent]="[242, 239, 233]"
          [ix]="ix"
          [iy]="iy"
          src="/street/{{ geometry.zoom }}/{{ x }}/{{ y }}.png"
        ></map-tile>
      </ng-container>
    </ng-container>
  `
})
export class StreetComponent {
  constructor(public geometry: Geometry) {}
}
