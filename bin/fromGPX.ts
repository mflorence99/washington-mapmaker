import { hideBin } from 'yargs/helpers';
import { parseStringPromise } from 'xml2js';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import yargs from 'yargs';

// 👇 npm run fromGPX -- --lotID="11-39-0" --lotID="11-39-1" --lotID="11-39-2" --lotID="11-39-3" --out="11-39" --usage="110"

const argv = yargs(hideBin(process.argv)).argv;

async function main(): Promise<void> {
  const parcels = [];
  for (const lotID of argv['lotID']) {
    const xml = readFileSync(`src/assets/data/${lotID}.gpx`);
    const obj = await parseStringPromise(xml);
    parcels.push({
      address: '',
      area: 0,
      areas: null,
      boundaries: [
        obj.gpx.trk[0].trkseg[0].trkpt.map((obj) => ({
          lat: Number(obj.$.lat),
          lon: Number(obj.$.lon)
        }))
      ],
      building$: 0,
      callouts: [],
      centers: null,
      cu$: 0,
      elevations: null,
      id: lotID,
      labels: [],
      land$: 0,
      lengths: null,
      neighborhood: '',
      orientations: null,
      owner: '',
      perimeters: null,
      sqarcities: null,
      taxed$: 0,
      usage: String(argv['usage']),
      use: '',
      zone: ''
    });
  }
  writeFileSync(
    `src/assets/data/${argv['out']}.json`,
    JSON.stringify(parcels, null, 2)
  );
}

main();
