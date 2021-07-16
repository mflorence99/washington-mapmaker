import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

const states = JSON.parse(
  readFileSync('src/assets/data/states.geojson').toString()
);

const nh = {
  type: 'FeatureCollection',
  features: states.features.filter(
    (feature) => feature.properties.NAME === 'New Hampshire'
  )
};

writeFileSync('src/assets/data/nh.geojson', JSON.stringify(nh, null, 2));
