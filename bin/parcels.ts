import * as turf from '@turf/turf';

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import polylabel from 'polylabel';

const county = JSON.parse(
  readFileSync('src/assets/data/nh_sullivan.json').toString()
);

const washington = {
  areaByUsage: {},
  countByUsage: {},
  descByUsage: {
    '11': 'Single Family Home',
    '12': 'Multi Family Units',
    '17': 'Industrial',
    '19': 'Improved Residential Land',
    '22': 'Residential Land',
    '26': 'Mixed Commercial/Industrial',
    '27': 'Unclassified',
    '33': 'Commercial',
    // '57': 'Unclass/Unk Other',
    '58': 'Garage/Storage Unit',
    '100': 'Pilsbury State Park',
    '101': 'Washington Town Forest'
  },
  lots: []
};

// NOTE: these lots are unclassified in the original
// 100 == Pilsbury
// 101 == Town Forest
const overridesByID = {
  '1-3': {
    usage: '100'
  },
  '2-3': {
    usage: '101'
  },
  '4-1': {
    usage: '100'
  },
  '4-4': {
    usage: '100'
  },
  '4-6': {
    usage: '100'
  },
  '5-2': {
    usage: '100'
  },
  '7-10': {
    usage: '101'
  },
  '8-41': {
    usage: '100'
  },
  '8-42': {
    usage: '100'
  },
  '10-5': {
    usage: '101'
  },
  '12-100': {
    usage: '101'
  },
  '14-400': {
    usage: '101'
  },
  '18-6': {
    usage: '101'
  }
};

// NOTE: these lots are in the original data more than once
const duplicates = new Set(['11-27']);
const ids = new Set();

const M2TOACRES = 4047;

// extract data from original
county.features
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
      // find the areas of each individual polygon
      let areas;
      if (feature.geometry.type === 'Polygon')
        areas = [turf.area(turf.polygon(feature.geometry.coordinates))];
      else if (feature.geometry.type === 'MultiPolygon')
        areas = feature.geometry.coordinates.map((polygon) =>
          turf.area(turf.polygon(polygon))
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
      // extract any overrides
      const override = overridesByID[id];
      // initialize the lot
      const lot = {
        area: feature.properties.ll_gisacre as number,
        areas: areas,
        boundaries: boundaries,
        centers: centers,
        id: id,
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

writeFileSync(
  'src/assets/data/parcels.js',
  'PARCELS = ' + JSON.stringify(washington, null, 2) + ';'
);

function toPoints(coordinates: number[][]): { lat: number; lon: number }[] {
  return coordinates.map((coordinate) => ({
    lat: coordinate[1],
    lon: coordinate[0]
  }));
}
