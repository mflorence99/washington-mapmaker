/* eslint-disable @typescript-eslint/member-ordering */

import { GpsData } from './gps-data';
import { Point } from './gps-data';

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const FORMAT2SCALE = {
  folded: 0.75,
  tiny: 0.75,
  poster: 1,
  small: 1.5,
  medium: 2,
  large: 3
};

const RAD2DEG = 180 / Math.PI;
const PI_4 = Math.PI / 4;
const SMOOTHING = 0.2;

type LineProps = { angle: number; length: number };

export type PathOp = 'bezier' | 'linear';
export type XY = [x: number, y: number];

@Injectable({ providedIn: 'root' })
export class Geometry {
  bbox = {
    bottom: Number.MAX_SAFE_INTEGER,
    left: Number.MAX_SAFE_INTEGER,
    top: Number.MIN_SAFE_INTEGER,
    right: Number.MIN_SAFE_INTEGER
  };
  bounds = {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  };
  center: Point;
  clip = {
    x: 0,
    y: 0,
    cx: 0,
    cy: 0
  };
  crs = 'CRS:84';
  dims = {
    cxFeet: 52800,
    cyFeet: 52800,
    cxNominal: 0,
    cyNominal: 0,
    cxTile: 256,
    cyTile: 256,
    numHGrids: 0,
    numVGrids: 0,
    numXTiles: 0,
    numYTiles: 0
  };
  format = 'poster';
  ready = new Subject<void>();
  scale = 1;
  tiles = {
    bottom: 0,
    left: 0,
    top: 0,
    right: 0
  };
  xTiles = [];
  yTiles = [];
  zoom = 14;

