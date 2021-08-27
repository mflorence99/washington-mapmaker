import { PARCELS } from '../src/app/parcel-data';

import { hideBin } from 'yargs/helpers';
import { writeFileSync } from 'fs';

import togpx from 'togpx';
import yargs from 'yargs';

// 👇 npm run toGPX -- --lotID="9-16"

const argv = yargs(hideBin(process.argv)).argv;

const lotIDs = Array.isArray(argv['lotID']) ? argv['lotID'] : [argv['lotID']];

console.log(`Processing lots ${lotIDs.join(', ')}`);

for (const lotID of lotIDs) {
  const lot = PARCELS.lots.find((lot) => lot.id === lotID);

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: lot.boundaries.map((points) =>
            points.map((point) => [point.lon, point.lat])
          )
        },
        properties: {
          address: lot.address,
          area: lot.area,
          building$: lot.building$,
          id: lot.id,
          land$: lot.land$,
          neighborhood: lot.neighborhood,
          owner: lot.owner,
          usage: lot.usage,
          use: lot.use,
          zone: lot.zone
        }
      }
    ]
  };

  const bounds = {
    minlat: Number.MAX_SAFE_INTEGER,
    minlon: Number.MAX_SAFE_INTEGER,
    maxlat: Number.MIN_SAFE_INTEGER,
    maxlon: Number.MIN_SAFE_INTEGER
  };

  lot.boundaries.forEach((boundary) => {
    boundary.forEach((point) => {
      bounds.maxlon = Math.max(bounds.maxlon, point.lon);
      bounds.maxlat = Math.max(bounds.maxlat, point.lat);
      bounds.minlon = Math.min(bounds.minlon, point.lon);
      bounds.minlat = Math.min(bounds.minlat, point.lat);
    });
  });

  // writeFileSync(
  //   `src/assets/data/${lotID}.geojson`,
  //   JSON.stringify(geojson, null, 2)
  // );

  let gpx = togpx(geojson, { metadata: { bounds } });

  // 👇 this seems to be accptable to viking
  const hdr = `<?xml version="1.0"?>
<gpx version="1.0"
creator="Viking 1.7 -- http://viking.sf.net/"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns="http://www.topografix.com/GPX/1/0"
xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">`;

  gpx = gpx.replace(/<gpx[^>]*>/, hdr);

  writeFileSync(`src/assets/data/${lotID}.gpx`, gpx);
}
