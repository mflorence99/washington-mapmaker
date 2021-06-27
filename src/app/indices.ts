import { Geometry } from './geometry';
import { Profile } from './profiles';
import { PROFILES } from './profiles';
import { Rectangle } from './geometry';

import { bbox } from './profiles';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-indices',
  template: `
    <ng-container *ngFor="let profile of profiles()">
      <ng-container *ngIf="rect(profile) as css">
        <article
          [ngStyle]="{
            'left.px': css.left,
            'top.px': css.top,
            'width.px': css.width,
            'height.px': css.height
          }"
        >
          {{ profile.title }}
        </article>
      </ng-container>
    </ng-container>
  `
})
export class IndicesComponent {
  constructor(public geometry: Geometry) {}

  profiles(): Profile[] {
    return Object.values(PROFILES);
  }

  rect(profile: Profile): Rectangle {
    return this.geometry.latlon2css(bbox(profile));
  }
}
