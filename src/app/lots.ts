import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-lots',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container *ngFor="let boundary of lot.boundaries">
        <ng-container *ngIf="path(boundary) as outline">
          <g [ngClass]="[geometry.profile, 'z' + geometry.zoom]">
            <!-- 
              👇 no idea what is wrong with 20-48 outline
                 it causes large triangular shadow when printing
                 possible out of order point?
                 but looks good when exported to viking 
            -->
            <path *ngIf="lot.id !== '20-48'" class="black" [attr.d]="outline" />

            <path
              class="white u{{ lot.usage }} {{ lot.use }}"
              [attr.d]="outline"
              [id]="lot.id"
            />
          </g>
        </ng-container>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LotsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  path(points: Point[]): string {
    return points.reduce((acc: string, point: Point, ix: number) => {
      const [x, y] = this.geometry.point2xy(point);
      if (ix === 0) {
        return `M ${x} ${y}`;
      } else return `${acc} L ${x} ${y}`;
    }, '');
  }
}
