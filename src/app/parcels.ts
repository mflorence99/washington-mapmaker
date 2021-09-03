import { PARCELS } from './parcel-data';
import { Point } from './geometry';

import { Injectable } from '@angular/core';

export interface LotLabel {
  clazz?: string;
  rotate?: boolean;
  split?: boolean;
}

export interface Lot {
  abutters?: string[];
  address?: string;
  area: number;
  areas?: number[];
  boundaries: Point[][];
  building$: number;
  callouts?: Point[];
  centers?: Point[];
  cu$?: number;
  id: string;
  labels?: LotLabel[];
  land$?: number;
  minWidths?: number[];
  neighborhood?: string;
  // 👇 lot orientation in degrees
  orientations?: number[];
  owner?: string;
  // 👇 1 means lot is more square, 0 more elongated
  sqarcities?: number[];
  taxed$?: number;
  usage?: string;
  use?: string;
  zone?: string;
}

export interface Lots {
  areaByUsage: Record<string, number>;
  descByUsage: Record<string, string>;
  descByUse: Record<string, string>;
  lots: Lot[];
  usages: string[];
  uses: string[];
}

@Injectable({ providedIn: 'root' })
export class Parcels {
  parcels: Lots = PARCELS;

  constructor() {
    const areaByUsage: Record<string, number> = {};
    this.parcels.lots.forEach((lot) => {
      // 👇 accumulate area by usage using CALCULATED area
      // that gives the most accurate measurement
      const acc = areaByUsage[lot.usage];
      const area = lot.areas.reduce((total, area) => total + area, 0);
      areaByUsage[lot.usage] = acc ? acc + area : area;
    });
    // store area by usage
    this.parcels.areaByUsage = areaByUsage;
  }
}
