import { BodyComponent } from './body';
import { BorderComponent } from './border';
import { BoundaryComponent } from './boundary';
import { BuildingsComponent } from './buildings';
import { ClipComponent } from './clip';
import { CountyComponent } from './county';
import { DefsComponent } from './defs';
import { GridComponent } from './grid';
import { IndicesComponent } from './indices';
import { LegendComponent } from './legend';
import { LotLabelsComponent } from './lot-labels';
import { LotsComponent } from './lots';
import { RootComponent } from './root';
import { ScaleComponent } from './scale';
import { StateComponent } from './state';
import { StreetComponent } from './street';
import { SymbolsComponent } from './symbols';
import { TileComponent } from './tile';
import { TilesComponent } from './tiles';
import { TimesPipe } from './times';
import { TopoComponent } from './topo';

import { AngularSvgIconModule } from 'angular-svg-icon';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

const COMPONENTS = [
  BodyComponent,
  BorderComponent,
  BoundaryComponent,
  BuildingsComponent,
  ClipComponent,
  CountyComponent,
  DefsComponent,
  GridComponent,
  IndicesComponent,
  LegendComponent,
  LotLabelsComponent,
  LotsComponent,
  RootComponent,
  ScaleComponent,
  StateComponent,
  StreetComponent,
  SymbolsComponent,
  TileComponent,
  TilesComponent,
  TopoComponent
];

const MODULES = [
  AngularSvgIconModule.forRoot(),
  BrowserModule,
  HttpClientModule
];

const PIPES = [TimesPipe];

@NgModule({
  bootstrap: [RootComponent],

  declarations: [...COMPONENTS, ...PIPES],

  imports: [...MODULES]
})
export class MapModule {}
