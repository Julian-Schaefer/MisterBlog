import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, from, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

@Injectable(
    { providedIn: "root" }
)
export class AccountService {

    private static languageKey = "currLang";

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient,
        private authService: AuthService,
        private translateService: TranslateService,
        private cookieConsentService: NgcCookieConsentService,
        private localStorageService: LocalStorageService) { }

    deleteAccount(): Observable<void> {
        return from(this.http.delete(this.baseUrl + "/account")).pipe(map(() => {
            this.authService.signOut()
        }));
    }

    updateLanguage(language: string) {
        this.translateService.use(language);
        this.localStorageService.setItem(AccountService.languageKey, language);
    }

    async setLanguage(language: string = null) {
        const supportedLanguages = ['en', 'de'];

        if (this.translateService.langs.length === 0) {
            this.translateService.addLangs(supportedLanguages);
            this.translateService.setDefaultLang('en');
        }

        const storedLanguage = this.localStorageService.getItem(AccountService.languageKey);
        if (storedLanguage) {
            await firstValueFrom(this.translateService.use(storedLanguage));
        } else {
            if (language && supportedLanguages.indexOf(language) !== -1) {
                if (language === this.translateService.currentLang) {
                    return;
                }

                await firstValueFrom(this.translateService.use(language));
            } else if (!this.translateService.currentLang) {
                const defaultLang = this.translateService.getDefaultLang();
                await firstValueFrom(this.translateService.use(defaultLang));
            }
        }

        this.translateService
            .get(['cookie.message', 'cookie.allow', 'cookie.deny', 'cookie.policy', 'cookie.link', 'cookie.href', 'cookie.policy'])
            .subscribe(data => {
                this.cookieConsentService.getConfig().content = this.cookieConsentService.getConfig().content || {};
                this.cookieConsentService.getConfig().content.header = data['cookie.header'];
                this.cookieConsentService.getConfig().content.message = data['cookie.message'];
                this.cookieConsentService.getConfig().content.allow = data['cookie.allow'];
                this.cookieConsentService.getConfig().content.deny = data['cookie.deny'];
                this.cookieConsentService.getConfig().content.link = data['cookie.link'];
                this.cookieConsentService.getConfig().content.href = data['cookie.href'];
                this.cookieConsentService.getConfig().content.policy = data['cookie.policy'];
                this.cookieConsentService.destroy(); // remove previous cookie bar (with default messages)
                this.cookieConsentService.init(this.cookieConsentService.getConfig());
            });
    }
}
