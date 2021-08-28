import * as turf from '@turf/turf';

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import parse from 'csv-parse/lib/sync';
import polylabel from 'polylabel';
import simplify from 'simplify-geojson';

const county = JSON.parse(
  readFileSync('src/assets/data/nh_sullivan.json').toString()
);

const additions = JSON.parse(
  readFileSync('src/assets/data/additions.json').toString()
);

const deletions = JSON.parse(
  readFileSync('src/assets/data/deletions.json').toString()
);

const overrides = JSON.parse(
  readFileSync('src/assets/data/overrides.json').toString()
);

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
      undefined,
      undefined,
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

const washington = {
  areaByUsage: {},
  countByUsage: {},
  descByUsage: {
    '110': 'Single family residence',
    '120': 'Two family residence',
    '190': 'Current Use',
    '260': 'Commercial/Industrial',
    '300': 'Town Property',
    '400': 'State Property',
    '500': 'Pillsbury State Park',
    '501': 'Washington Town Forest'
  },
  descByUse: {
    /* eslint-disable @typescript-eslint/naming-convention */
    CUFL: 'Farmland',
    CUMH: 'Managed hardwood',
    CUMW: 'Managed pine',
    CUUH: 'Unmanaged hardwood',
    CUUW: 'Unmanaged pine',
    CUWL: 'Wetland'
    /* eslint-enable @typescript-eslint/naming-convention */
  },
  lots: [],
  usages: ['110', '120', '190', '260', '300', '400', '500', '501'],
  uses: ['CUMH', 'CUMW', 'CUUH', 'CUUW', 'CUFL', 'CUWL']
};

const use2usage = {
  /* eslint-disable @typescript-eslint/naming-convention */
  'CI': '260',
  'CUFL': '190',
  'CUMH': '190',
  'CUMO': '190',
  'CUMW': '190',
  'CUUH': '190',
  'CUUO': '190',
  'CUUW': '190',
  'CUWL': '190',
  'EX-M': '300',
  'EX-S': '400',
  'R1': '110',
  'R1A': '110',
  'R1W': '110',
  'R2': '120',
  'UTLE': '261'
  /* eslint-enable @typescript-eslint/naming-convention */
};

// 👇 these lots are in the original data more than once
const duplicates = new Set(['11-27']);
const ids = new Set();

const notInAssessors = new Set();
const inLandgrid = new Set();
const unclassified = new Set();
const usages = new Set();

const M2TOACRES = 4047;

