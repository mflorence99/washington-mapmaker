import { Geometry } from './geometry';
import { LineProps } from './geometry';
import { Lot } from './parcels';
import { Parcels } from './parcels';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-lot-labels',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container *ngFor="let center of lot.centers; let ix = index">
        <ng-container *ngIf="lot.callouts[ix] as callout; else standard">
          <g
            *ngIf="geometry.point2xy(callout) as xy"
            [ngClass]="[geometry.profile, 'z' + geometry.zoom]"
            class="callout"
          >
            <g *ngIf="geometry.point2xy(center) as pq">
              <line
                [attr.x1]="pq[0]"
                [attr.y1]="pq[1]"
                [attr.x2]="xy[0]"
                [attr.y2]="xy[1]"
              ></line>
              <text
                [attr.transform]="'translate(' + xy[0] + ',' + xy[1] + ')'"
                [ngClass]="'a' + quantize(lot.areas[ix])"
                text-anchor="middle"
              >
                <tspan class="id">
                  {{ lot.id }}
                </tspan>
              </text>
            </g>
          </g>
          >
        </ng-container>

        <ng-template #standard>
          <g
            *ngIf="geometry.point2xy(center) as xy"
            [ngClass]="[geometry.profile, 'z' + geometry.zoom]"
          >
            <text
              *ngIf="rotate(lot, ix) as props"
              [attr.transform]="
                'translate(' +
                xy[0] +
                ',' +
                xy[1] +
                ') rotate(' +
                props.angle +
                ')'
              "
              [ngClass]="'a' + quantize(lot.areas[ix])"
              text-anchor="middle"
            >
              <tspan [attr.dy]="'0.25em'" class="id">
                {{ lot.id }}
              </tspan>

              <tspan
                *ngIf="forceSplit(lot, ix); else joined"
                [attr.x]="0"
                [attr.dy]="'1.1em'"
                class="area"
              >
                {{ round(lot.area) }} ac
              </tspan>

              <ng-template #joined>
                <tspan *ngIf="props.length >= 80" class="area">
                  &nbsp;{{ round(lot.area) }} ac
                </tspan>
              </ng-template>
            </text>
          </g>
        </ng-template>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LotLabelsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  forceRotate(lot: Lot, ix: number): boolean {
    const label = lot.labels?.[ix];
    return label?.rotate === undefined ? lot.areas[ix] < 25 : label?.rotate;
  }

  forceSplit(lot: Lot, ix: number): boolean {
    const label = lot.labels?.[ix];
    const shapeIndex = lot.shapeIndices[ix];
    // const MAGIC = 160; // TODO: works for z17, will need adjusting
    // if (lot.id === '16-70-23') console.log(props);
    // return labels?.split === undefined ? props.length < MAGIC : labels?.split;
    return label?.split === undefined ? shapeIndex > 0.6 : label?.split;
  }

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

  rotate(lot: Lot, ix: number): LineProps {
    if (!this.forceRotate(lot, ix)) return { angle: 0, length: 0 };
    // find the length of the longest edge
    let longest = 0;
    let lp, lq;
    lot.boundaries[ix].forEach((point, iy, boundary) => {
      if (iy > 0) {
        const length = this.geometry.distance(
          boundary[iy - 1].lat,
          boundary[iy - 1].lon,
          point.lat,
          point.lon
        );
        if (length > longest) {
          longest = length;
          lp = point;
          lq = boundary[iy - 1];
        }
      }
    });
    // now find the angle of the longest edge
    const p = this.geometry.point2xy(lp);
    const q = this.geometry.point2xy(lq);
    const props =
      p[0] < q[0]
        ? this.geometry.lineProps(p, q)
        : this.geometry.lineProps(q, p);
    return props;
  }

  round(area: number): number {
    return Math.round(area * 10) / 10;
  }
}
