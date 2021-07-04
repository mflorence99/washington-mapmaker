import { Geometry } from './geometry';
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
                [ngClass]="classOf(lot, ix)"
              ></line>
              <text
                [attr.transform]="'translate(' + xy[0] + ',' + xy[1] + ')'"
                [ngClass]="classOf(lot, ix)"
                text-anchor="middle"
              >
                <tspan class="id">
                  {{ lot.id }}
                </tspan>
                <tspan *ngIf="!smallLot(lot, ix)" class="area">
                  &nbsp;{{ round(lot.area) }} ac
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
              [attr.transform]="
                'translate(' +
                xy[0] +
                ',' +
                xy[1] +
                ') rotate(' +
                rotation(lot, ix) +
                ')'
              "
              [ngClass]="classOf(lot, ix)"
              text-anchor="middle"
            >
              <tspan [attr.dy]="'0.25em'" class="id">
                {{ lot.id }}
              </tspan>

              <tspan
                *ngIf="splitation(lot, ix); else joined"
                [attr.x]="0"
                [attr.dy]="'1.1em'"
                class="area"
              >
                {{ round(lot.area) }} ac
              </tspan>

              <ng-template #joined>
                <tspan class="area">&nbsp;{{ round(lot.area) }} ac</tspan>
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

  classOf(lot: Lot, ix: number): string {
    const area = lot.areas[ix];
    const label = lot.labels?.[ix];
    return label?.clazz ?? `a${this.quantize(area)}`;
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

  rotation(lot: Lot, ix: number): number {
    const label = lot.labels?.[ix];
    const rotate =
      label?.rotate === undefined ? this.smallLot(lot, ix) : label?.rotate;
    return rotate ? lot.orientations[ix] : 0;
  }

  round(area: number): number {
    return Math.round(area * 10) / 10;
  }

  smallLot(lot: Lot, ix: number): boolean {
    return lot.areas[ix] < 25;
  }

  splitation(lot: Lot, ix: number): boolean {
    const label = lot.labels?.[ix];
    return label?.split === undefined
      ? !this.smallLot(lot, ix) || this.squareLot(lot, ix)
      : label?.split;
  }

  squareLot(lot: Lot, ix: number): boolean {
    return lot.sqarcities[ix] > 0.6;
  }
}
