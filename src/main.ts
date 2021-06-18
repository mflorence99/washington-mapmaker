import { MapModule } from './app/module';

import { ApplicationRef } from '@angular/core';

import { enableDebugTools } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic()
  .bootstrapModule(MapModule)
  .then((moduleRef) => {
    // @see https://blog.ninja-squad.com/2018/09/20/angular-performances-part-3/
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    const componentRef = applicationRef.components[0];
    enableDebugTools(componentRef);
  })
  .catch((err) => console.log(err));
