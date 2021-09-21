import * as turf from '@turf/turf';

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import togpx from 'togpx';

const allBoundaries = JSON.parse(
  readFileSync(
    `/home/mflo/Downloads/New_Hampshire_Political_Boundaries.geojson`
  ).toString()
);

const washingtonBoundary = allBoundaries.features.find(
  (feature) => feature.properties.pbpNAME === 'Washington'
);

const allBuildings = JSON.parse(
  readFileSync(`/home/mflo/Downloads/NewHampshire.geojson`).toString()
);

const washingtonBuildings = {
  type: 'FeatureCollection',
  features: allBuildings.features.filter((feature) =>
    turf.booleanContains(washingtonBoundary, feature)
  )
};

let gpx = togpx(washingtonBuildings);

// 👇 this seems to be accptable to viking
const hdr = `<?xml version="1.0"?>
<gpx version="1.0"
creator="Viking 1.7 -- http://viking.sf.net/"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns="http://www.topografix.com/GPX/1/0"
xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">`;

gpx = gpx.replace(/<gpx[^>]*>/, hdr);

writeFileSync('src/assets/data/buildings.gpx', gpx);