  constructor(private gpsData: GpsData) {
    const searchParams = this.parseInitialSearchParams();
    this.format = searchParams?.format ?? this.format;
    this.scale = FORMAT2SCALE[this.format];
    // load all the GPS data
    this.gpsData.load().subscribe(() => {
      // compute the boundary box
      this.gpsData.boundary.Boundary.forEach((point: Point) => {
        this.bbox.right = Math.max(this.bbox.right, point.lon);
        this.bbox.top = Math.max(this.bbox.top, point.lat);
        this.bbox.left = Math.min(this.bbox.left, point.lon);
        this.bbox.bottom = Math.min(this.bbox.bottom, point.lat);
      });
      // ... and its center
      this.center = {
        lat: this.bbox.top - (this.bbox.top - this.bbox.bottom) / 2,
        lon: this.bbox.left + (this.bbox.right - this.bbox.left) / 2
      };
      // compute tiles
      // NOTE: spread out one tile on all sides
      this.tiles.bottom = this.lat2tile(this.bbox.bottom) + 1;
      this.tiles.left = this.lon2tile(this.bbox.left) - 1;
      this.tiles.right = this.lon2tile(this.bbox.right) + 1;
      this.tiles.top = this.lat2tile(this.bbox.top) - 1;
      // compute dimension
      this.dims.numXTiles = Math.abs(this.tiles.left - this.tiles.right) + 1;
      this.dims.numYTiles = Math.abs(this.tiles.top - this.tiles.bottom) + 1;
      this.dims.cxNominal = this.dims.cxTile * this.dims.numXTiles;
      this.dims.cyNominal = this.dims.cyTile * this.dims.numYTiles;
      // fill out the tile numbers
      this.xTiles = [...Array(this.dims.numXTiles).keys()].map(
        (ix) => this.tiles.left + ix
      );
      this.yTiles = [...Array(this.dims.numYTiles).keys()].map(
        (iy) => this.tiles.top + iy
      );
      // compute origin for lat/lon conversion
      this.bounds.bottom = this.tile2lat(this.tiles.bottom + 1);
      this.bounds.left = this.tile2lon(this.tiles.left);
      this.bounds.right = this.tile2lon(this.tiles.right + 1);
      this.bounds.top = this.tile2lat(this.tiles.top);
      // compute bounds in feet
      const cyFeet = this.distance(
        this.bounds.bottom,
        this.bounds.left,
        this.bounds.top,
        this.bounds.left
      );
      const cxFeet = this.distance(
        this.bounds.bottom,
        this.bounds.left,
        this.bounds.bottom,
        this.bounds.right
      );
      // compute a clip region cx/cyFeet around the center
      const [x, y] = this.point2xy(this.center);
      this.clip = {
        x: x - (this.dims.cxFeet / 2) * (this.dims.cxNominal / cxFeet),
        y: y - (this.dims.cyFeet / 2) * (this.dims.cyNominal / cyFeet),
        cx: (this.dims.cxFeet / cxFeet) * this.dims.cxNominal,
        cy: (this.dims.cyFeet / cyFeet) * this.dims.cyNominal
      };
      // grid lines every 200 feet
      this.dims.numHGrids = this.dims.cxFeet / 200;
      this.dims.numVGrids = this.dims.cyFeet / 200;
      // useful logging
      console.table({
        bbox: this.bbox,
        bounds: this.bounds,
        tiles: this.tiles
      });
      console.table({ dims: this.dims });
      console.table({ clip: this.clip });
      console.table({ center: this.center });
      // set CSS variables
      const style = document.body.style;
      style.setProperty('--map-clip-x', `${this.clip.x}px`);
      style.setProperty('--map-clip-y', `${this.clip.y}px`);
      style.setProperty('--map-clip-cx', `${this.clip.cx}px`);
      style.setProperty('--map-clip-cy', `${this.clip.cy}px`);
      style.setProperty('--map-cxNominal', `${this.dims.cxNominal}px`);
      style.setProperty('--map-cyNominal', `${this.dims.cyNominal}px`);
      style.setProperty('--map-cxTile', `${this.dims.cxTile}px`);
      style.setProperty('--map-cyTile', `${this.dims.cyTile}px`);
      style.setProperty('--map-numHGrids', `${this.dims.numHGrids}`);
      style.setProperty('--map-numVGrids', `${this.dims.numVGrids}`);
      style.setProperty('--map-numXTiles', `${this.dims.numXTiles}`);
      style.setProperty('--map-numYTiles', `${this.dims.numYTiles}`);
      style.setProperty('--map-scale', `${this.scale}`);
      // ready to rock!
      this.ready.next();
    });
  }

  // @see https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

