import { Geometry } from './geometry';
import { TileParams } from './tiles';

import { makeTileParams } from './tiles';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-street',
  template: `<map-tiles [tileParams]="tileParams"></map-tiles>`
})
export class StreetComponent {
  tileParams: TileParams[] = [];

  constructor(public geometry: Geometry) {
    for (let iy = 0; iy < this.geometry.dims.numYTiles; iy++) {
      for (let ix = 0; ix < this.geometry.dims.numXTiles; ix++) {
        const x = this.geometry.xTiles[ix];
        const y = this.geometry.yTiles[iy];
        const params: TileParams = makeTileParams({
          alpha: 0,
          filter: null,
          ix: ix,
          iy: iy,
          src: `/street/osm/${this.geometry.zoom}/${x}/${y}`,
          threshold: 16,
          transparent: [242, 239, 233]
        });
        this.tileParams.push(params);
      }
    }
  }
}
