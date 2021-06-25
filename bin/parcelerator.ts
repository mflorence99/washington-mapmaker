import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

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

county.features
  .filter((feature) => feature.properties.city === 'washington')
  .forEach((feature) => {
    washington.lots.push({
      id: feature.id,
      geometry: feature.geometry,
      properties: feature.properties
    });
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
  });

writeFileSync(
  'src/assets/data/parcels.js',
  'PARCELS = ' + JSON.stringify(washington, null, 2) + ';'
);
