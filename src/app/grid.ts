import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-grid',
  template: `<svg
    attr.viewPort="0 0 {{ geometry.dims.cxNominal }} {{
      geometry.dims.cyNominal
    }}"
  >
    <g>
      <g [attr.transform]="translate()">
        <g id="border">
          <path [attr.d]="border()" />
        </g>
        <g id="gridlines">
          <path *ngFor="let line of hlines()" [attr.d]="line" />
          <path *ngFor="let line of vlines()" [attr.d]="line" />
        </g>
      </g>
    </g>
  </svg>`
})
export class GridComponent {
  constructor(public geometry: Geometry) {}

  border(): string {
    return `M 1,1 
    L ${this.geometry.clip.cx - 1},1
    L ${this.geometry.clip.cx - 1},${this.geometry.clip.cy - 1} 
    L 1,${this.geometry.clip.cy - 1}  
    Z`;
  }

  hlines(): string[] {
    const gap = this.geometry.clip.cy / this.geometry.dims.numHGrids;
    const lines = [];
    for (let y = gap; y < this.geometry.clip.cy; y += gap)
      lines.push(`M 0,${y} L ${this.geometry.clip.cx - 1},${y}`);
    return lines;
  }

  translate(): string {
    return `translate(${this.geometry.clip.x}, ${this.geometry.clip.y})`;
  }

  vlines(): string[] {
    const gap = this.geometry.clip.cx / this.geometry.dims.numVGrids;
    const lines = [];
    for (let x = gap; x < this.geometry.clip.cx; x += gap)
      lines.push(`M ${x},0 L ${x},${this.geometry.clip.cy - 1}`);
    return lines;
  }
}
