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
      <ng-container *ngIf="lot.area >= 10 || geometry.profile !== 'washington'">
        <ng-container *ngFor="let center of lot.centers">
          <g *ngIf="geometry.point2xy(center) as xy">
            <text [attr.x]="xy[0]" [attr.y]="xy[1]" text-anchor="middle">
              {{ lot.id }}
            </text>
          </g>
        </ng-container>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LabelsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}
}
