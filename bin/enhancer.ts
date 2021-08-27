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

function calculateAreas(boundaries: Point[][]): number[] {
  let areas: number[] = [];
  areas = boundaries.reduce((acc, boundary) => {
    const points = boundary.map((point) => [point.lon, point.lat]);
    const area = turf.area(turf.polygon([points]));
    acc.push(area / 4047);
    return acc;
  }, areas);
  return areas;
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

function calculateMinWidths(boundaries: Point[][]): number[] {
  let minWidths: number[] = [];
  minWidths = boundaries.reduce((acc, boundary) => {
    const points = boundary.map((point) => [point.lon, point.lat]);
    const theta = orientation(points);
    const polygon = turf.polygon([points]);
    const rotated = turf.transformRotate(polygon, theta * -1);
    const [minX, minY, , maxY] = turf.bbox(rotated);
    const from = turf.point([minX, minY]);
    const to = turf.point([minX, maxY]);
    const minWidth = turf.distance(from, to, { units: 'miles' });
    acc.push(minWidth * 5280);
    return acc;
  }, minWidths);
  return minWidths;
}

function calculateOrientations(boundaries: Point[][]): number[] {
  let orientations: number[] = [];
  orientations = boundaries.reduce((acc, boundary) => {
    const points = boundary.map((point) => [point.lon, point.lat]);
    acc.push(orientation(points));
    return acc;
  }, orientations);
  return orientations;
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

function calculateSqarcities(areas: number[], perimeters: number[]): number[] {
  return areas.map((_, ix) => {
    // 👇 need area back in m2 and perimeter in meters
    const area = areas[ix] * 4047;
    const perimeter = perimeters[ix] * 0.3048;
    return (area / Math.pow(perimeter, 2)) * 4 * Math.PI;
  });
}

function fixBoundaries(lot): void {
  lot.boundaries.forEach((points) => {
    const first = points[0];
    const last = points[points.length - 1];
    if (first.lat !== last.lat && first.lon !== last.lon) points.push(first);
  });
}

function normalizeAddress(address: string): string {
  let normalized = address.trim();
  normalized = normalized.replace(/ RD$/, ' ROAD');
  normalized = normalized.replace(/ DR$/, ' DRIVE');
  normalized = normalized.replace(/ CIR$/, ' CIRCLE');
  normalized = normalized.replace(/ TER$/, ' TERRACE');
  normalized = normalized.replace(/ TERR$/, ' TERRACE');
  normalized = normalized.replace(/ LN$/, ' LANE');
  normalized = normalized.replace(/ ST$/, ' STREET');

  normalized = normalized.replace(/^E /, 'EAST ');
  normalized = normalized.replace(/^N /, 'NORTH ');
  normalized = normalized.replace(/^NO /, 'NORTH ');
  normalized = normalized.replace(/^S /, 'SOUTH ');
  normalized = normalized.replace(/^SO /, 'SOUTH ');

  normalized = normalized.replace(/ E /, ' EAST ');
  normalized = normalized.replace(/ N /, ' NORTH ');
  normalized = normalized.replace(/ NO /, ' NORTH ');
  normalized = normalized.replace(/ S /, ' SOUTH ');
  normalized = normalized.replace(/ SO /, ' SOUTH ');

  normalized = normalized.replace(/ PD /, ' POND ');
  normalized = normalized.replace(/ MT /, ' MOUNTAIN ');
  normalized = normalized.replace(/ HGTS /, ' HEIGHTS ');
  return normalized;
}

function orientation(points: number[][]): number {
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
  return angle - 90;
}

function searchForAnomalies(): void {
  const lotsByID = PARCELS.lots.reduce((acc, lot) => {
    acc[lot.id] = lot;
    return acc;
  }, {});
  // ///////////////////////////////////////////////////////////////////////
  // 👇 these lots known to assessors, but not original landgrid dataset
  // ///////////////////////////////////////////////////////////////////////
  const missingFromAssessors = PARCELS.lots.filter(
    (lot) => !assessorsByID[lot.id]
  );
  if (missingFromAssessors.length > 0) {
    console.log(
      `\n\n${missingFromAssessors.length} LOTS NOT FOUND IN assessors.csv:`
    );
    missingFromAssessors.forEach((lot) =>
      console.log(`${lot.id}\t${lot.address}\t${lot.owner}`)
    );
  }
  // ///////////////////////////////////////////////////////////////////////
  // 👇 these lots known to landgrid dataset, but not to assessors
  // ///////////////////////////////////////////////////////////////////////
  const missingFromData = Object.keys(assessorsByID).filter(
    (id) => !lotsByID[id]
  );
  if (missingFromData.length > 0) {
    console.log(
      `\n\n${missingFromData.length} LOTS NOT FOUND IN parcel-data.ts:`
    );
    missingFromData.forEach((id) => {
      const assessors = assessorsByID[id];
      console.log(`${id}\t${assessors.address}\t${assessors.owner}`);
    });
  }
  // ///////////////////////////////////////////////////////////////////////
  // 👇 these lots are residential, but we have no addess
  // ///////////////////////////////////////////////////////////////////////
  const missingAddress = PARCELS.lots
    .filter(
      (lot) =>
        lot.usage === '110' &&
        !['U', 'V', 'W'].includes(lot.neighborhood) &&
        (!lot.address || !/^[\d]+ /.test(lot.address))
    )
    .map((lot) => lot.id);
  if (missingAddress.length > 0) {
    console.log(
      `\n\n${missingAddress.length} RESIDENTIAL LOTS WITH MISSING ADDRESS:`
    );
    // missingAddress.forEach((id) => console.log(id));
  }
  // ///////////////////////////////////////////////////////////////////////
  // 👇 explore unique addresses
  // ///////////////////////////////////////////////////////////////////////
  const uniqueAddresses = PARCELS.lots.reduce((set, lot) => {
    if (lot.address) {
      const addr = lot.address.replace(/^[\d]*\s*/, '');
      set.add(addr);
    }
    return set;
  }, new Set());
  if (uniqueAddresses.size > 0) {
    const sortedUniqueAddresses = Array.from(uniqueAddresses).sort();
    console.log(`\n\n${sortedUniqueAddresses.length} UNIQUE ADDRESSES:`);
    // sortedUniqueAddresses.forEach((id) => console.log(id));
  }
}

function toNumber(str: string): number {
  return str ? parseFloat(str.replace(/[^\d.-]/g, '')) : 0;
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

async function main(): Promise<void> {
  let fail = false;
  // 👇 remove any duplicates
  uniquifyLots();
  // 👇 find any anomalies
  searchForAnomalies();
  // next, fix them up
  for (let ix = 0; ix < PARCELS.lots.length; ix++) {
    const lot = PARCELS.lots[ix];
    // fix up boundaries -- first and last should be same
    fixBoundaries(lot);
    // 👇 calculated fields
    try {
      lot.areas = calculateAreas(lot.boundaries);
      // 🧨 DON'T recalculate centers b/c they've been tweaked
      if (lot.centers?.length !== lot.boundaries.length)
        lot.centers = calculateCenters(lot.boundaries);
      lot.lengths = calculateLengths(lot.boundaries);
      lot.minWidths = calculateMinWidths(lot.boundaries);
      lot.orientations = calculateOrientations(lot.boundaries);
      lot.perimeters = calculatePerimeters(lot.boundaries);
      lot.sqarcities = calculateSqarcities(lot.areas, lot.perimeters);
    } catch (error) {
      fail = true;
      console.error(lot.id, error.message);
    }
    // 👇 elevation is special
    try {
      lot.elevations ??= await calculateElevations(lot.centers);
    } catch (error) {
      fail = true;
      console.error(lot.id, error.message);
    }
    // 👇 jam the assessor data
    const assessed = assessorsByID[lot.id];
    if (assessed) {
      // 🧨 only use assessor address as last resort, as it has no street #
      lot.address ??= assessed.address;
      // 🧨 we may also mess with the assessed area
      lot.area ??= toNumber(assessed.area);
      lot.building$ = toNumber(assessed.building$);
      lot.cu$ = toNumber(assessed.cu$);
      lot.land$ = toNumber(assessed.land$);
      lot.neighborhood = assessed.neighborhood;
      lot.owner = assessed.owner;
      lot.taxed$ = toNumber(assessed.taxed$);
      lot.use = assessed.use;
      lot.zone = assessed.zone;
    }
    // 👇 it is still possible that we have no lot.area, but we really need it!
    if (!lot.area) lot.area = lot.areas.reduce((acc, area) => acc + area, 0);

    // 👇 try to elimiate difference between RD/ROAD, CIR/CIRCLE etc
    if (lot.address) lot.address = normalizeAddress(lot.address);
  }
  // 👇 all done!
  if (!fail) {
    writeFileSync(
      'src/app/parcel-data.ts',
      `/* eslint-disable */
// prettier-ignore
export const PARCELS = ${JSON.stringify(PARCELS, null, 2)};`
    );
  }
}

main();
