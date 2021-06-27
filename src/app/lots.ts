import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './geometry';

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
      <ng-container *ngFor="let boundary of lot.boundaries">
        <g><path class="black" [attr.d]="path(boundary)" /></g>

        <g>
          <path class="white u{{ lot.usage }}" [attr.d]="path(boundary)" />
        </g>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LotsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  path(points: Point[]): string {
    return points.reduce((acc: string, point: Point, ix: number) => {
      const [x, y] = this.geometry.point2xy(point);
      if (ix === 0) {
        return `M ${x} ${y}`;
      } else return `${acc} L ${x} ${y}`;
    }, '');
  }
}
