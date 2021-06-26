import { Geometry } from './geometry';
import { Parcels } from './parcels';
import { Point } from './gps-data';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-lots',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngFor="let lot of parcels.parcels.lots">
      <ng-container [ngSwitch]="lot.geometry.type">
        <ng-container *ngSwitchCase="'Polygon'">
          <ng-container *ngFor="let polygon of lot.geometry.coordinates">
            <ng-container
              *ngTemplateOutlet="
                lotTemplate;
                context: {
                  lot: { polygon: polygon, properties: lot.properties }
                }
              "
            ></ng-container>
          </ng-container>
        </ng-container>

        <ng-container *ngSwitchCase="'MultiPolygon'">
          <ng-container *ngFor="let multipolygon of lot.geometry.coordinates">
            <ng-container *ngFor="let polygon of multipolygon">
              <ng-container
                *ngTemplateOutlet="
                  lotTemplate;
                  context: {
                    lot: { polygon: polygon, properties: lot.properties }
                  }
                "
              ></ng-container>
            </ng-container>
          </ng-container>
        </ng-container>

        <ng-template #lotTemplate let-lot="lot">
          <g><path class="black" [attr.d]="path(lot.polygon)" /></g>

          <g>
            <path
              class="white u{{ lot.properties.usecode }}"
              [attr.d]="path(lot.polygon)"
            />
          </g>

          <ng-container *ngIf="lot.properties.ll_gisacre >= 10">
            <ng-container *ngIf="geometry.point2xy(center(lot.polygon)) as xy">
              <g>
                <text [attr.x]="xy[0]" [attr.y]="xy[1]" text-anchor="middle">
                  {{ lotID(lot.properties) }}
                </text>
              </g>
            </ng-container>
          </ng-container>
        </ng-template>
      </ng-container>
    </ng-container>
  </svg>`
})
export class LotsComponent {
  constructor(public geometry: Geometry, public parcels: Parcels) {}

  center(polygon: number[][]): Point {
    const points: Point[] = polygon.map(([lon, lat]) => ({ lat, lon }));
    let bottom = Number.MAX_SAFE_INTEGER;
    let left = Number.MAX_SAFE_INTEGER;
    let top = Number.MIN_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    points.forEach((point: Point) => {
      right = Math.max(right, point.lon);
      top = Math.max(top, point.lat);
      left = Math.min(left, point.lon);
      bottom = Math.min(bottom, point.lat);
    });
    return {
      lat: top - (top - bottom) / 2,
      lon: left + (right - left) / 2
    };
  }

  lotID(properties: any): string {
    if (!properties.displayid) return '';
    const parts = properties.displayid.split('-');
    const base = `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}`;
    return parts[2] === '00' ? base : `${base}-${parseInt(parts[2], 10)}`;
  }

  path(points: [[number, number]]): string {
    return points
      .map(
        (point: [number, number]): Point => ({ lat: point[1], lon: point[0] })
      )
      .reduce((acc: string, point: Point, ix: number) => {
        const [x, y] = this.geometry.point2xy(point);
        if (ix === 0) {
          return `M ${x} ${y}`;
        } else return `${acc} L ${x} ${y}`;
      }, '');
  }
}
