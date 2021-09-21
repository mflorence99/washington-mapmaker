import { Point } from './geometry';

import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { parseString } from 'xml2js';
import { tap } from 'rxjs/operators';

const METERS2FEET = 3.28084;

export interface Tracks {
  [name: string]: Point[];
}

export interface Waypoints {
  [name: string]: Point;
}

@Injectable({ providedIn: 'root' })
export class GpsData {
  boundary: Tracks;
  buildings: Tracks;
  nh: Tracks;
  sullivan: Tracks;
  washington: Tracks;

  constructor(private http: HttpClient) {}

  load(): Observable<any> {
    return forkJoin([
      this.loadImpl('buildings'),
      this.loadImpl('nh'),
      this.loadImpl('sullivan'),
      this.loadImpl('washington')
    ]);
  }

  private loadImpl(key: string): Observable<Tracks | Waypoints> {
    return this.http
      .get(`/assets/data/${key}.gpx`, {
        observe: 'response',
        responseType: 'text'
      })
      .pipe(
        mergeMap((response: HttpResponse<string>) => this.parse(response.body)),
        tap((data: Tracks | Waypoints) => (this[key] = data))
      );
  }

  private obj2point(obj: any): Point {
    // 👇 GPS collected elevation in meters
    const ele = Number(obj.ele?.[0] ?? 0) * METERS2FEET;
    const lat = Number(obj.$.lat);
    const lon = Number(obj.$.lon);
    return { ele, lat, lon };
  }

  private parse(xml: string): Observable<Tracks | Waypoints> {
    return new Observable<Tracks | Waypoints>((observer) => {
      parseString(xml, (err, obj) => {
        if (err) observer.error(err);
        else {
          observer.next(this.transform(obj.gpx));
          observer.complete();
        }
      });
    });
  }

  private toTracks(gpx: any): Tracks {
    const nm = gpx.trk[0].name[0];
    const pointss = gpx.trk.reduce((acc, trk) => {
      const points = trk.trkseg[0].trkpt.map((trkpt) => this.obj2point(trkpt));
      acc.push(points);
      return acc;
    }, []);
    return { [nm]: pointss.length > 1 ? pointss : pointss[0] };
  }

  private toWaypoints(gpx: any): Waypoints {
    return gpx.wpt.reduce((acc, wpt) => {
      acc[wpt.name[0]] = this.obj2point(wpt);
      return acc;
    }, {});
  }

  private transform(gpx: any): Tracks | Waypoints {
    if (gpx.trk) return this.toTracks(gpx);
    else if (gpx.wpt) return this.toWaypoints(gpx);
    else throw new Error('Invalid GPX data');
  }
}
