import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-scale',
  template: `<div class="annotations">
      <div
        *ngFor="let unit of geometry.scale.numUnits + 1 | times"
        class="annotation"
      >
        {{ unit * geometry.scale.ftUnit }}'
      </div>
    </div>
    <div class="units">
      <div
        *ngFor="
          let unit of geometry.scale.numUnits | times;
          odd as white;
          even as black
        "
        [class.black]="black"
        [class.white]="white"
        class="unit"
      ></div>
    </div>`
})
export class ScaleComponent {
  constructor(public geometry: Geometry) {}
}
