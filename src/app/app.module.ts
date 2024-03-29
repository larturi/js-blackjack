import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { JuegoComponent } from './components/juego/juego.component';
import { ReglamentoComponent } from './components/reglamento/reglamento.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    JuegoComponent,
    ReglamentoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
