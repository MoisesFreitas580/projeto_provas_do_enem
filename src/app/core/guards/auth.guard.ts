import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../helpers/auth.service';
import { HandleMessagesService } from '../helpers/handle-messages.service';

export const authGuard: CanActivateFn = () => {
  const $auth = inject(AuthService);
  const $msg = inject(HandleMessagesService);
  const $router = inject(Router);
  const status = $auth.isAuthenticated();

  if (status === 'not_allowed') {
    $auth.is_logged.set(false);
    $msg.addMsgByList($msg.messages.auth.not_allowed);
    $router.navigateByUrl('/login');
    return false;
  }

  if (status === 'expired') {
    $auth.is_logged.set(false);
    $msg.addMsgByList($msg.messages.auth.expired);
    $router.navigateByUrl('/login');
    return false;
  }

  $auth.is_logged.set(true);
  return true;
};