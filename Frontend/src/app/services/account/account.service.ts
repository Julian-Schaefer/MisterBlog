import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, from } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../local-storage-service/local-storage.service';

@Injectable(
    { providedIn: "root" }
)
export class AccountService {

    private static languageKey = "currLang";

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient,
        private authService: AuthService,
        private translateService: TranslateService,
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

    initializeLanguage() {
        const supportedLanguages = ['en', 'de'];
        const currentLang = this.translateService.currentLang;

        this.translateService.addLangs(supportedLanguages);
        this.translateService.setDefaultLang('en');

        const storedLanguage = this.localStorageService.getItem(AccountService.languageKey);
        if (storedLanguage) {
            this.translateService.use(storedLanguage);
        } else {
            if (currentLang && supportedLanguages.indexOf(currentLang) !== -1) {
                this.translateService.use(currentLang);
            } else {
                const defaultLang = this.translateService.getDefaultLang();
                this.translateService.use(defaultLang);
            }
        }
    }
}
