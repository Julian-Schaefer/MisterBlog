import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Blogify';

  constructor(public authService: AuthService, private translateService: TranslateService) {
    translateService.addLangs(['de', 'en']);
    const defaultLang = this.translateService.getBrowserLang();

    this.translateService.setDefaultLang(defaultLang);
    this.translateService.use(defaultLang);
  }
}
