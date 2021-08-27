import { PARCELS } from '../src/app/parcel-data';

import { hideBin } from 'yargs/helpers';
import { parseStringPromise } from 'xml2js';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import yargs from 'yargs';

// 👇 npm run fromGPX -- --lotID="11-39-0" --lotID="11-39-1" --lotID="11-39-2" --lotID="11-39-3" --out="11-39" --usage="110"

// 👇 npm run fromGPX -- --lotID="11-27" --out="11-27" --usage="120"

// 👇 npm run fromGPX -- --lotID="25-83-02" --out="25-83-02"

const argv = yargs(hideBin(process.argv)).argv;

const lotIDs = Array.isArray(argv['lotID']) ? argv['lotID'] : [argv['lotID']];
const usage = String(argv['usage'] ?? 110);

console.log(`Processing lots ${lotIDs.join(', ')}`);

const lotByID = PARCELS.lots.reduce((acc, lot) => {
  acc[lot.id] = lot;
  return acc;
}, {});

async function main(): Promise<void> {
  const parcels = [];
  for (const lotID of lotIDs) {
    const lot = lotByID[lotID];
    const xml = readFileSync(`src/assets/data/${lotID}.gpx`);
    const obj = await parseStringPromise(xml);
    parcels.push({
      address: lot?.address ?? '',
      area: lot?.area ?? 0,
      areas: null,
      boundaries: obj.gpx.trk[0].trkseg.map((trkseg) => {
        return trkseg.trkpt.map((obj) => ({
          lat: Number(obj.$.lat),
          lon: Number(obj.$.lon)
        }));
      }),
      building$: lot?.building$ ?? 0,
      callouts: lot?.callouts ?? [],
      centers: null,
      cu$: lot?.cu$ ?? 0,
      elevations: null,
      id: lotID,
      labels: lot?.labels ?? [],
      land$: lot?.land$ ?? 0,
      lengths: null,
      minWidths: null,
      neighborhood: lot?.neighborhood ?? '',
      orientations: null,
      owner: lot?.owner ?? '',
      perimeters: null,
      sqarcities: null,
      taxed$: lot?.taxed ?? 0,
      usage: lot?.usage ?? usage,
      use: lot?.use ?? '',
      zone: lot?.zone ?? ''
    });
  }
  writeFileSync(
    `src/assets/data/${argv['out']}.json`,
    JSON.stringify(parcels, null, 2)
  );
}

main();
