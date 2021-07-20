import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-body',
  template: `<ng-content></ng-content>>`
})
export class BodyComponent {}
