import { Parcels } from './parcels';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-legend',
  template: `<header>
      <h1>Town of Washington</h1>
      <h2>Sullivan Co</h2>
      <h2>New Hampshire</h2>
    </header>

    <map-state></map-state>

    <map-county></map-county>

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
        <tr *ngFor="let usage of parcels.parcels.usages">
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
        <tr class="total">
          <td></td>
          <td class="desc">Total</td>
          <td class="numeric">
            {{ sum(parcels.parcels.areaByUsage) | number: '1.1-1' }}
          </td>
          <td class="numeric">{{ sum(parcels.parcels.countByUsage) }}</td>
        </tr>
      </tbody>
    </table>

    <article class="grids">
      <h2>Grid and Scale</h2>
      <figure>
        <div></div>
        <div></div>
        <div></div>
        <div>10 x 10 miles<br />100 sq miles</div>
      </figure>
      <figure>
        <div></div>
        <div></div>
        <div></div>
        <div>1 sq mile<br />640 acres</div>
      </figure>
      <figure>
        <div></div>
        <div></div>
        <div></div>
        <div>&#188; x &#188; mile<br />40 acres</div>
      </figure>
      <figcaption>State, County</figcaption>
      <figcaption>Washington</figcaption>
      <figcaption>Detail Maps</figcaption>
    </article>

    <footer>
      <p>For information only &mdash; {{ today | date: 'longDate' }}</p>
    </footer>`
})
export class LegendComponent {
  today = new Date();

  constructor(public parcels: Parcels) {}

  sum(byUsage: Record<string, number>): number {
    return Object.values(byUsage).reduce((p, q) => p + q, 0);
  }
}
