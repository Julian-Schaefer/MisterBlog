import { isPlatformServer } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private platformId: Object;

  constructor(public authService: AuthService, private translateService: TranslateService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    @Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;

    translateService.addLangs(['de', 'en']);
    const defaultLang = this.translateService.getBrowserLang();

    this.translateService.setDefaultLang(defaultLang);
    this.translateService.use(defaultLang);

    this.registerIcon("google_signin", './assets/svg/google_signin.svg');
    this.registerIcon("twitter", './assets/svg/twitter.svg');
    this.registerIcon("apple", './assets/svg/apple.svg');
  }

  private registerIcon(name: string, filename: string) {
    if (isPlatformServer(this.platformId)) {
      /* Register empty icons for server-side-rendering to prevent errors */
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml('<svg></svg>'));
    } else {
      this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(filename));
    }
  }
}
