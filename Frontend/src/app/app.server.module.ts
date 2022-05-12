import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';
import { IonicServerModule } from '@ionic/angular-server';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    FlexLayoutServerModule,
    IonicServerModule
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule { }
