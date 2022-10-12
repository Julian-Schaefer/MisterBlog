import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageGuard implements CanActivate {

  constructor(
    public translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (next.params && next.params.language) {
      const language = next.params.language;
      return this.translateService.use(language).pipe(map(() => true));
    } else {
      return true;
    }
  }
}