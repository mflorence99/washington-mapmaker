import { Geometry } from './geometry';

import { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { merge } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

// NOTE: tune this to balance load time against the problem that too many
// concurrent XHR requests chokes the browser
const CONCURRENCY = 10;

export function makeTileParams(params: TileParams): TileParams {
  params.ready$ = new Subject<ImageBitmap>();
  return params;
}

export interface TileParams {
  filter?: string;
  ix: number;
  iy: number;
  ready$?: Subject<ImageBitmap>;
  src: string;
  threshold?: number;
  transparencies?: number[][];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-tiles',
  template: `<map-tile
    *ngFor="let params of tileParams"
    [params]="params"
  ></map-tile>`
})
export class TilesComponent implements AfterViewInit {
  @Input() tag: string;
  @Input() tileParams: TileParams[];

  constructor(public geometry: Geometry, private http: HttpClient) {}

  ngAfterViewInit(): void {
    const requests = this.tileParams.map((params) => {
      return forkJoin(
        this.http.get(params.src, { responseType: 'blob' }).pipe(
          mergeMap((blob: Blob) => this.createImageBitmap(blob)),
          catchError((_) => of(null))
        ),
        of(params)
      );
    });
    merge(...requests, CONCURRENCY).subscribe({
      complete: () =>
        console.log(
          `%c ${this.tag} completed`,
          'color: light-blue; font-weight: bold'
        ),
      next: ([bitmap, params]) => {
        if (bitmap) {
          params.ready$.next(bitmap);
          console.log(`${this.tag} loading ...`);
        }
      }
    });
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
