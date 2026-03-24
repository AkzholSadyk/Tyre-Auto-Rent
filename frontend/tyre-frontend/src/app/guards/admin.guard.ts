import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser) {
    return auth.isAdmin() ? true : router.parseUrl('/cars');
  }

  if (!auth.getToken()) {
    return router.parseUrl('/login');
  }

  return auth.loadCurrentUser().pipe(
    map((user) => (user.role === 'admin' ? true : router.parseUrl('/cars'))),
    catchError(() => of(router.parseUrl('/login')))
  );
};
