import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-tile',
  template: ` <img class="outside" [src]="src" #outside />
    <img
      class="inside"
      style="clip-path: path('{{ geometry.tileClipPath(ix, iy) }}')"
      [src]="src"
      #inside
    />`
})
export class TileComponent {
  @Input() ix: number;
  @Input() iy: number;
  @Input() src: string;

  constructor(public geometry: Geometry) {}
}
