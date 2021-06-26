import { BoundaryComponent } from './boundary';
import { GridComponent } from './grid';
import { IndicesComponent } from './indices';
import { LegendComponent } from './legend';
import { LotsComponent } from './lots';
import { RootComponent } from './root';
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
  BoundaryComponent,
  GridComponent,
  IndicesComponent,
  LegendComponent,
  LotsComponent,
  RootComponent,
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
