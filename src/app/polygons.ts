import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';

// 👇 this is used solely for export
// 👇 dimensions are tied to clip area so that they exactly match image
// 👇 we try to make this as small as possible for export

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-polygons',
  template: `<svg
    [attr.width]="round(geometry.clip.cx)"
    [attr.height]="round(geometry.clip.cy)"
    attr.viewPort="0 0 {{ round(geometry.clip.cx) }} {{
      round(geometry.clip.cy)
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container *ngFor="let boundary of lot.boundaries">
        <g *ngIf="points(boundary) as points">
          <polygon [attr.points]="points" [id]="lot.id" />
        </g>
      </ng-container>
    </ng-container>
  </svg>`
})
export class PolygonsComponent {
  constructor(
    public geometry: Geometry,
    private host: ElementRef,
    public parcels: Parcels
  ) {}

  nativeElement(): HTMLElement {
    return this.host.nativeElement;
  }

  points(boundary: Point[]): string {
    const polygon = boundary.map((point: Point) => {
      let [x, y] = this.geometry.point2xy(point);
      // 👇 need to adjust so that the clip rectangle is the origin
      // the paths won't line up here, but they will in the app we export to
      x -= this.geometry.clip.x;
      y -= this.geometry.clip.y;
      return [this.round(x), this.round(y)];
    });
    // only emit if at least partially inside clip
    const inside = polygon.some(([x, y]) => {
      const clip = this.geometry.clip;
      return x >= 0 && x < clip.cx && y >= 0 && y < clip.cy;
    });
    return inside ? polygon.map(([x, y]) => `${x},${y}`).join(' ') : null;
  }

  round(value: number): number {
    return Math.round(value);
  }
}
