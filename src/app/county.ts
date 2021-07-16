import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: Geometry },
    { provide: 'params', useValue: { thumbnail: 'sullivan' } }
  ],
  selector: 'map-county',
  template: `<figure *ngIf="geometry.ready$ | async">
    <map-street [provider]="'arcgis'" [tag]="'County thumbnail'"></map-street>
    <map-boundary boundary="washington"></map-boundary>
    <map-boundary></map-boundary>
    <map-grid></map-grid>
  </figure>`
})
export class CountyComponent {
  constructor(public geometry: Geometry) {}
}
