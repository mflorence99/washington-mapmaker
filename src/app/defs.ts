import { Parcels } from './parcels';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-defs',
  template: `<svg>
    <defs>
      <!-- PATTERN: HALFTONE -->
      <pattern
        *ngFor="let usage of parcels.parcels.usages"
        [attr.id]="'halftone-u' + usage"
        patternUnits="userSpaceOnUse"
        width="4"
        height="4"
      >
        <g [attr.fill]="'rgba(var(--shade-u' + usage + ', 0.75)'">
          <rect x="0" y="0" width="2" height="2" />
          <rect x="2" y="2" width="2" height="2" />
        </g>
      </pattern>

      <!-- PATTERN: CUMH -->
      <pattern
        id="cumh"
        x="0"
        y="0"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        patternUnits="userSpaceOnUse"
      >
        <image width="300" height="300" xlink:href="assets/cumh-pattern.svg" />
      </pattern>

      <!-- PATTERN: CUMW -->
      <pattern
        id="cumw"
        x="0"
        y="0"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        patternUnits="userSpaceOnUse"
      >
        <image width="300" height="300" xlink:href="assets/cumw-pattern.svg" />
      </pattern>

      <!-- PATTERN: CUUH -->
      <pattern
        id="cuuh"
        x="0"
        y="0"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        patternUnits="userSpaceOnUse"
      >
        <image width="300" height="300" xlink:href="assets/cuuh-pattern.svg" />
      </pattern>

      <!-- PATTERN: CUUW -->
      <pattern
        id="cuuw"
        x="0"
        y="0"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        patternUnits="userSpaceOnUse"
      >
        <image width="300" height="300" xlink:href="assets/cuuw-pattern.svg" />
      </pattern>

      <!-- PATTERN: CUFL -->
      <pattern
        id="cufl"
        x="0"
        y="0"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        patternUnits="userSpaceOnUse"
      >
        <image width="300" height="300" xlink:href="assets/cufl-pattern.svg" />
      </pattern>

      <!-- PATTERN: CUWL -->
      <pattern
        id="cuwl"
        x="0"
        y="0"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        patternUnits="userSpaceOnUse"
      >
        <image width="300" height="300" xlink:href="assets/cuwl-pattern.svg" />
      </pattern>
    </defs>
  </svg>`
})
export class DefsComponent {
  constructor(public parcels: Parcels) {}
}
