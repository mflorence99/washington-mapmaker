import { Geometry } from './geometry';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Observable } from 'rxjs';
import { OnInit } from '@angular/core';
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
      style="clip-path: path('{{ geometry.clipPath(ix, iy) }}'); filter: {{
        this.filter ?? 'none'
      }};"
      [src]="src"
      #inside
    />`
})
export class TileComponent implements AfterViewInit, OnInit {
  @ViewChild('canvas', { static: true }) canvas;
  @ViewChild('inside', { static: true }) inside;
  @ViewChild('outside', { static: true }) outside;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input() alpha: number;
  @Input() filter: string;
  @Input() ix: number;
  @Input() iy: number;
  @Input() ramp: Ramp[];
  @Input() src: string;
  @Input() threshold: number;
  @Input() transparent: number[];

  private clut: CLUT;

  constructor(public geometry: Geometry, private http: HttpClient) {}

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
        if (this.ramp || this.transparent) {
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
            // ... color transformation
            // NOTE: not currently used
            if (this.ramp) {
              const value =
                256 -
                Math.trunc((pixels[ix] + pixels[ix + 1] + pixels[ix + 2]) / 3);
              const rgba = this.clut[value];
              if (rgba) {
                pixels[ix] = rgba[0];
                pixels[ix + 1] = rgba[1];
                pixels[ix + 2] = rgba[2];
                pixels[ix + 3] = rgba[3];
              } else console.error(value);
            }
            // ... make transparent
            if (this.transparent) {
              const pixel = [pixels[ix], pixels[ix + 1], pixels[ix + 2]];
              if (this.comparePixel(pixel, this.transparent, this.threshold))
                pixels[ix + 3] = this.alpha;
            }
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

  ngOnInit(): void {
    if (this.ramp) {
      // convert color ramp to CLUT
      this.clut = this.ramp.reduce((acc: CLUT, ramp: Ramp) => {
        acc[ramp.value] = this.hexToRGBA(ramp.color);
        return acc;
      }, {});
    }
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

  // @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  private hexToRGBA(hex: string): RGBA {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16),
      this.alpha
    ];
  }
}
