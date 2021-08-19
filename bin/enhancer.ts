import { PARCELS } from '../src/app/parcel-data';

import * as turf from '@turf/turf';

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import delay from 'delay';
import fetch from 'node-fetch';
import parse from 'csv-parse/lib/sync';
import polylabel from 'polylabel';

interface Point {
  lat: number;
  lon: number;
}

const assessors = parse(
  readFileSync('src/assets/data/assessor.csv').toString(),
  {
    columns: [
      undefined,

      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,

      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,

      'map',
      'lot',
      'sub',
      undefined,
      'address',
      'owner',
      'area',
      'zone',
      'neighborhood',
      'use',

      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,

      'building$',
      'land$',
      undefined,
      'cu$',
      'taxed$',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    skip_empty_lines: true
  }
);

const assessorsByID = assessors.reduce((acc, record) => {
  let id = `${parseInt(record.map, 10)}-${parseInt(record.lot, 10)}`;
  if ('000000' !== record.sub) {
    let sub = record.sub;
    while (sub.length > 2 && sub[0] === '0') sub = sub.slice(1);
    id = `${id}-${sub}`;
  }
  acc[id] = record;
  return acc;
}, {});

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

function uniquifyLots(): void {
  const lotByID = {};
  PARCELS.lots.forEach((lot) => {
    if (lotByID[lot.id]) {
      console.error('DUPLICATE', lot.id);
      const orig = lotByID[lot.id];
      const dupe = lot;
      orig.areas = orig.areas.concat(dupe.areas);
      orig.boundaries = orig.boundaries.concat(dupe.boundaries);
      orig.callouts = orig.callouts.concat(dupe.callouts);
      orig.centers = orig.centers.concat(dupe.centers);
      orig.elevations = orig.elevations.concat(dupe.elevations);
      orig.labels = orig.labels.concat(dupe.labels);
      orig.lengths = orig.lengths.concat(dupe.lengths);
      orig.orientations = orig.orientations.concat(dupe.orientations);
      orig.perimeters = orig.perimeters.concat(dupe.perimeters);
      orig.sqarcities = orig.sqarcities.concat(dupe.sqarcities);
    } else lotByID[lot.id] = lot;
  });
  // put back the deduped and sorted lots
  PARCELS.lots = Object.values<any>(lotByID).sort((p, q) =>
    p.id.localeCompare(q.id)
  );
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

async function main(): Promise<void> {
  // first, remove any duplicates
  uniquifyLots();
  // next, fix them up
  for (let ix = 0; ix < PARCELS.lots.length; ix++) {
    const lot = PARCELS.lots[ix];
    // console.log(lot.id);
    validateLot(lot);
    try {
      lot.elevations ??= await calculateElevations(lot.centers);
    } catch (error) {
      console.error(error);
    }
    if (lot.boundaries.length !== lot.centers.length)
      lot.centers = calculateCenters(lot.boundaries);
    lot.lengths = calculateLengths(lot.boundaries);
    lot.perimeters = calculatePerimeters(lot.boundaries);
    // new assessor data
    lot['neighborhood'] = assessorsByID[lot.id]?.neighborhood;
    lot['zone'] = assessorsByID[lot.id]?.zone;
  }
  writeFileSync(
    'src/app/parcel-data2.ts',
    'export const PARCELS = ' + JSON.stringify(PARCELS, null, 2) + ';'
  );
}

main();
