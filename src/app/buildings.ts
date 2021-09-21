import { Geometry } from './geometry';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-buildings',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <g [ngClass]="[geometry.profile, 'z' + geometry.zoom]">
      <polygon
        *ngFor="let points of geometry.gpsData.buildings.buildings"
        [attr.points]="pointsOf(points)"
      />
    </g>
  </svg>`
})
export class BuildingsComponent {
  constructor(public geometry: Geometry) {}

  pointsOf(points: Point[]): string {
    return points
      .map((point: Point) => this.geometry.point2xy(point).join(','))
      .join(' ');
  }
}
