import { BoundaryComponent } from './boundary';
import { CacheInterceptor } from './cache';
import { RootComponent } from './root';
import { StreetComponent } from './street';
import { TileComponent } from './tile';

import { BrowserModule } from '@angular/platform-browser';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
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
  RootComponent,
  StreetComponent,
  TileComponent
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

  imports: [...MODULES],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    }
  ]
})
export class MapModule {}
