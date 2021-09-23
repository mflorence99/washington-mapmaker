import { Geometry } from './geometry';
import { Point } from './geometry';
import { Rectangle } from './geometry';
import { XY } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

interface Circle {
  r: number;
  xy: XY;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-symbols',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <g [ngClass]="[geometry.profile, 'z' + geometry.zoom]">
      <ng-container
        *ngFor="let outline of geometry.gpsData.buildings.buildings"
      >
        <circle
          *ngIf="circleFrom(outline) as circle"
          [attr.cx]="circle.xy[0]"
          [attr.cy]="circle.xy[1]"
          [attr.r]="circle.r"
        ></circle>
      </ng-container>
    </g>
  </svg>`
})
export class SymbolsComponent {
  constructor(public geometry: Geometry) {}

  circleFrom(outline: Point[]): Circle {
    const bbox: Rectangle = {
      bottom: Number.MIN_SAFE_INTEGER,
      left: Number.MAX_SAFE_INTEGER,
      top: Number.MAX_SAFE_INTEGER,
      right: Number.MIN_SAFE_INTEGER
    };
    outline.forEach((point: Point) => {
      const [x, y] = this.geometry.point2xy(point);
      bbox.right = Math.max(bbox.right, x);
      bbox.top = Math.min(bbox.top, y);
      bbox.left = Math.min(bbox.left, x);
      bbox.bottom = Math.max(bbox.bottom, y);
    });
    bbox.width = bbox.right - bbox.left;
    bbox.height = bbox.bottom - bbox.top;
    return {
      xy: [bbox.left + bbox.width / 2, bbox.top + bbox.height / 2],
      r: Math.max(3, Math.min(bbox.width, bbox.height) * 0.75)
    };
  }
}
