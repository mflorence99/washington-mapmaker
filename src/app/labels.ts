import { Geometry } from './geometry';
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
      <ng-container *ngFor="let center of lot.centers">
        <g
          *ngIf="geometry.point2xy(center) as xy"
          [ngClass]="[geometry.profile, 'z' + geometry.zoom]"
        >
          <text [attr.x]="xy[0]" [attr.y]="xy[1]" text-anchor="middle">
            <tspan [ngClass]="'a' + quantize(lot.area)" class="id">
              {{ lot.id }}
            </tspan>
            <tspan
              [attr.x]="xy[0]"
              [attr.dy]="'1.1em'"
              [ngClass]="'a' + quantize(lot.area)"
              class="area"
            >
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
}
