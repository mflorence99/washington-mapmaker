import { get } from 'https';
import { writeFile } from 'fs/promises';

const parcels = {};

const xTiles = [4906, 4907, 4908, 4909, 4910, 4911, 4912, 4913, 4914, 4915];
const yTiles = [
  6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010, 6011, 6012, 6013
];

xTiles.forEach((x) => {
  yTiles.forEach((y) => {
    const url = `https://tiles.makeloveland.com/api/v1/parcels/14/${x}/${y}.json?token=B2eBLN84UqVxdKV_yAwuNTrwgaFUgcLatrxNxhk2CkxkxLka5pV__dsoreo37iUd`;

    get(url, (res) => {
      let contents = '';
      res.on('data', (chunk) => (contents += chunk));
      res.on('end', () => {
        const raw = JSON.parse(contents.toString());
        Object.keys(raw.data).forEach((id) => {
          const parcel = raw.data[id];
          if (parcel.path.includes('washington')) {
            parcels[parcel.fid] = {
              address: parcel.address,
              fid: parcel.fid,
              geo: JSON.parse(parcel.geojson),
              path: parcel.path,
              pid: parcel.parcelnumb
            };
          }
        });
        console.log(url);
      });
    });
  });
});

// totally sucks but OK for now
setTimeout(() => {
  writeFile(
    'src/assets/data/parcels.json',
    JSON.stringify(parcels, null, '  ')
  );
}, 30000);
