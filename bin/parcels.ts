import * as turf from '@turf/turf';

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import polylabel from 'polylabel';
import simplify from 'simplify-geojson';

const county = JSON.parse(
  readFileSync('src/assets/data/nh_sullivan.json').toString()
);

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
  '10-23': {
    centers: [{ lat: 43.17246092106209, lon: -72.15294136619026 }],
    labels: [{ rotate: false }]
  },
  '11-11': {
    callouts: [null, { lat: 43.16705086686746, lon: -72.12541487103472 }]
  },
  '11-27': {
    centers: [{ lat: 43.18354379706618, lon: -72.10934014840896 }]
  },
  '11-21': {
    labels: [{ split: true }]
  },
  '11-38-01': {
    centers: [{ lat: 43.179193129936984, lon: -72.10987659021194 }],
    labels: [{ rotate: true }]
  },
  '11-47': {
    callouts: [null, { lat: 43.170126018209714, lon: -72.12179925328265 }]
  },
  '11-48': {
    callouts: [null, { lat: 43.170000821208504, lon: -72.12209966069231 }]
  },
  '11-54': {
    callouts: [{ lat: 43.16807591731488, lon: -72.12338712101946 }]
  },
  '11-58': {
    callouts: [{ lat: 43.16896794594851, lon: -72.12265756016741 }]
  },
  '11-59': {
    callouts: [{ lat: 43.16922616476351, lon: -72.12241079693804 }]
  },
  '11-66': {
    callouts: [{ lat: 43.17088304272258, lon: -72.12094874902542 }]
  },
  '11-69-01': {
    labels: [{ split: true }]
  },
  '11-81': {
    labels: [{ split: true }]
  },
  '11-84': {
    labels: [{ split: true }]
  },
  '11-85': {
    centers: [{ lat: 43.17010054863459, lon: -72.12390990777786 }]
  },
  '11-87': {
    callouts: [{ lat: 43.17913053040994, lon: -72.10352511926467 }]
  },
  '12-4': {
    centers: [{ lat: 43.174860029818014, lon: -72.09055688267718 }]
  },
  '12-14': {
    centers: [{ lat: 43.178983706045415, lon: -72.0844736326314 }]
  },
  '12-17': {
    centers: [{ lat: 43.179803475325606, lon: -72.08502860589797 }]
  },
  '12-181-01': {
    centers: [{ lat: 43.17121169023954, lon: -72.0942554049092 }]
  },
  '12-196': {
    callouts: [{ lat: 43.18227615664364, lon: -72.08213182016189 }]
  },
  '12-29': {
    callouts: [
      null,
      { lat: 43.18266740368763, lon: -72.07996459527786 },
      { lat: 43.18409154292777, lon: -72.07998605294998 }
    ]
  },
  '12-39': {
    callouts: [null, { lat: 43.18180666019085, lon: -72.08271117730911 }]
  },
  '12-174': {
    callouts: [{ lat: 43.17216829429197, lon: -72.0849778879262 }]
  },
  '12-176': {
    labels: [{ rotate: false, split: true }]
  },
  '12-180': {
    labels: [{ rotate: false, split: true }]
  },
  '12-193': {
    callouts: [{ lat: 43.171769228850614, lon: -72.08480622654925 }]
  },
  '14-90': {
    labels: [{ rotate: false, split: true }]
  },
  '14-138': {
    centers: [{ lat: 43.158553036986795, lon: -72.14757694816048 }],
    labels: [{ rotate: false, split: true }]
  },
  '14-421': {
    labels: [{ rotate: false }]
  },
  '14-422': {
    labels: [{ rotate: false }]
  },
  '14-423': {
    labels: [{ rotate: false }]
  },
  '14-424': {
    labels: [{ rotate: false }]
  },
  '14-430': {
    labels: [{ split: true }]
  },
  '15-48-01': {
    centers: [{ lat: 43.158733091099485, lon: -72.11957838421831 }]
  },
  '15-62': {
    labels: [{ rotate: true }]
  },
  '15-64': {
    labels: [{ rotate: true }]
  },
  '15-65': {
    centers: [{ lat: 43.163277200187366, lon: -72.12146373315628 }]
  },
  '15-75': {
    callouts: [{ lat: 43.16741080824594, lon: -72.12495353108416 }]
  },
  '15-76': {
    callouts: [{ lat: 43.1672308375567, lon: -72.12518956547747 }]
  },
  '15-78': {
    callouts: [{ lat: 43.16627621042247, lon: -72.12601568585406 }]
  },
  '15-82-01': {
    callouts: [{ lat: 43.16449997796778, lon: -72.12646629696856 }]
  },
  '15-83': {
    callouts: [{ lat: 43.16433565690369, lon: -72.12654139882098 }]
  },
  '15-88-01': {
    callouts: [{ lat: 43.16161262212734, lon: -72.12648775464068 }]
  },
  '15-88-02': {
    callouts: [{ lat: 43.1618864905675, lon: -72.12633755093584 }]
  },
  '15-88-03': {
    callouts: [{ lat: 43.16214470938249, lon: -72.12602641469012 }]
  },
  '15-107-01': {
    callouts: [{ lat: 43.16415568621445, lon: -72.12657358532915 }]
  },
  '15-111-01': {
    callouts: [{ lat: 43.16651095479973, lon: -72.1258976686574 }]
  },
  '15-112-01': {
    callouts: [null, { lat: 43.166667451051254, lon: -72.12569382077227 }],
    labels: [{ rotate: false }]
  },
  '15-171': {
    callouts: [{ lat: 43.16753600524715, lon: -72.12469603901873 }]
  },
  '15-172': {
    callouts: [{ lat: 43.16766902706094, lon: -72.12444927578936 }]
  },
  '15-173': {
    callouts: [{ lat: 43.167762924811846, lon: -72.12425615674029 }]
  },
  '14-400': {
    usage: '101'
  },
  '18-6': {
    usage: '101'
  },
  '18-31': {
    callouts: [{ lat: 43.147235760468575, lon: -72.15177192305977 }]
  },
  '22-5-01': {
    centers: [{ lat: 43.179288873735864, lon: -72.09896829014788 }]
  },
  '22-17': {
    callouts: [{ lat: 43.1758303065774, lon: -72.09401156788836 }]
  },
  '22-21': {
    centers: [{ lat: 43.174382716250896, lon: -72.09267046338091 }]
  },
  '22-37-01': {
    centers: [{ lat: 43.17457051175271, lon: -72.09729459172259 }],
    labels: [{ rotate: false, split: true }]
  },
  '22-40': {
    callouts: [{ lat: 43.175296309378815, lon: -72.09925504251297 }]
  },
  '22-42': {
    callouts: [{ lat: 43.17543715831465, lon: -72.10002751870925 }]
  },
  '22-43': {
    labels: [{ split: false }]
  },
  '22-65': {
    callouts: [{ lat: 43.17780029046037, lon: -72.10110040231521 }]
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
      const override = overridesByID[id];

      // initialize the lot
      const lot = {
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

writeFileSync(
  'src/assets/data/parcels.js',
  'PARCELS = ' + JSON.stringify(washington, null, 2) + ';'
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
