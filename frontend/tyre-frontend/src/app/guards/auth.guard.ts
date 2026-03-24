import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser) {
    return true;
  }

  if (!auth.getToken()) {
    return router.parseUrl('/login');
  }

  return auth.loadCurrentUser().pipe(
    map(() => true),
    catchError(() => of(router.parseUrl('/login')))
  );
};
