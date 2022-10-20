import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { from, map, Observable } from 'rxjs';
import { AccountService } from '../services/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageGuard implements CanActivate {

  constructor(
    public accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (next.params && next.params.language) {
      const language = next.params.language;
      return from(this.accountService.setLanguage(language)).pipe(map(() => true));
    } else {
      return true;
    }
  }
}