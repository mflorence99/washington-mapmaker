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
    </defs>
  </svg>`
})
export class DefsComponent {
  constructor(public parcels: Parcels) {}
}
