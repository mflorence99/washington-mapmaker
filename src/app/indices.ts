import { Geometry } from './geometry';
import { Point } from './gps-data';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-indices',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let index of geometry.indices()">
      <g><polygon [attr.points]="polygon(index.bbox)" /></g>
    </ng-container>
  </svg>`
})
export class IndicesComponent {
  constructor(public geometry: Geometry) {}

  polygon(bbox: { bottom; left; right; top }): string {
    const points: Point[] = [
      { lat: bbox.top, lon: bbox.left },
      { lat: bbox.top, lon: bbox.right },
      { lat: bbox.bottom, lon: bbox.right },
      { lat: bbox.bottom, lon: bbox.left }
    ];
    return points
      .map((point: Point) => this.geometry.point2xy(point).join(','))
      .join(' ');
  }
}