  bezier(point: Point, ix: number, points: Point[]): string {
    const ok = (p): boolean => p < points.length - 1 && p >= 0;
    const current = this.point2xy(point);
    const next = ok(ix + 1) ? this.point2xy(points[ix + 1]) : undefined;
    const previous = ok(ix - 1) ? this.point2xy(points[ix - 1]) : undefined;
    const pprevious = ok(ix - 2) ? this.point2xy(points[ix - 2]) : undefined;
    const [x, y] = current;
    const [cpsX, cpsY] = this.controlPoint(previous, pprevious, current);
    const [cpeX, cpeY] = this.controlPoint(current, previous, next, true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${x},${y}`;
  }

  boundary(): string {
    return this.gpsData.boundary.Boundary.map((point: Point) =>
      this.point2xy(point).join(',')
    ).join(' ');
  }

  tileClipPath(ix: number, iy: number): string {
    return this.gpsData.boundary.Boundary.reduce(
      (acc: string, point: Point, index: number) => {
        let [x, y] = this.point2xy(point);
        // translate to tile origin
        x -= ix * this.dims.cxTile;
        y -= iy * this.dims.cyTile;
        // scale appropriately
        x *= this.scale;
        y *= this.scale;
        if (index === 0) {
          return `M ${x} ${y}`;
        } else return `${acc} L ${x} ${y}`;
      },
      ''
    );
  }

  linear(point: Point): string {
    const [x, y] = this.point2xy(point);
    return `L ${x} ${y}`;
  }

  path(points: Point[], op: PathOp = 'linear'): string {
    return points.reduce(
      (acc: string, point: Point, ix: number, points: Point[]) => {
        if (ix === 0) {
          const [x, y] = this.point2xy(point);
          return `M ${x} ${y}`;
        } else return `${acc} ${this[op](point, ix, points)}`;
      },
      ''
    );
  }

  point2xy(point: Point): XY {
    const x =
      ((this.lon2x(point.lon) - this.lon2x(this.bounds.left)) *
        this.dims.cxNominal) /
      (this.lon2x(this.bounds.right) - this.lon2x(this.bounds.left));
    const y =
      ((this.lat2y(point.lat) - this.lat2y(this.bounds.top)) *
        this.dims.cyNominal) /
      (this.lat2y(this.bounds.bottom) - this.lat2y(this.bounds.top));
    return [x, y];
  }

  xy2point([x, y]: [number, number]): Point {
    const lon =
      this.bounds.left +
      (x / this.dims.cxNominal) * (this.bounds.right - this.bounds.left);
    const lat =
      this.bounds.top +
      (y / this.dims.cyNominal) * (this.bounds.bottom - this.bounds.top);
    return { lat, lon };
  }

  // @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

  lat2tile(lat: number): number {
    return Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, this.zoom)
    );
  }

  lon2tile(lon: number): number {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, this.zoom));
  }

  tile2lat(y: number): number {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, this.zoom);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  tile2lon(x: number): number {
    return (x / Math.pow(2, this.zoom)) * 360 - 180;
  }

  // @see https://wiki.openstreetmap.org/wiki/Mercator#JavaScript_.28or_ActionScript.29

  y2lat(y: number): number {
    return (Math.atan(Math.exp(y / RAD2DEG)) / PI_4 - 1) * 90;
  }

  x2lon(x: number): number {
    return x;
  }

  lat2y(lat: number): number {
    return Math.log(Math.tan((lat / 90 + 1) * PI_4)) * RAD2DEG;
  }

  lon2x(lon: number): number {
    return lon;
  }

  // @see https://www.geodatasource.com/developers/javascript

  distance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    units: 'feet' | 'meters' = 'feet'
  ): number {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.min(dist, 1);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    // OP puts it in miles first
    dist = dist * 60 * 1.1515;
    switch (units) {
      case 'feet':
        dist = dist * 5280;
        break;
      case 'meters':
        dist = dist * 1609.344;
        break;
      default:
        dist = undefined;
    }
    return Math.abs(dist);
  }

  // @see https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

  private controlPoint(
    [cx, cy]: XY,
    previous: XY,
    next: XY,
    reverse = false
  ): XY {
    previous = previous ?? [cx, cy];
    next = next ?? [cx, cy];
    // properties of opposed line
    const lineProps = this.lineProps(previous, next);
    // if is end-control-point, add PI to the angle to go backward
    const angle = lineProps.angle + (reverse ? Math.PI : 0);
    const length = lineProps.length * SMOOTHING;
    // control point position is relative to the current point
    const x = cx + Math.cos(angle) * length;
    const y = cy + Math.sin(angle) * length;
    return [x, y];
  }

  private lineProps([px, py]: XY, [qx, qy]: XY): LineProps {
    const lx = qx - px;
    const ly = qy - py;
    return {
      angle: Math.atan2(ly, lx),
      length: Math.sqrt(Math.pow(lx, 2) + Math.pow(ly, 2))
    };
  }

  // other helpers

  private parseInitialSearchParams(): any {
    if (location.search && location.search.length > 1) {
      const raw = location.search.substring(1).split('&');
      return raw.reduce((params, pair) => {
        const [k, v] = pair.split('=');
        // NOTE: a bit cheesy
        if (v === 'false') params[k] = false;
        else if (v === 'true') params[k] = true;
        else if (/^[0-9]*$/.test(v)) params[k] = Number(v);
        else params[k] = v;
        return params;
      }, {});
    } else return {};
  }
}
