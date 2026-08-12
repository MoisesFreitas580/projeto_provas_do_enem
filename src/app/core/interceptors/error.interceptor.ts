import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../helpers/auth.service';
import { ToastService } from '@components/toast/toast.component.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const toastService = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            if (error.status === 401 && !req.url.includes('/auth/login')) {
                authService.logout();
                toastService.show('Sua sessão expirou. Faça login novamente.', 'error');
            }

            else if (error.status === 0 || error.status >= 500) {
                toastService.show('Erro de conexão com o servidor. Tente novamente em instantes.', 'error');
            }


            return throwError(() => error);
        })
    );
};