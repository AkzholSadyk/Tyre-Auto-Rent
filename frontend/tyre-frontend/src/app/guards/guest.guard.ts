import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser) {
    router.navigateByUrl('/cars');
    return false;
  }
  if (auth.getToken()) {
    router.navigateByUrl('/cars');
    return false;
  }

  return true;
};
