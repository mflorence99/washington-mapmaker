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
import { TopoComponent } from './topo';

import { BrowserModule } from '@angular/platform-browser';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

// @see https://stackoverflow.com/questions/55328832

@NgModule({
  imports: [FontAwesomeModule]
})
class IconsModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fab, far, fas);
  }
}

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
  BrowserModule,
  FontAwesomeModule,
  HttpClientModule,
  IconsModule
];

@NgModule({
  bootstrap: [RootComponent],

  declarations: [...COMPONENTS],

  imports: [...MODULES]
})
export class MapModule {}
