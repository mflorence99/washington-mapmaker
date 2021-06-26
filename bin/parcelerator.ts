import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import polylabel from 'polylabel';

const county = JSON.parse(
  readFileSync('src/assets/data/nh_sullivan.json').toString()
);

const washington = {
  usageByCode: {},
  usageByDesc: {},
  usageByArea: {},
  usageByCount: {},
  lots: []
};

const propertiesByDisplayID = {
  '01-003-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '02-003-00': {
    usecode: '101',
    usedesc: 'Town Forest'
  },
  '04-001-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '04-004-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '04-006-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '05-002-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '07-010-00': {
    usecode: '101',
    usedesc: 'Town Forest'
  },
  '08-041-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '08-042-00': {
    usecode: '100',
    usedesc: 'State Park'
  },
  '10-005-00': {
    usecode: '101',
    usedesc: 'Town Forest'
  },
  '12-100-00': {
    usecode: '101',
    usedesc: 'Town Forest'
  },
  '14-400-00': {
    usecode: '101',
    usedesc: 'Town Forest'
  },
  '18-006-00': {
    usecode: '101',
    usedesc: 'Town Forest'
  }
};

const dupeids = new Set(['11-027-00']);
const displayids = new Set();

county.features
  .filter((feature) => feature.properties.city === 'washington')
  .forEach((feature) => {
    if (!displayids.has(feature.properties.displayid)) {
      if (dupeids.has(feature.properties.displayid))
        displayids.add(feature.properties.displayid);
      // extract properties, geometry
      washington.lots.push({
        id: feature.id,
        geometry: feature.geometry,
        properties: feature.properties
      });
      // jam overrides
      const overrides = propertiesByDisplayID[feature.properties.displayid];
      if (overrides) Object.assign(feature.properties, overrides);
      // accumulate usage
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const ll_gisacre: number = feature.properties.ll_gisacre ?? 0;
      const usecode = feature.properties.usecode;
      const usedesc = feature.properties.usedesc;
      if (usecode && usedesc) {
        washington.usageByCode[usecode] = usedesc;
        washington.usageByDesc[usedesc] = usecode;
        const area: number = washington.usageByArea[usedesc];
        washington.usageByArea[usedesc] = area ? area + ll_gisacre : ll_gisacre;
        const count: number = washington.usageByCount[usedesc];
        washington.usageByCount[usedesc] = count ? count + 1 : 1;
      }
      // jam centers
      let centers;
      if (feature.geometry.type === 'Polygon')
        centers = [polylabel(feature.geometry.coordinates)];
      else if (feature.geometry.type === 'MultiPolygon')
        centers = feature.geometry.coordinates.map((polygon) =>
          polylabel(polygon)
        );
      feature.properties.centers = centers.map((center) => ({
        lat: center[1],
        lon: center[0]
      }));
    }
  });

writeFileSync(
  'src/assets/data/parcels.js',
  'PARCELS = ' + JSON.stringify(washington, null, 2) + ';'
);
