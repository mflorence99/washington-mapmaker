import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'map-legend',
  template: `<header>
    <h1>Town of Washington</h1>
    <h2>New Hampshire</h2>
  </header>`
})
export class LegendComponent {}
