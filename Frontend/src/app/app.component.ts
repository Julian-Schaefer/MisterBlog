import { DOCUMENT, isPlatformServer } from '@angular/common';
import { Component, Inject, Injector, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from './services/auth/auth.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { AccountService } from './services/account/account.service';
import { GoogleAnalyticsInitializer, IGoogleAnalyticsSettings, NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN, NGX_GTAG_FN } from 'ngx-google-analytics';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private platformId: Object;
  private statusChangeSubscription!: Subscription;

  constructor(public authService: AuthService, private accountService: AccountService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private cookieConsentService: NgcCookieConsentService,
    private cookieService: CookieService,
    private injector: Injector,
    @Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  ngOnInit(): void {
    if (Capacitor.isPluginAvailable('StatusBar')) {
      StatusBar.setStyle({
        style: Style.Dark
      });

      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setBackgroundColor({ color: '#00008b' });
      }
    }

    this.accountService.setLanguage();

    this.registerIcon("google_signin", './assets/svg/google_signin.svg');
    this.registerIcon("twitter", './assets/svg/twitter.svg');
    this.registerIcon("apple", './assets/svg/apple.svg');

    const cookieConsentStatus = this.cookieService.get("cookieconsent_status");
    if (cookieConsentStatus && cookieConsentStatus === 'allow') {
      this.initializeGoogleAnalytics();
    } else {
      window['ga-disable-' + environment.gaTrackingCode] = true;
    }

    this.statusChangeSubscription = this.cookieConsentService.statusChange$.subscribe(async (result) => {
      if (result.status) {
        if (result.status === 'allow') {
          this.initializeGoogleAnalytics();
        } else if (result.status === 'deny') {
          this.cookieService.deleteAll();
          window.location.reload();
        }
      }
    });

  }

  ngOnDestroy(): void {
    this.statusChangeSubscription?.unsubscribe();
  }

  private registerIcon(name: string, filename: string) {
    if (isPlatformServer(this.platformId)) {
      /* Register empty icons for server-side-rendering to prevent errors */
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml('<svg></svg>'));
    } else {
      this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(filename));
    }
  }

  private async initializeGoogleAnalytics() {
    const settings: IGoogleAnalyticsSettings = {
      trackingCode: environment.gaTrackingCode
    };

    const initGA = await GoogleAnalyticsInitializer(settings, this.injector.get(NGX_GTAG_FN), this.injector.get(DOCUMENT));
    await initGA();
  }
}
