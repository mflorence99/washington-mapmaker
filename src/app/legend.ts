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
        </tr>
      </thead>
      <tbody>
        <ng-container *ngFor="let usage of parcels.parcels.usages">
          <tr>
            <td class="usage">
              <figure [ngClass]="'u' + usage" class="key"></figure>
            </td>
            <td class="desc">{{ parcels.parcels.descByUsage[usage] }}</td>
            <td class="numeric">
              {{ parcels.parcels.areaByUsage[usage] | number: '1.0-0' }}
            </td>
          </tr>

          <tr *ngIf="usage === '190'">
            <td></td>
            <td class="cu">
              <article class="keys">
                <figure *ngFor="let cuKey of cuKeys" class="key">
                  <svg-icon
                    [src]="cuKey.icon"
                    [svgStyle]="{
                      fill: cuKey.fill,
                      height: '32px',
                      width: '32px'
                    }"
                  ></svg-icon>
                  <figcaption>
                    {{ parcels.parcels.descByUse[cuKey.use] }}
                  </figcaption>
                </figure>
              </article>
            </td>
            <td></td>
          </tr>
        </ng-container>

        <tr class="total">
          <td></td>
          <td class="desc">Total</td>
          <td class="numeric">
            {{ sum(parcels.parcels.areaByUsage) | number: '1.0-0' }}
          </td>
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
  cuKeys = [
    {
      fill: 'rgba(var(--shade-CUMH), 0.5)',
      icon: 'assets/cumh.svg',
      use: 'CUMH'
    },
    {
      fill: 'rgba(var(--shade-CUMW), 0.5)',
      icon: 'assets/cumw.svg',
      use: 'CUMW'
    },
    {
      fill: 'rgba(var(--shade-CUUH), 0.75)',
      icon: 'assets/cuuh.svg',
      use: 'CUUH'
    },
    {
      fill: 'rgba(var(--shade-CUUW), 0.75)',
      icon: 'assets/cuuw.svg',
      use: 'CUUW'
    },
    {
      fill: 'rgba(var(--shade-CUFL), 1)',
      icon: 'assets/cufl.svg',
      use: 'CUFL'
    },
    {
      fill: 'rgba(var(--shade-CUWL), 1)',
      icon: 'assets/cuwl.svg',
      use: 'CUWL'
    }
  ];
  today = new Date();

  constructor(public parcels: Parcels) {}

  sum(byUsage: Record<string, number>): number {
    return Object.values(byUsage).reduce((p, q) => p + q, 0);
  }
}
