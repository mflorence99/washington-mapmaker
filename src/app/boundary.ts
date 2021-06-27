import { Geometry } from './geometry';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-boundary',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <g><polygon [attr.points]="boundary()" /></g>
  </svg>`
})
export class BoundaryComponent {
  constructor(public geometry: Geometry) {}

  boundary(): string {
    return this.geometry.gpsData.boundary.Boundary.map((point: Point) =>
      this.geometry.point2xy(point).join(',')
    ).join(' ');
  }
}
