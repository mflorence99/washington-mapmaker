import { BodyComponent } from './body';
import { BorderComponent } from './border';
import { BoundaryComponent } from './boundary';
import { ClipComponent } from './clip';
import { CountyComponent } from './county';
import { DefsComponent } from './defs';
import { GridComponent } from './grid';
import { IndicesComponent } from './indices';
import { LegendComponent } from './legend';
import { LotLabelsComponent } from './lot-labels';
import { LotsComponent } from './lots';
import { PolygonsComponent } from './polygons';
import { RootComponent } from './root';
import { ScaleComponent } from './scale';
import { StateComponent } from './state';
import { StreetComponent } from './street';
import { TileComponent } from './tile';
import { TilesComponent } from './tiles';
import { TimesPipe } from './times';
import { TopoComponent } from './topo';

import { AngularSvgIconModule } from 'angular-svg-icon';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

const COMPONENTS = [
  BodyComponent,
  BorderComponent,
  BoundaryComponent,
  ClipComponent,
  CountyComponent,
  DefsComponent,
  GridComponent,
  IndicesComponent,
  LegendComponent,
  LotLabelsComponent,
  LotsComponent,
  PolygonsComponent,
  RootComponent,
  ScaleComponent,
  StateComponent,
  StreetComponent,
  TileComponent,
  TilesComponent,
  TopoComponent
];

const MODULES = [
  AngularSvgIconModule.forRoot(),
  BrowserModule,
  FontAwesomeModule,
  HttpClientModule
];

const PIPES = [TimesPipe];

@NgModule({
  bootstrap: [RootComponent],

  declarations: [...COMPONENTS, ...PIPES],

  imports: [...MODULES]
})
export class MapModule {}
