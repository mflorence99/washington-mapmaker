import { PARCELS } from '../src/app/parcel-data';

import * as turf from '@turf/turf';

import { parseStringPromise } from 'xml2js';
import { readFileSync } from 'fs';

import jsome from 'jsome';

async function main(): Promise<void> {
  const buildings = await parseStringPromise(
    readFileSync('./src/assets/data/buildings.gpx').toString()
  );

  const exceptions = [
    '10-3',
    '10-38',
    '10-39',
    '10-4',
    '10-48',
    '10-49',
    '10-55',
    '10-56',
    '10-59',
    '10-62',
    '11-51',
    '11-54',
    '11-79',
    '12-154',
    '12-161',
    '12-162',
    '12-165',
    '12-17',
    '12-171',
    '12-176',
    '12-181-02',
    '12-181-03',
    '12-181-04',
    '12-195',
    '12-207',
    '12-208',
    '12-26',
    '12-34',
    '12-61',
    '12-97-01',
    '13-39',
    '14-18',
    '14-457',
    '15-34',
    '15-53',
    '15-104',
    '15-118',
    '19-25',
    '20-113',
    '20-25',
    '20-96',
    '20-99'
  ];

  const unoccupied = new Set();

  PARCELS.lots
    .filter((lot) => lot.usage === '110')
    .filter((lot) => lot.building$ > 0)
    .filter((lot) => !['U', 'V', 'W'].includes(lot.neighborhood))
    .filter((lot) => !exceptions.includes[lot.id])
    .forEach((lot) => {
      let hasBuilding = false;
      lot.boundaries.forEach((boundary) => {
        const points = boundary.map((point) => [point.lon, point.lat]);
        const residence = turf.polygon([points]);
        // check against each building
        try {
          buildings.gpx.trk.forEach((trk) => {
            trk.trkseg.forEach((trkseg) => {
              const points = trkseg.trkpt?.map((point) => [
                Number(point.$.lon),
                Number(point.$.lat)
              ]);
              if (points) {
                // make sure building is closed (lot is guaranteed)
                points.push(points[0]);
                const building = turf.polygon([points]);
                hasBuilding ||= !!turf.intersect(residence, building);
              }
            });
          });
        } catch (error) {
          jsome({ error: error.message, lot: lot.id });
        }
      });
      if (!hasBuilding) unoccupied.add(lot.id);
    });

  console.log('\n\n RESIDENTIAL LOTS WITH NO BUILDING:');
  Array.from(unoccupied)
    .sort()
    .forEach((id) => console.log(id));
}

main();
