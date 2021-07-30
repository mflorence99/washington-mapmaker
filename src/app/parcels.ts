import { Point } from './geometry';

import PARCELS from '../assets/data/parcels.json';

import * as turf from '@turf/turf';

import { Injectable } from '@angular/core';

import polylabel from 'polylabel';

const M2TOACRES = 4047;

export interface LotLabel {
  clazz?: string;
  rotate?: boolean;
  split?: boolean;
}

export interface Lot {
  address?: string;
  area: number;
  areas?: number[];
  boundaries: Point[][];
  building$: number;
  callouts: Point[];
  centers?: Point[];
  cu$?: number;
  id: string;
  labels?: LotLabel[];
  land$?: number;
  // NOTE: lot orientation in degrees
  orientations?: number[];
  owner?: string;
  // NOTE 1 means lot is more square, 0 more elongated
  sqarcities?: number[];
  taxed$?: number;
  usage?: string;
  use?: string;
}

export interface Lots {
  areaByUsage: Record<string, number>;
  descByUsage: Record<string, string>;
  descByUse: Record<string, string>;
  lots: Lot[];
  usages: string[];
  uses: string[];
}

@Injectable({ providedIn: 'root' })
export class Parcels {
  parcels: Lots = PARCELS;

  constructor() {
    const areaByUsage: Record<string, number> = {};
    this.parcels.lots.forEach((lot) => {
      const areas = this.calculateAreas(lot.boundaries);
      const perimeters = this.calculatePerimeters(lot.boundaries);
      // update any missing calculated fields
      lot.areas = lot.areas ?? areas.map((area) => area / M2TOACRES);
      lot.centers = lot.centers ?? this.calculateCenters(lot.boundaries);
      lot.orientations =
        lot.orientations ?? this.calculateOrientations(lot.boundaries);
      // @see https://gis.stackexchange.com/questions/222345/identify-shape-of-the-polygons-elongation-roundness-etc
      lot.sqarcities =
        lot.sqarcities ??
        areas.map(
          (area, ix) =>
            (area / Math.pow(perimeters[ix] * 1000, 2)) * 4 * Math.PI
        );
      // accumulate area by usage
      const acc = areaByUsage[lot.usage];
      areaByUsage[lot.usage] = acc ? acc + lot.area : lot.area;
    });
    // store area by usage
    this.parcels.areaByUsage = areaByUsage;
  }

  private calculateAreas(boundaries: Point[][]): number[] {
    let areas: number[] = [];
    areas = boundaries.reduce((acc, boundary) => {
      const points = boundary.map((point) => [point.lon, point.lat]);
      acc.push(turf.area(turf.polygon([points])));
      return acc;
    }, areas);
    return areas;
  }

  private calculateCenters(boundaries: Point[][]): Point[] {
    let centers: number[][] = [];
    centers = boundaries.reduce((acc, boundary) => {
      const points = boundary.map((point) => [point.lon, point.lat]);
      acc.push(polylabel([points]));
      return acc;
    }, centers);
    // NOTE: polylabel does a much better job of centers than turf
    // exceptbthat result is in "wrong" format
    return centers.map((center) => ({
      lat: center[1],
      lon: center[0]
    }));
  }

  private calculateOrientations(boundaries: Point[][]): number[] {
    let orientations: number[] = [];
    orientations = boundaries.reduce((acc, boundary) => {
      const points = boundary.map((point) => [point.lon, point.lat]);
      let angle = 0;
      let longest = 0;
      points.forEach((point, ix) => {
        if (ix > 0) {
          const p = turf.point(point);
          const q = turf.point(points[ix - 1]);
          const length = turf.distance(p, q);
          if (length > longest) {
            angle =
              p.geometry.coordinates[0] < q.geometry.coordinates[0]
                ? turf.bearing(p, q)
                : turf.bearing(q, p);
            longest = length;
          }
        }
      });
      // convert bearing to rotation
      acc.push(angle - 90);
      return acc;
    }, orientations);
    return orientations;
  }

  private calculatePerimeters(boundaries: Point[][]): number[] {
    let perimeters: number[] = [];
    perimeters = boundaries.reduce((acc, boundary) => {
      const points = boundary.map((point) => [point.lon, point.lat]);
      acc.push(turf.length(turf.lineString(points)));
      return acc;
    }, perimeters);
    return perimeters;
  }
}
