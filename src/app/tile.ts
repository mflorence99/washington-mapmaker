import { Geometry } from './geometry';
import { Point } from './geometry';
import { TileParams } from './tiles';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ViewChild } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-tile',
  template: `<canvas #canvas></canvas>
    <img class="outside" #outside />
    <img
      class="inside"
      style="clip-path: path('{{ clipPath(params.ix, params.iy) }}'); filter: {{
        params.filter ?? 'none'
      }};"
      #inside
    />`
})
export class TileComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas;
  @ViewChild('inside', { static: true }) inside;
  @ViewChild('outside', { static: true }) outside;

  @Input() params: TileParams;

  constructor(public geometry: Geometry) {}

  clipPath(ix: number, iy: number): string {
    return this.geometry.gpsData.boundary.Boundary.reduce(
      (acc: string, point: Point, index: number) => {
        let [x, y] = this.geometry.point2xy(point);
        // translate to tile origin
        x -= ix * this.geometry.dims.cxTile;
        y -= iy * this.geometry.dims.cyTile;
        if (index === 0) {
          return `M ${x} ${y}`;
        } else return `${acc} L ${x} ${y}`;
      },
      ''
    );
  }

  ngAfterViewInit(): void {
    this.params.ready$.subscribe((bitmap: ImageBitmap) => {
      // draw the bitmap on the canvas
      const canvas = this.canvas.nativeElement;
      canvas.height = this.geometry.dims.cyTile;
      canvas.width = this.geometry.dims.cxTile;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      // ONLY for transparency
      if (this.params.transparencies) {
        // grab the image pixels
        const imageData = ctx.getImageData(
          0,
          0,
          this.geometry.dims.cxTile,
          this.geometry.dims.cyTile
        );
        const pixels: number[] = imageData.data;
        // transform pixels ...
        for (let ix = 0; ix < pixels.length; ix += 4) {
          const pixel = [pixels[ix], pixels[ix + 1], pixels[ix + 2]];
          this.params.transparencies.forEach((transparent) => {
            if (this.comparePixel(pixel, transparent, this.params.threshold))
              pixels[ix + 3] = transparent[3];
          });
        }
        // update the image pixels
        ctx.putImageData(imageData, 0, 0);
      }
      // draw the munged image
      const data = canvas.toDataURL();
      const outside = this.outside.nativeElement;
      outside.src = data;
      const inside = this.inside.nativeElement;
      inside.src = data;
    });
  }

  private comparePixel(p: number[], q: number[], threshold: number): boolean {
    return (
      Math.abs(p[0] - q[0]) < threshold &&
      Math.abs(p[1] - q[1]) < threshold &&
      Math.abs(p[2] - q[2]) < threshold
    );
  }
}
