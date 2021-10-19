import { PARCELS } from '../src/app/parcel-data';

import { copyFileSync } from 'fs';
import { writeFileSync } from 'fs';

import chalk from 'chalk';
import DBFParser from 'node-dbf';

const fn = './src/assets/data/avitar.dbf';

const avitar: Record<string, any> = {};

const parcels = PARCELS.lots.reduce((acc, lot) => {
  acc[lot.id] = lot;
  return acc;
}, {});

const parser = new DBFParser(fn);

parser.on('record', (record) => {
  let id = `${parseInt(record.MAP, 10)}-${parseInt(record.LOT, 10)}`;
  if ('000000' !== record.SUB) {
    let sub = record.SUB;
    while (sub.length > 2 && sub[0] === '0') sub = sub.slice(1);
    id = `${id}-${sub}`;
  }
  avitar[id] = record;
});

parser.on('end', () => {
  console.log(chalk.blue(`DBF parse of ${fn} complete`));
  main();
});

parser.parse();

function backupData(): void {
  copyFileSync(
    './src/app/parcel-data.ts',
    '/home/mflo/Documents/parcel-data.backup.ts'
  );
}

function checkForOwnershipChanges(): void {
  console.log(chalk.yellow('\n\nOwnership changes:'));
  Object.keys(avitar).forEach((id) => {
    const alot = avitar[id];
    const plot = parcels[id];
    if (plot && alot.OWNER !== plot.owner) {
      console.log(
        `${chalk.cyan(id)} owner changed to "${chalk.blue(
          alot.OWNER
        )}" from "${chalk.green(plot.owner)}"`
      );
    }
  });
}

function saveData(): void {
  writeFileSync(
    './src/app/parcel-data.ts',
    `/* eslint-disable */
// prettier-ignore
export const PARCELS = ${JSON.stringify(PARCELS, null, 2)};`
  );
}

function searchForAnomalies(): void {
  // ///////////////////////////////////////////////////////////////////////
  // 👇 these lots are no longer in the Avitar database
  // ///////////////////////////////////////////////////////////////////////
  const missingFromAvitar = PARCELS.lots.filter((lot) => !avitar[lot.id]);
  if (missingFromAvitar.length > 0) {
    console.log(
      chalk.red(`\n\n${missingFromAvitar.length} LOTS NOT FOUND IN Avitar:`)
    );
    missingFromAvitar.forEach((lot) =>
      console.log(`${lot.id}\t${lot.address}\t${lot.owner}`)
    );
  }
  // ///////////////////////////////////////////////////////////////////////
  // 👇 these lots are in Avitar but new to us
  // ///////////////////////////////////////////////////////////////////////
  const missingFromData = Object.keys(avitar).filter(
    (id) => !parcels[id] && Number(avitar[id].area) > 0
  );
  if (missingFromData.length > 0) {
    console.log(
      chalk.red(
        `\n\n${missingFromData.length} LOTS NOT FOUND IN parcel-data.ts:`
      )
    );
    missingFromData.forEach((id) => {
      const assessors = avitar[id];
      console.log(`${id}\t${assessors.address}\t${assessors.owner}`);
    });
  }
  // 👇 any anomaly, we crash
  if (missingFromAvitar.length || missingFromDatsa.length)
    throw new Error('Anomalies found!');
}

function main(): void {
  try {
    backupData();
    searchForAnomalies();
    checkForOwnershipChanges();
    saveData();
  } catch (error) {
    console.log(chalk.red(error.message));
  }
}

/* eslint-disable @typescript-eslint/naming-convention */

const sample = {
  PID: '000000000001000000',
  MAP: '000000',
  LOT: '000001',
  SUB: '000000',
  CARDS: 1,
  LOCNUMB: '',
  LOCNAME: 'AP UTILITY PROPERTY',
  OWNER: 'NH ELECTRIC COOP',
  COOWNER: '',
  ADDRESS: '579 TENNEY MT HWY',
  ADDRESS2: '',
  CITY: 'PLYMOUTH',
  STATE: 'NH',
  ZIP: '03264',
  ZIP4: '3147',
  ACRES: 0,
  LANDUSE: 'UTILITY-ELEC',
  ZONE: 'RESIDENTIAL',
  MODEL: '',
  BEDRMS: 0,
  BTHRMS: 0,
  YRBUILT: 0,
  SALEDATE: '',
  SALEBK: '',
  SALEPG: '',
  SALEGRNT: '',
  LNDMKVAL: 0,
  CUSECRED: 0,
  CURRENTUSE: 'N',
  LNDTXVAL: 0,
  BLDTXVAL: 0,
  FEATXVAL: 866700,
  TOTTXVAL: 866700,
  FN: 0,
  SALEPRICE: null,
  SALEQUAL: '',
  SALEIMPR: '',
  AREA: 0,
  CARDTOTAL: 866700,
  CARDTOTALO: 0,
  BLDGGRADE: '',
  BLDGSTORIE: '',
  BLDGCONDIT: '',
  NGHBRHD: 'N-E',
  NGHBRHDDES: 'AVG',
  BLDGDEPREC: 0,
  BLDGADJBAS: 0,
  XSFRONTAGE: 0,
  WATERFRONT: 0,
  VIEWFACTOR: 'N',
  PRIORLNDTX: 0,
  PRIORBLDTX: 0,
  PRIORFEATX: 0,
  PRIORTOTTX: 0,
  TOWNNAME: 'WASHINGTON',
  PARCELNOTE: ''
};
