import { Geometry } from './geometry';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: Geometry },
    { provide: 'params', useValue: { thumbnail: 'nh' } }
  ],
  selector: 'map-state',
  template: `<figure *ngIf="geometry.ready$ | async">
    <map-street [provider]="'arcgis'" [tag]="'State thumbnail'"></map-street>
    <map-boundary boundary="sullivan"></map-boundary>
    <map-boundary></map-boundary>
    <map-grid></map-grid>
  </figure>`
})
export class StateComponent {
  constructor(public geometry: Geometry) {}
}
