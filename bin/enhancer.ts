import { PARCELS } from '../src/app/parcel-data';
import polylabel from 'polylabel';

import * as turf from '@turf/turf';

import { writeFileSync } from 'fs';

import delay from 'delay';
import fetch from 'node-fetch';

interface Point {
  lat: number;
  lon: number;
}

function calculateCenters(boundaries: Point[][]): Point[] {
  let centers: number[][] = [];
  centers = boundaries.reduce((acc, boundary) => {
    const points = boundary.map((point) => [point.lon, point.lat]);
    const center = polylabel([points]);
    acc.push(center);
    return acc;
  }, centers);
  return centers.map((center) => ({
    lat: center[1],
    lon: center[0]
  }));
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
    await delay(1000);
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

function sortBoundariesClockwise(
  boundaries: Point[][],
  centers: Point[]
): Point[][] {
  const sorteds: Point[][] = [];
  boundaries.forEach((boundary, ix) => {
    const center = centers[ix];
    const sorted = boundary.slice();
    // 👀 https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
    sorted.sort(
      (a, b) =>
        (a.lon - center.lon) * (b.lat - center.lat) -
        (b.lon - center.lon) * (a.lat - center.lat)
    );
    sorteds.push(sorted);
  });
  return sorteds;
}

function validateLot(lot: any): void {
  if (lot.boundaries.length !== lot.areas.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} areas=${lot.areas.length}`
    );
  if (lot.boundaries.length !== lot.centers.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} centers=${lot.centers.length}`
    );
  if (lot.boundaries.length !== lot.orientations.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} orientations=${lot.orientations.length}`
    );
  if (lot.boundaries.length !== lot.sqarcities.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} sqarcities=${lot.sqarcities.length}`
    );
  if (lot.boundaries.length !== lot.elevations.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} elevations=${lot.elevations.length}`
    );
  if (lot.boundaries.length !== lot.lengths.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} lengths=${lot.lengths.length}`
    );
  if (lot.boundaries.length !== lot.perimeters.length)
    console.error(
      `MISMATCH boundaries=${lot.boundaries.length} perimeters=${lot.perimeters.length}`
    );
}

function main(): void {
  for (let ix = 0; ix < PARCELS.lots.length; ix++) {
    const lot = PARCELS.lots[ix];
    console.log(lot.id);
    validateLot(lot);
    try {
      // lot.elevations ??= await calculateElevations(lot.centers);
    } catch (error) {
      console.error(error);
    }
    if (lot.boundaries.length !== lot.centers.length)
      lot.centers = calculateCenters(lot.boundaries);
    // lot.boundaries = sortBoundariesClockwise(lot.boundaries, lot.centers);
    lot.lengths = calculateLengths(lot.boundaries);
    lot.perimeters = calculatePerimeters(lot.boundaries);
  }
  writeFileSync(
    'src/app/parcel-data2.ts',
    'export const PARCELS = ' + JSON.stringify(PARCELS, null, 2) + ';'
  );
}

main();
