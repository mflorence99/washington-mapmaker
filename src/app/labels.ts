import { Geometry } from './geometry';
import { Lot } from './parcels';
import { Parcels } from './parcels';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-labels',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container *ngFor="let center of lot.centers; let ix = index">
        <g
          *ngIf="geometry.point2xy(center) as xy"
          [ngClass]="[geometry.profile, 'z' + geometry.zoom]"
        >
          <text
            [attr.transform]="
              'translate(' +
              xy[0] +
              ',' +
              xy[1] +
              ') rotate(' +
              xxx(lot, ix) +
              ')'
            "
            [ngClass]="'a' + quantize(lot.area)"
            text-anchor="middle"
          >
            <tspan [attr.dy]="'0.25em'" class="id">
              {{ lot.id }}
            </tspan>
            <tspan [attr.dx]="'-4em'" [attr.dy]="'1.1em'" class="area">
              {{ round(lot.area) }} ac
            </tspan>
          </text>
        </g>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LabelsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  quantize(area: number): number {
    if (area >= 500) return 500;
    else if (area >= 100) return 100;
    else if (area >= 50) return 50;
    else if (area >= 25) return 25;
    else if (area >= 10) return 10;
    else if (area >= 5) return 5;
    else if (area >= 2) return 2;
    else if (area >= 1) return 1;
    else return 0;
  }

  round(area: number): number {
    return Math.round(area * 10) / 10;
  }

  xxx(lot: Lot, ix: number): any {
    if (lot.area > 2) return 0;
    // find the longest edge
    let maxLength = 0;
    let lp, lq;
    lot.boundaries[ix].forEach((point, iy, boundary) => {
      if (iy > 0) {
        const length = this.geometry.distance(
          boundary[iy - 1].lat,
          boundary[iy - 1].lon,
          point.lat,
          point.lon
        );
        if (length > maxLength) {
          maxLength = length;
          lp = point;
          lq = boundary[iy - 1];
        }
      }
    });
    // now find the angle of the longest edge
    const p = this.geometry.point2xy(lp);
    const q = this.geometry.point2xy(lq);
    const angle =
      p[0] < q[0]
        ? this.geometry.lineProps(p, q).angle
        : this.geometry.lineProps(q, p).angle;
    const degrees = angle * (180 / Math.PI);
    if (['14-161', '14-162'].includes(lot.id))
      console.log(lot.id, degrees, p, q);
    return degrees;
  }
}
