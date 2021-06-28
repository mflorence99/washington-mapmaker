import { Parcels } from './parcels';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-legend',
  template: `<header>
      <h1>Town of Washington</h1>
      <h2>New Hampshire</h2>
    </header>
    <table class="usage">
      <thead>
        <tr>
          <td></td>
          <td></td>
          <td class="numeric">Acres</td>
          <td class="numeric">Lots</td>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let usage of usages()">
          <td class="usage">
            <div class="lot">
              <div [ngClass]="'u' + usage"></div>
            </div>
          </td>
          <td class="desc">{{ parcels.parcels.descByUsage[usage] }}</td>
          <td class="numeric">
            {{ parcels.parcels.areaByUsage[usage] | number: '1.1-1' }}
          </td>
          <td class="numeric">{{ parcels.parcels.countByUsage[usage] }}</td>
        </tr>
      </tbody>
    </table>`
})
export class LegendComponent {
  constructor(public parcels: Parcels) {}

  usages(): string[] {
    return Object.keys(this.parcels.parcels.descByUsage);
  }
}
