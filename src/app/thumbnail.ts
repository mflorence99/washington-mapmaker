import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: Geometry },
    { provide: 'params', useValue: { thumbnail: true } }
  ],
  selector: 'map-thumbnail',
  template: `<figure *ngIf="geometry.ready$ | async">
    <map-topo></map-topo>
    <map-washington></map-washington>
    <map-street></map-street>
    <map-boundary></map-boundary>
    <map-grid></map-grid>
  </figure>`
})
export class ThumbnailComponent {
  constructor(public geometry: Geometry) {}
}
