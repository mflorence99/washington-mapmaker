import '../assets/data/parcels.js';

import { Point } from './geometry';

import { Injectable } from '@angular/core';

declare const PARCELS: Lots;

export interface Lot {
  area: number;
  boundaries: Point[][];
  centers: Point[];
  id: string;
  usage: string;
}

export interface Lots {
  areaByUsage: Record<string, number>;
  countByUsage: Record<string, number>;
  descByUsage: Record<string, string>;
  lots: Lot[];
}

@Injectable({ providedIn: 'root' })
export class Parcels {
  parcels: Lots = PARCELS;
}
