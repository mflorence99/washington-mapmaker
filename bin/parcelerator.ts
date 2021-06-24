import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

const county = JSON.parse(
  readFileSync('src/assets/data/nh_sullivan.json').toString()
);

const washington = {};

county.features
  .filter((feature) => feature.properties.city === 'washington')
  .forEach((feature) => {
    washington[feature.id] = {
      properties: feature.properties,
      geometry: feature.geometry
    };
  });

writeFileSync(
  'src/assets/data/parcels.json',
  JSON.stringify(washington, null, 2)
);
