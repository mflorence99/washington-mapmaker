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
    <map-street [provider]="'arcgis'" [tag]="'Thumbnail street'"></map-street>
    <map-washington></map-washington>
    <map-boundary></map-boundary>
    <map-grid></map-grid>
  </figure>`
})
export class ThumbnailComponent {
  constructor(public geometry: Geometry) {}
}
