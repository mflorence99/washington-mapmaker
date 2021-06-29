import { Parcels } from './parcels';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';

import Chart from 'chart.js/auto';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-legend',
  template: `<header>
      <h1>Town of Washington</h1>
      <h2>Sullivan Co</h2>
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
    </table>

    <figure #wrapper class="wrapper">
      <canvas #canvas class="chart"> </canvas>
    </figure>`
})
export class LegendComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  @ViewChild('wrapper', { static: true }) wrapper: ElementRef;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  chart: Chart;

  constructor(public parcels: Parcels) {
    Chart.defaults.font.family = 'Bentham Regular';
    Chart.defaults.font.size = 16;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const canvas = this.canvas.nativeElement;
      canvas.height = this.wrapper.nativeElement.offsetHeight;
      canvas.width = this.wrapper.nativeElement.offsetWidth;
      const ctx = canvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.values(this.parcels.parcels.descByUsage),
          datasets: [
            {
              backgroundColor: this.makeColors(),
              borderWidth: 1,
              data: Object.values(this.parcels.parcels.areaByUsage)
            }
          ]
        },
        options: {
          animation: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }, 1000);
  }

  usages(): string[] {
    return Object.keys(this.parcels.parcels.descByUsage);
  }

  private makeColors(): string[] {
    const style = getComputedStyle(this.canvas.nativeElement);
    return Object.keys(this.parcels.parcels.descByUsage).map((usage) => {
      const rgb = style.getPropertyValue(`--shade-u${usage}`);
      // NOTE: horrible hack, see styles.css
      return `rgba(${rgb}, ${usage === '101' ? 1 : 0.5})`;
    });
  }
}
