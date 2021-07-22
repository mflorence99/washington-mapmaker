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
  building$: number;
  callouts: Point[];
  centers: Point[];
  cu$: number;
  id: string;
  labels?: LotLabel[];
  land$: number;
  neighborhood?: string;
  // NOTE: lot orientation in degrees
  orientations: number[];
  owner?: string;
  // NOTE 1 means lot is more square, 0 more elongated
  sqarcities: number[];
  taxed$: number;
  usage: string;
  use?: string;
  zone?: string;
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
