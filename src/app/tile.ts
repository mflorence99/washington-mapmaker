import { Geometry } from './geometry';
import { Point } from './gps-data';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ViewChild } from '@angular/core';

import { mergeMap } from 'rxjs/operators';

// @see rampgenerator.com
export type Ramp = {
  color: string;
  value: number;
};

type RGBA = [r: number, g: number, b: number, a: number];

type CLUT = Record<number, RGBA>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-tile',
  template: `<canvas #canvas></canvas>
    <img class="outside" [src]="src" #outside />
    <img
      class="inside"
      style="clip-path: path('{{ clipPath(ix, iy) }}'); filter: {{
        this.filter ?? 'none'
      }};"
      [src]="src"
      #inside
    />`
})
export class TileComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas;
  @ViewChild('inside', { static: true }) inside;
  @ViewChild('outside', { static: true }) outside;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input() alpha: number;
  @Input() filter: string;
  @Input() ix: number;
  @Input() iy: number;
  @Input() src: string;
  @Input() threshold: number;
  @Input() transparent: number[];

  private clut: CLUT;

  constructor(public geometry: Geometry, private http: HttpClient) {}

  clipPath(ix: number, iy: number): string {
    return this.geometry.gpsData.boundary.Boundary.reduce(
      (acc: string, point: Point, index: number) => {
        let [x, y] = this.geometry.point2xy(point);
        // translate to tile origin
        x -= ix * this.geometry.dims.cxTile;
        y -= iy * this.geometry.dims.cyTile;
        // scale appropriately
        x *= this.geometry.scale;
        y *= this.geometry.scale;
        if (index === 0) {
          return `M ${x} ${y}`;
        } else return `${acc} L ${x} ${y}`;
      },
      ''
    );
  }

  ngAfterViewInit(): void {
    this.http
      .get(this.src, { responseType: 'blob' })
      .pipe(mergeMap((blob: Blob) => this.createImageBitmap(blob)))
      .subscribe((bitmap: ImageBitmap) => {
        // draw the bitmap on the canvas
        const canvas = this.canvas.nativeElement;
        canvas.height = this.geometry.dims.cyTile;
        canvas.width = this.geometry.dims.cxTile;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        // ONLY for ramp transform, transparency
        if (this.transparent) {
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
            if (this.comparePixel(pixel, this.transparent, this.threshold))
              pixels[ix + 3] = this.alpha;
          }
          // update the image pixels
          ctx.putImageData(imageData, 0, 0);
        }
        // draw the munged image
        const outside = this.outside.nativeElement;
        outside.src = canvas.toDataURL();
        const inside = this.inside.nativeElement;
        inside.src = canvas.toDataURL();
      });
  }

  private comparePixel(p: number[], q: number[], threshold: number): boolean {
    return (
      Math.abs(p[0] - q[0]) < threshold &&
      Math.abs(p[1] - q[1]) < threshold &&
      Math.abs(p[2] - q[2]) < threshold
    );
  }

  private createImageBitmap(blob: Blob): Observable<ImageBitmap> {
    return new Observable<ImageBitmap>((observer) => {
      createImageBitmap(blob)
        .then((bitmap) => {
          observer.next(bitmap);
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  }
}
