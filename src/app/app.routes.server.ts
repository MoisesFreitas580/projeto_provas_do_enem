import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [

  { path: 'area/:id', renderMode: RenderMode.Server },
  { path: 'simulations/:id', renderMode: RenderMode.Server },
  { path: 'simulations-details/:simulationId', renderMode: RenderMode.Server },
  { path: 'attempt-sessions-exam/:examId', renderMode: RenderMode.Server },
  { path: 'attempt-sessions-simulation/:sessionId', renderMode: RenderMode.Server },
  { path: 'attempt-sessions-avulso/:avulsoId', renderMode: RenderMode.Server },

  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];