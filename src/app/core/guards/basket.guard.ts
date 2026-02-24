import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { BasketService } from '../services/basket.service';

/**
 * Guard to prevent navigation to checkout when basket is empty
 * Redirects to home page if basket has no items
 */
export const basketGuard: CanActivateFn = () => {
  const basketService = inject(BasketService);
  const router = inject(Router);

  if (basketService.basket().itemCount === 0) {
    return router.createUrlTree(['/']);
  }

  return true;
};
