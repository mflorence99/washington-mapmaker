import { Geometry } from './geometry';
import { TileParams } from './tiles';

import { makeTileParams } from './tiles';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-street',
  template: `<map-tiles [tag]="tag" [tileParams]="tileParams"></map-tiles>`
})
export class StreetComponent implements OnInit {
  @Input() provider: 'arcgis' | 'osm';
  @Input() tag: string;

  tileParams: TileParams[] = [];

  constructor(public geometry: Geometry) {}

  ngOnInit(): void {
    for (let iy = 0; iy < this.geometry.dims.numYTiles; iy++) {
      for (let ix = 0; ix < this.geometry.dims.numXTiles; ix++) {
        const x = this.geometry.xTiles[ix];
        const y = this.geometry.yTiles[iy];
        const params: TileParams = makeTileParams({
          alpha: 0,
          filter: null,
          ix: ix,
          iy: iy,
          src: `/street/${this.provider}/${this.geometry.zoom}/${x}/${y}`,
          threshold: 16,
          transparent: [242, 239, 233]
        });
        this.tileParams.push(params);
      }
    }
  }
}
