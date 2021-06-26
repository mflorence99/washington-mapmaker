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
      <ng-container *ngIf="lot.properties.ll_gisacre >= 10">
        <ng-container *ngFor="let center of lot.properties.centers">
          <g *ngIf="geometry.point2xy(center) as xy">
            <text [attr.x]="xy[0]" [attr.y]="xy[1]" text-anchor="middle">
              {{ lotID(lot.properties) }}
            </text>
          </g>
        </ng-container>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LabelsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  lotID(properties: any): string {
    if (!properties.displayid) return '';
    const parts = properties.displayid.split('-');
    const base = `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}`;
    return ['0', '00'].includes(parts[2]) ? base : `${base}-${parts[2]}`;
  }
}
