import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

const counties = JSON.parse(
  readFileSync('/home/mflo/Downloads/USA_Counties.geojson').toString()
);

const sullivan = counties.features.filter(
  (feature) =>
    feature.properties.NAME === 'Sullivan' &&
    feature.properties.STATE_NAME === 'New Hampshire'
);

writeFileSync(
  'src/assets/data/sullivan.geojson',
  JSON.stringify(
    {
      features: sullivan
    },
    null,
    2
  )
);
