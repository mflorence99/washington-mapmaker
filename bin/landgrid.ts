import * as turf from '@turf/turf';

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import polylabel from 'polylabel';
import simplify from 'simplify-geojson';

const county = JSON.parse(
  readFileSync('src/assets/data/nh_sullivan.json').toString()
);

const overrides = JSON.parse(readFileSync('bin/overrides.json').toString());

const washington = {
  areaByUsage: {},
  countByUsage: {},
  descByUsage: {
    '11': 'Single Family Home',
    '12': 'Multi Family Units',
    '19': 'Improved Residential Land',
    '22': 'Residential Land',
    '100': 'Pilsbury State Park',
    '101': 'Washington Town Forest',
    '17': 'Industrial',
    '33': 'Commercial',
    '26': 'Mixed Commercial/Industrial',
    '58': 'Garage/Storage Unit',
    '27': 'Unclassified'
  },
  lots: [],
  usages: ['11', '12', '19', '22', '100', '101', '17', '33', '26', '58', '27']
};

// NOTE: these lots are in the original data more than once
const duplicates = new Set(['11-27']);
const ids = new Set();

const M2TOACRES = 4047;

// extract data from original
county.features
  .map((feature) => {
    if (feature.properties.zoning) console.log(feature);
    return feature;
  })
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

    // eliminate duplicates
    if (!ids.has(id)) {
      if (duplicates.has(id)) ids.add(id);

      // simplify boundaries
      feature = simplify(feature, 0.00001);

      // find the areas of each individual polygon
      let areas;
      if (feature.geometry.type === 'Polygon')
        areas = [turf.area(turf.polygon(feature.geometry.coordinates))];
      else if (feature.geometry.type === 'MultiPolygon')
        areas = feature.geometry.coordinates.map((polygon) =>
          turf.area(turf.polygon(polygon))
        );

      // find the perimeters of each individual polygon
      let perimeters;
      if (feature.geometry.type === 'Polygon')
        perimeters = [
          turf.length(turf.lineString(feature.geometry.coordinates[0]))
        ];
      else if (feature.geometry.type === 'MultiPolygon')
        perimeters = feature.geometry.coordinates.map((polygon) =>
          turf.length(turf.lineString(polygon[0]))
        );

      // @see https://gis.stackexchange.com/questions/222345/identify-shape-of-the-polygons-elongation-roundness-etc
      const sqarcities = areas.map(
        (area, ix) => (area / Math.pow(perimeters[ix] * 1000, 2)) * 4 * Math.PI
      );

      // NOTE: convert sq meters to acres
      areas = areas.map((area) => area / M2TOACRES);

      // extract the bundaries
      let boundaries;
      if (feature.geometry.type === 'Polygon')
        boundaries = [toPoints(feature.geometry.coordinates.flat(1))];
      else if (feature.geometry.type === 'MultiPolygon')
        boundaries = feature.geometry.coordinates.map((polygon) =>
          toPoints(polygon.flat(1))
        );

      // find the centers of each individual polygon
      let centers;
      if (feature.geometry.type === 'Polygon')
        centers = [polylabel(feature.geometry.coordinates)];
      else if (feature.geometry.type === 'MultiPolygon')
        centers = feature.geometry.coordinates.map((polygon) =>
          polylabel(polygon)
        );
      centers = centers.map((center) => ({
        lat: center[1],
        lon: center[0]
      }));

      // find the perimeters of each individual polygon
      let orientations;
      if (feature.geometry.type === 'Polygon')
        orientations = [orientation(feature.geometry.coordinates[0])];
      else if (feature.geometry.type === 'MultiPolygon')
        orientations = feature.geometry.coordinates.map((polygon) =>
          orientation(polygon[0])
        );

      // extract any overrides
      const override = overrides[id];

      // initialize the lot
      const lot = {
        address: feature.properties.address,
        area: feature.properties.ll_gisacre as number,
        areas: areas,
        boundaries: boundaries,
        callouts: override?.callouts ?? [],
        centers: override?.centers ?? centers,
        id: id,
        labels: override?.labels ?? [],
        orientations: override?.orientations ?? orientations,
        sqarcities: override?.sqarcities ?? sqarcities,
        usage:
          // NOTE: fold 57 and 27 together
          override?.usage ??
          (feature.properties.usecode === '57'
            ? '27'
            : feature.properties.usecode ?? '27')
      };
      washington.lots.push(lot);

      // accumulate usage
      if (lot.usage) {
        const area: number = washington.areaByUsage[lot.usage];
        washington.areaByUsage[lot.usage] = area ? area + lot.area : lot.area;
        const count: number = washington.countByUsage[lot.usage];
        washington.countByUsage[lot.usage] = count ? count + 1 : 1;
      }
    }
  });

console.log(
  `Processed ${Object.keys(overrides).length} overrides to ${
    washington.lots.length
  } lots`
);

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

function toPoints(coordinates: number[][]): { lat: number; lon: number }[] {
  return coordinates.map((coordinate) => ({
    lat: coordinate[1],
    lon: coordinate[0]
  }));
}
