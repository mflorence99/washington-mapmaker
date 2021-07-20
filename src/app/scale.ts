import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-scale',
  template: `<div
    *ngIf="!isHidden()"
    [ngStyle]="{
      'width.px':
        (geometry.scale.cxFeet / geometry.dims.cxFeet) * geometry.clip.cx
    }"
  ></div>`
})
export class ScaleComponent {
  constructor(public geometry: Geometry) {}

  isHidden(): boolean {
    return false;
    // TODO return this.geometry.mapOnly || this.geometry.parcelsOnly;
  }
}