// extract data from original + additions
county.features
  .concat(additions.features)
  .filter(
    (feature) =>
      feature.properties.displayid && feature.properties.city === 'washington'
  )
  .forEach((feature) => {
    // construct lot ID
    const parts = feature.properties.displayid.split('-');
    const base = `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}`;
    const id = ['0', '00', '000', '0000', '00000', '000000'].includes(parts[2])
      ? base
      : `${base}-${parts[2]}`;

    inLandgrid.add(id);

    // if (id === '12-210') console.log(feature);

    // eliminate duplicates and deletions
    if (!ids.has(id) && !deletions.includes(id)) {
      if (duplicates.has(id)) ids.add(id);

      // simplify boundaries
      if (feature.geometry) feature = simplify(feature, 0.00001);

      // find the areas of each individual polygon
      let areas = [];
      if (feature.geometry?.type === 'Polygon')
        areas = [turf.area(turf.polygon(feature.geometry.coordinates))];
      else if (feature.geometry?.type === 'MultiPolygon')
        areas = feature.geometry.coordinates.map((polygon) =>
          turf.area(turf.polygon(polygon))
        );

      // find the perimeters of each individual polygon
      let perimeters = [];
      if (feature.geometry?.type === 'Polygon')
        perimeters = [
          turf.length(turf.lineString(feature.geometry.coordinates[0]))
        ];
      else if (feature.geometry?.type === 'MultiPolygon')
        perimeters = feature.geometry.coordinates.map((polygon) =>
          turf.length(turf.lineString(polygon[0]))
        );

      // 👀  https://gis.stackexchange.com/questions/222345/identify-shape-of-the-polygons-elongation-roundness-etc
      const sqarcities = areas.map(
        (area, ix) => (area / Math.pow(perimeters[ix] * 1000, 2)) * 4 * Math.PI
      );

      // 👇 convert sq meters to acres
      areas = areas.map((area) => area / M2TOACRES);

      // extract the boundaries
      let boundaries = [];
      if (feature.geometry?.type === 'Polygon')
        boundaries = [toPoints(feature.geometry.coordinates.flat(1))];
      else if (feature.geometry?.type === 'MultiPolygon')
        boundaries = feature.geometry.coordinates.map((polygon) =>
          toPoints(polygon.flat(1))
        );

      // find the centers of each individual polygon
      let centers = [];
      if (feature.geometry?.type === 'Polygon')
        centers = [polylabel(feature.geometry.coordinates)];
      else if (feature.geometry?.type === 'MultiPolygon')
        centers = feature.geometry.coordinates.map((polygon) =>
          polylabel(polygon)
        );
      centers = centers.map((center) => ({
        lat: center[1],
        lon: center[0]
      }));

      // find the perimeters of each individual polygon
      let orientations = [];
      if (feature.geometry?.type === 'Polygon')
        orientations = [orientation(feature.geometry.coordinates[0])];
      else if (feature.geometry?.type === 'MultiPolygon')
        orientations = feature.geometry.coordinates.map((polygon) =>
          orientation(polygon[0])
        );

      // extract any overrides
      const override = overrides[id];

      // find the assessor data
      const assessor = assessorsByID[id];
      if (!assessor) notInAssessors.add(id);

      // finding the area is tricky
      let area = 0;
      if (assessor?.area) area = toNumber(assessor.area);
      else if (feature.properties.ll_gisacre)
        area = feature.properties.ll_gisacre;
      else if (areas.length > 0) area = areas[0];

      // initialize the lot
      const lot = {
        // 👇 landgid aaddress is better
        address: feature.properties.address ?? assessor?.address,
        area: area,
        areas: areas,
        boundaries: boundaries,
        building$: assessor ? toNumber(assessor.building$) : 0,
        callouts: override?.callouts ?? [],
        centers: override?.centers ?? centers,
        cu$: assessor ? toNumber(assessor.cu$) : 0,
        id: id,
        labels: override?.labels ?? [],
        land$: assessor ? toNumber(assessor.land$) : 0,
        orientations: override?.orientations ?? orientations,
        owner: assessor?.owner,
        sqarcities: override?.sqarcities ?? sqarcities,
        taxed$: assessor ? toNumber(assessor.taxed$) : 0,
        usage: override?.usage ?? use2usage[assessor?.use] ?? '999',
        use: assessor?.use
      };
      washington.lots.push(lot);

      // accumulate usage
      if (lot.usage) {
        const area: number = washington.areaByUsage[lot.usage];
        washington.areaByUsage[lot.usage] = area ? area + lot.area : lot.area;
        const count: number = washington.countByUsage[lot.usage];
        washington.countByUsage[lot.usage] = count ? count + 1 : 1;
        // what usages are we using?
        usages.add(assessor?.use);
      }

      // record unclassified lots
      if (lot.usage === '999') unclassified.add(id);
    }
  });

console.log(`Processed ${additions.features.length} additions`);

console.log(
  `Processed ${Object.keys(overrides).length} overrides to ${
    washington.lots.length
  } lots`
);

if (notInAssessors.size > 0) {
  console.log('\n\n');
  console.error('In landgrid, not in assessors:');
  console.log(notInAssessors);
}

const notInLandgrid = new Set(
  Object.keys(assessorsByID).filter((id) => !inLandgrid.has(id))
);

if (notInLandgrid.size > 0) {
  console.log('\n\n');
  console.error('In assessors, not in landgrid:');
  console.log(notInLandgrid);
}

if (unclassified.size > 0) {
  console.log('\n\n');
  console.error('Unclassified:');
  console.log(unclassified);
}

if (usages.size > 0) {
  console.log('\n\n');
  console.error('Discrete usages:');
  console.log(usages);
}

writeFileSync(
  'src/app/landgrid.ts',
  'export const LANDGRID = ' + JSON.stringify(washington, null, 2) + ';'
);

// helpers

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

function toNumber(str: string): number {
  return parseFloat(str.replace(/[^\d.-]/g, ''));
}

function toPoints(coordinates: number[][]): { lat: number; lon: number }[] {
  return coordinates.map((coordinate) => ({
    lat: coordinate[1],
    lon: coordinate[0]
  }));
}
