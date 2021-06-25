import '../assets/data/parcels.js';

import { Injectable } from '@angular/core';

declare const PARCELS: Lots;

export interface Lot {
  geometry: {
    coordinates: [[[number, number]]];
    type: 'Polygon' | 'MultiPolygon';
  };
  id: number;
  properties: {
    address: string;
    path: string;
    pid: string;
  };
}

export interface Lots {
  lots: Lot[];
  usageByArea: Record<string, number>;
  usageByCode: Record<string, string>;
  usageByCount: Record<string, number>;
  usageByDesc: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class Parcels {
  parcels: Lots = PARCELS;
}
