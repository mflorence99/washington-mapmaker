import { hideBin } from 'yargs/helpers';
import { parseStringPromise } from 'xml2js';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import yargs from 'yargs';

// 👇 npm run fromGPX -- --lotID="11-39-0" --lotID="11-39-1" --lotID="11-39-2" --lotID="11-39-3" --out="11-39"

// 👇 npm run fromGPX -- --lotID="11-27" --out="11-27"

// 👇 npm run fromGPX -- --lotID="9-25" --out="9-25"

const argv = yargs(hideBin(process.argv)).argv;

const lotIDs = Array.isArray(argv['lotID']) ? argv['lotID'] : [argv['lotID']];

console.log(`Processing lots ${lotIDs.join(', ')}`);

async function main(): Promise<void> {
  const parcels = [];
  for (const lotID of lotIDs) {
    const xml = readFileSync(`src/assets/data/${lotID}.gpx`);
    const obj = await parseStringPromise(xml);
    parcels.push({
      boundaries: obj.gpx.trk[0].trkseg.map((trkseg) => {
        return trkseg.trkpt.map((obj) => ({
          lat: Number(obj.$.lat),
          lon: Number(obj.$.lon)
        }));
      }),
      id: lotID
    });
  }
  writeFileSync(
    `src/assets/data/${argv['out']}.json`,
    JSON.stringify(parcels.length === 1 ? parcels[0] : parcels, null, 2)
  );
}

main();
