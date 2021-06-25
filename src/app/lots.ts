import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './gps-data';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-lots',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container [ngSwitch]="lot.geometry.type">
        <ng-container *ngSwitchCase="'Polygon'">
          <ng-container *ngFor="let polygon of lot.geometry.coordinates">
            <g><path class="black" [attr.d]="path(polygon)" /></g>
            <g>
              <path
                class="white u{{ lot.properties.usecode }}"
                [attr.d]="path(polygon)"
              />
            </g>
          </ng-container>
        </ng-container>

        <ng-container *ngSwitchCase="'MultiPolygon'">
          <ng-container *ngFor="let multipolygon of lot.geometry.coordinates">
            <ng-container *ngFor="let polygon of multipolygon">
              <g><path class="black" [attr.d]="path(polygon)" /></g>
              <g><path class="white" [attr.d]="path(polygon)" /></g>
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LotsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  path(points: [[number, number]]): string {
    return points
      .map(
        (point: [number, number]): Point => ({ lat: point[1], lon: point[0] })
      )
      .reduce((acc: string, point: Point, ix: number) => {
        const [x, y] = this.geometry.point2xy(point);
        if (ix === 0) {
          return `M ${x} ${y}`;
        } else return `${acc} L ${x} ${y}`;
      }, '');
  }
}
