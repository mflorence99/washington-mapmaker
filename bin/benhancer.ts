import * as turf from '@turf/turf';

import { copyFileSync } from 'fs';
import { parseStringPromise } from 'xml2js';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

import format from 'xml-formatter';
import togpx from 'togpx';

// ///////////////////////////////////////////////////////////////////////
// 👉 ENHANCE BUILDINGS IN ./src/assets/data/buildings.gpx
// ///////////////////////////////////////////////////////////////////////

function backupData(): void {
  copyFileSync(
    './src/assets/data/buildings.gpx',
    '/home/mflo/Documents/buildings.backup.gpx'
  );
}

function calculateOrientation(points: number[][]): number {
  let theta = 0;
  let longest = 0;
  points.forEach((point, ix) => {
    if (ix > 0) {
      const p = turf.point(point);
      const q = turf.point(points[ix - 1]);
      const length = turf.distance(p, q);
      if (length > longest) {
        theta =
          p.geometry.coordinates[0] < q.geometry.coordinates[0]
            ? turf.bearing(p, q)
            : turf.bearing(q, p);
        longest = length;
      }
    }
  });
  // convert bearing to rotation
  return theta - 90;
}

async function loadBuildings(): Promise<any> {
  const xml = readFileSync('./src/assets/data/buildings.gpx');
  const buildings = await parseStringPromise(xml);
  return {
    type: 'FeatureCollection',
    features: buildings.gpx.trk.map((trk) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: trk.trkseg.map((trkseg) => {
            return trkseg.trkpt.map((trkpt) => [
              Number(trkpt.$.lon),
              Number(trkpt.$.lat)
            ]);
          })
        }
      };
    })
  };
}

function saveBuildings(buildings: any): void {
  let gpx = togpx(buildings);
  // 👇 this seems to be accptable to viking
  const hdr = `<?xml version="1.0"?>
<gpx version="1.0"
creator="Viking 1.7 -- http://viking.sf.net/"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns="http://www.topografix.com/GPX/1/0"
xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">`;
  gpx = gpx.replace(/<gpx[^>]*>/, hdr);
  writeFileSync(
    './src/assets/data/buildings.gpx',
    format(gpx, { indentation: '  ' })
  );
}

async function main(): Promise<void> {
  backupData();
  const buildings = await loadBuildings();
  buildings.features.forEach((building) => {
    // 👉 only for rectangles!!
    if (building.geometry.coordinates[0].length < 6) {
      // make sure polygon is closed
      const points = building.geometry.coordinates[0];
      const first = points[0];
      const last = points[points.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) points.push(first);
      // rotate the rectangle flat, find the bounding box, and rotate it back
      const theta = calculateOrientation(points);
      const polygon = turf.polygon([points]);
      const rotated = turf.transformRotate(polygon, theta * -1);
      const squared = turf.bboxPolygon(turf.bbox(rotated));
      const enhanced = turf.transformRotate(squared, theta);
      building.geometry = enhanced.geometry;
    }
  });
  saveBuildings(buildings);
}

main();
