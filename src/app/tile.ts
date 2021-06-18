import { Geometry } from './geometry';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ViewChild } from '@angular/core';

import { mergeMap } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-tile',
  template: `<canvas #canvas></canvas>
    <img class="outside" #outside />
    <img
      class="inside"
      style="clip-path: path('{{ geometry.tileClipPath(ix, iy) }}')"
      #inside
    />`
})
export class TileComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas;
  @ViewChild('inside', { static: true }) inside;
  @ViewChild('outside', { static: true }) outside;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input() alpha: number;
  @Input() ix: number;
  @Input() iy: number;
  @Input() src: string;
  @Input() threshold: number;
  @Input() transparent: number[];

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
        if (this.transparent) {
          // munge the image for transparency
          const imageData = ctx.getImageData(
            0,
            0,
            this.geometry.dims.cxTile,
            this.geometry.dims.cyTile
          );
          const pixels = imageData.data;
          for (let ix = 0; ix < pixels.length; ix += 4) {
            const pixel = [pixels[ix], pixels[ix + 1], pixels[ix + 2]];
            if (this.comparePixel(pixel, this.transparent, this.threshold))
              pixels[ix + 3] = this.alpha;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        // draw the munged image twice
        // ... outside is filtered sepia
        const outside = this.outside.nativeElement;
        outside.src = canvas.toDataURL();
        // ... inside is clipped to boundary
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
