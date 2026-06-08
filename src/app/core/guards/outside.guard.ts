import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@helpers/auth.service';

export const outsideGuard: CanActivateFn = () => {
  const $auth = inject(AuthService);
  const $router = inject(Router);

  // Se já tem sessão válida, redireciona para home
  if ($auth.isAuthenticated() === 'access') {
    $router.navigateByUrl('/');
    return false;
  }

  return true;
};