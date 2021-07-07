import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

// NOTE: this is used solely for export
// NOTE: dimensions are tied to clip area so that they exactly match image

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-paths',
  template: `<svg
    [attr.width]="geometry.clip.cx"
    [attr.height]="geometry.clip.cy"
    attr.viewPort="0 0 {{ geometry.clip.cx }} {{ geometry.clip.cy }}"
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
      let [x, y] = this.geometry.point2xy(point);
      // NOTE: need to adjust so that the clip rectangle is the origin
      // the paths won't line up here, but they will in the app we export to
      x -= this.geometry.clip.x;
      y -= this.geometry.clip.y;
      if (ix === 0) {
        return `M ${x} ${y}`;
      } else return `${acc} L ${x} ${y}`;
    }, '');
  }
}
