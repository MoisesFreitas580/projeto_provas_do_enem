import { Routes } from '@angular/router';
import { HomeComponent } from '@page/home/home.component';
import { DetailsAreaComponent } from '@page/details-area/details-area.component';
import { SimulationsDetailsComponent } from '@page/simulations-details/simulations-details.component';
import { LoginComponent } from '@page/login/login.component';
import { authGuard } from '@guards/auth.guard';
import { outsideGuard } from '@guards/outside.guard';
import { SelectExamComponent } from '@components/select-exam/select-exam.component';
import { AttemptSessionExamComponent } from '@components/attempt-sessions-exam/attempt-sessions-exam.component';
import { GenerateSimulationComponent } from '@components/generate-simulation/generate-simulation.component';
import { AttemptSessionSimulationComponent } from '@components/attempt-sessions-simulation/attempt-sessions-simulation.component';
import { AttemptSessionAvulsoComponent } from '@components/attempt-sessions-avulso/attempt-sessions-avulso.component';
import { UserProfileComponent } from '@components/user-profile/user-profile.component';
import { StatisticsComponent } from '@page/statistics/statistics.component';

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
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [outsideGuard],
  },
  {
    path: 'exams',
    component: SelectExamComponent,
    canActivate: [authGuard],
  },
  {
    path: 'generate-simulation',
    component: GenerateSimulationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'attempt-sessions-exam/:examId',
    component: AttemptSessionExamComponent,   // ← descomentar quando criar
    canActivate: [authGuard],
  },
  {
    path: 'attempt-sessions-simulation/:sessionId',
    component: AttemptSessionSimulationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'simulations-details/:simulationId',
    component: SimulationsDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'attempt-sessions-avulso/:avulsoId',
    component: AttemptSessionAvulsoComponent,
    canActivate: [authGuard],
  },
  { path: 'statistics', component: StatisticsComponent },
  {
    path: '**',
    redirectTo: '',
  },
];