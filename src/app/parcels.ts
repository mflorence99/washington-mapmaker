import { Geometry } from './geometry';
import { Point } from './gps-data';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Parcel {
  address: string;
  fid: string;
  geo: {
    coordinates: [[[number, number]]];
    type: 'Polygon';
  };
  path: string;
  pid: string;
}

export type Parcels = Record<string, Parcel>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-parcels',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <ng-container *ngIf="parcels$ | async as parcels">
      <ng-container *ngFor="let parcel of parcels | keyvalue">
        <ng-container *ngFor="let polygon of parcel.value.geo.coordinates">
          <g><path [attr.d]="path(polygon)" /></g>
        </ng-container>
      </ng-container>
    </ng-container>
  </svg>`
})
export class ParcelsComponent {
  parcels$: Observable<Parcels> = this.http.get<Parcels>(
    '/assets/data/parcels.json'
  );

  constructor(public geometry: Geometry, private http: HttpClient) {}

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
