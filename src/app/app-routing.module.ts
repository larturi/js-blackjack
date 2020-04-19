import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JuegoComponent } from './components/juego/juego.component';
import { ReglamentoComponent } from './components/reglamento/reglamento.component';

const routes: Routes = [
  {path: 'juego', component: JuegoComponent},
  {path: 'reglamento', component: ReglamentoComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'juego'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
