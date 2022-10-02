import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    public authService: AuthService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.isLoggedIn.subscribe(loggedIn => {
        if (loggedIn) {
          return true;
        } else {
          this.router.navigate(['']);
          return false;
        }
      });
    } else if (isPlatformServer(this.platformId)) {
      return of(true);
    } else {
      return false;
    }
  }

}
