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
          <ng-container *ngIf="parcels.parcels.areaByUsage[usage]">
            <tr>
              <td class="usage">
                <div [ngClass]="'u' + usage" class="icon"></div>
              </td>
              <td class="desc">{{ parcels.parcels.descByUsage[usage] }}</td>
              <td class="numeric">
                {{ parcels.parcels.areaByUsage[usage] | number: '1.0-0' }}
              </td>
            </tr>

            <tr *ngIf="usage === '190'">
              <td></td>
              <td class="cu">
                <div class="icons">
                  <div class="icon">
                    <svg-icon
                      [svgStyle]="{
                        'fill': 'rgba(var(--shade-CUMH), 0.5)',
                        'height.px': 32,
                        'width.px': 32
                      }"
                      src="assets/cumh.svg"
                    ></svg-icon>
                    <div>Managed Hardwood</div>
                  </div>

                  <div class="icon">
                    <svg-icon
                      [svgStyle]="{
                        'fill': 'rgba(var(--shade-CUMW), 0.5)',
                        'height.px': 32,
                        'width.px': 32
                      }"
                      src="assets/cumw.svg"
                    ></svg-icon>
                    <div>Managed Pine</div>
                  </div>

                  <div class="icon">
                    <svg-icon
                      [svgStyle]="{
                        'fill': 'rgba(var(--shade-CUUH), 1)',
                        'height.px': 32,
                        'width.px': 32
                      }"
                      src="assets/cuuh.svg"
                    ></svg-icon>
                    <div>Unmanaged Hardwood</div>
                  </div>

                  <div class="icon">
                    <svg-icon
                      [svgStyle]="{
                        'fill': 'rgba(var(--shade-CUUW), 0.5)',
                        'height.px': 32,
                        'width.px': 32
                      }"
                      src="assets/cuuw.svg"
                    ></svg-icon>
                    <div>Unmanaged Pine</div>
                  </div>

                  <div class="icon">
                    <svg-icon
                      [svgStyle]="{
                        'fill': 'rgba(var(--shade-CUFL), 1)',
                        'height.px': 32,
                        'width.px': 32
                      }"
                      src="assets/cufl.svg"
                    ></svg-icon>
                    <div>Farmland</div>
                  </div>

                  <div class="icon">
                    <svg-icon
                      [svgStyle]="{
                        'fill': 'rgba(var(--shade-CUWL), 1)',
                        'height.px': 32,
                        'width.px': 32
                      }"
                      src="assets/cuwl.svg"
                    ></svg-icon>
                    <div>Wetland</div>
                  </div>
                </div>
              </td>
              <td></td>
            </tr>
          </ng-container>
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
  today = new Date();

  constructor(public parcels: Parcels) {}

  sum(byUsage: Record<string, number>): number {
    return Object.values(byUsage).reduce((p, q) => p + q, 0);
  }
}
