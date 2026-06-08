import { Routes } from '@angular/router';
import { HomeComponent } from '@page/home/home.component';
import { DetailsAreaComponent } from '@page/details-area/details-area.component';
import { SimulationsDetailsComponent } from '@page/simulations-details/simulations-details.component';
import { LoginComponent } from '@page/login/login.component';
import { authGuard } from '@guards/auth.guard';
import { outsideGuard } from '@guards/outside.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],        
  },
  {
    path: 'area/:id',
    component: DetailsAreaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'simulations/:id',
    component: SimulationsDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [outsideGuard],    
  },
  {
    path: '**',
    redirectTo: '',
  },
];