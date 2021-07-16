import { Geometry } from './geometry';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-boundary',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <g><polygon [attr.points]="points()" /></g>
  </svg>`
})
export class BoundaryComponent {
  @Input() boundary: 'boundary' | 'nh' | 'sullivan' | 'washington' = 'boundary';

  constructor(public geometry: Geometry) {}

  points(): string {
    return this.geometry.gpsData[this.boundary].Boundary.map((point: Point) =>
      this.geometry.point2xy(point).join(',')
    ).join(' ');
  }
}
