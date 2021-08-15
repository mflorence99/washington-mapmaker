import { PARCELS } from '../src/app/parcel-data';

import * as turf from '@turf/turf';

import { writeFileSync } from 'fs';

import delay from 'delay';
import fetch from 'node-fetch';

interface Point {
  lat: number;
  lon: number;
}

async function calculateElevations(centers: Point[]): Promise<number[]> {
  const elevations: number[] = [];
  for (let ix = 0; ix < centers.length; ix++) {
    const response = await fetch(
      `http://nationalmap.gov/epqs/pqs.php?x=${centers[ix].lon}&y=${centers[ix].lat}&units=feet&output=json`
    );
    const json = await response.json();
    const elevation =
      json['USGS_Elevation_Point_Query_Service']['Elevation_Query'][
        'Elevation'
      ];
    elevations.push(Number(elevation));
  }
  return elevations;
}

function calculateLengths(boundaries: Point[][]): number[][] {
  let lengths: number[][] = [];
  lengths = boundaries.reduce((acc, boundary) => {
    const points = boundary.map((point) => [point.lon, point.lat]);
    const length = [];
    for (let ix = 1; ix < points.length; ix++) {
      const miles = turf.length(turf.lineString(points.slice(ix - 1, ix + 1)), {
        units: 'miles'
      });
      length.push(miles * 5280);
    }
    acc.push(length);
    return acc;
  }, lengths);
  return lengths;
}

function calculatePerimeters(boundaries: Point[][]): number[] {
  let perimeters: number[] = [];
  perimeters = boundaries.reduce((acc, boundary) => {
    const points = boundary.map((point) => [point.lon, point.lat]);
    const miles = turf.length(turf.lineString(points), { units: 'miles' });
    acc.push(miles * 5280);
    return acc;
  }, perimeters);
  return perimeters;
}

async function main(): Promise<void> {
  for (let ix = 0; ix < PARCELS.lots.length; ix++) {
    const lot = PARCELS.lots[ix];
    console.log(lot.id);
    try {
      lot['elevations'] ??= await calculateElevations(lot.centers);
    } catch (error) {
      console.error(error);
    }
    lot['lengths'] ??= calculateLengths(lot.boundaries);
    lot['perimeters'] ??= calculatePerimeters(lot.boundaries);
    await delay(1000);
  }
  writeFileSync(
    'src/app/parcel-data2.ts',
    'export const PARCELS = ' + JSON.stringify(PARCELS, null, 2) + ';'
  );
}

main();
