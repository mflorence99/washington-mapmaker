import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-border',
  template: `
    <div [class.hidden]="isHidden()" class="border-1">
      <div [class.hidden]="isHidden()" class="border-2">
        <div [class.hidden]="isHidden()" class="border-3">
          <ng-content></ng-content>

          <footer *ngIf="!isHidden()">
            <p>
              Sources: ArcGIS, OpenStreetMap, and parcels by LOVELAND
              Technologies at landgrid.com
            </p>
            <p>Published {{ today | date: 'longDate' }}</p>
          </footer>
        </div>
      </div>
    </div>
  `
})
export class BorderComponent {
  today = new Date();

  constructor(public geometry: Geometry) {}

  isHidden(): boolean {
    return this.geometry.mapOnly || this.geometry.parcelsOnly;
  }
}
