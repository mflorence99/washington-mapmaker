import { Geometry } from './geometry';
import { TileParams } from './tiles';

import { makeTileParams } from './tiles';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-topo',
  template: `<map-tiles [tileParams]="tileParams"></map-tiles>`
})
export class TopoComponent {
  tileParams: TileParams[] = [];

  constructor(public geometry: Geometry) {
    for (let iy = 0; iy < this.geometry.dims.numYTiles; iy++) {
      for (let ix = 0; ix < this.geometry.dims.numXTiles; ix++) {
        const x = this.geometry.xTiles[ix];
        const y = this.geometry.yTiles[iy];
        const params: TileParams = makeTileParams({
          filter: 'saturate(4)',
          ix: ix,
          iy: iy,
          src: `/topo/arcgis/${this.geometry.zoom}/${x}/${y}`
        });
        this.tileParams.push(params);
      }
    }
  }
}
