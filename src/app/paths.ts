import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-paths',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container *ngFor="let boundary of lot.boundaries">
        <g>
          <path [attr.d]="path(boundary)" [id]="lot.id" />
        </g>
      </ng-container>
    </ng-container>
  </svg>`
})
export class PathsComponent {
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
