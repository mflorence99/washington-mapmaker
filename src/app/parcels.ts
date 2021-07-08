import { LANDGRID } from './landgrid';
import { Point } from './geometry';

import { Injectable } from '@angular/core';

export interface LotLabel {
  clazz?: string;
  rotate?: boolean;
  split?: boolean;
}

export interface Lot {
  address: string;
  area: number;
  areas: number[];
  boundaries: Point[][];
  callouts: Point[];
  centers: Point[];
  id: string;
  labels?: LotLabel[];
  // NOTE: lot orientation in degrees
  orientations: number[];
  // NOTE 1 means lot is more square, 0 more elongated
  sqarcities: number[];
  usage: string;
}

export interface Lots {
  areaByUsage: Record<string, number>;
  countByUsage: Record<string, number>;
  descByUsage: Record<string, string>;
  lots: Lot[];
  usages: string[];
}

@Injectable({ providedIn: 'root' })
export class Parcels {
  parcels: Lots = LANDGRID;
}
