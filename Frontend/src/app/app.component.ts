import { isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from './services/auth/auth.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { AccountService } from './services/account/account.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private platformId: Object;

  constructor(public authService: AuthService, private accountService: AccountService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
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
