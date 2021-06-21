import { Geometry } from './geometry';
import { Point } from './gps-data';
import { Profile } from './profiles';
import { PROFILES } from './profiles';

import { bbox } from './profiles';

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
    <ng-container *ngFor="let profile of profiles()">
      <g><polygon [attr.points]="polygon(profile)" /></g>
    </ng-container>
  </svg>`
})
export class IndicesComponent {
  constructor(public geometry: Geometry) {}

  polygon(profile: Profile): string {
    const rect = bbox(profile);
    const points: Point[] = [
      { lat: rect.top, lon: rect.left },
      { lat: rect.top, lon: rect.right },
      { lat: rect.bottom, lon: rect.right },
      { lat: rect.bottom, lon: rect.left }
    ];
    return points
      .map((point: Point) => this.geometry.point2xy(point).join(','))
      .join(' ');
  }

  profiles(): Profile[] {
    return Object.values(PROFILES);
  }
}
