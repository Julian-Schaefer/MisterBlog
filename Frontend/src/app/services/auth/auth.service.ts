import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithEmailAndPassword,
    updatePassword,
    UserCredential,
    AuthProvider as FireBaseAuthProvider,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    Auth,
    User,
} from "@angular/fire/auth";
import { Router } from "@angular/router";
import { EMPTY, firstValueFrom, from, lastValueFrom, map, Observable, of, Subject, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthProvider } from 'src/app/components/authentication/redux/AuthProvider';
import { NGXLogger } from 'ngx-logger';
import { TranslateService } from '@ngx-translate/core';

@Injectable(
    { providedIn: "root" }
)
export class AuthService {

    public user: User;

    private isBrowser: boolean;

    constructor(
        public router: Router,
        public ngZone: NgZone,
        private auth: Auth,
        private translateService: TranslateService,
        private logger: NGXLogger,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            onAuthStateChanged(this.auth, user => {
                this.handleAuthentication(user);
            });
        }
    }

    signUpWithEmail(email: string, password: string): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(createUserWithEmailAndPassword(this.auth, email, password)
            .then((_) => {
                this.sendVerificationEmail();
            })
        );
    }

    sendVerificationEmail(): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(sendEmailVerification(this.auth.currentUser));
    }

    resetPassword(email: string): Observable<void> {
        if (!this.isBrowser)
            return EMPTY;

        return from(sendPasswordResetEmail(this.auth, email));
    }

    get isLoggedIn(): Observable<boolean> {
        if (!this.isBrowser)
            return of(false);

        const user = this.auth.currentUser;

        if (!user) return of(false);

        return from(user.getIdTokenResult().then((result) => {
            if (result.signInProvider !== 'password') {
                return user != null && user.uid != null;
            } else {
                return user != null && user.uid != null && user.emailVerified != false;
            }
        }));
    }

    getIdToken(): Observable<string> {
        if (!this.isBrowser) {
            return of(null);
        }

        if (!this.auth.currentUser) {
            return of(null);
        }

        return from(this.auth.currentUser.getIdToken());
    }

    signInWithEmail(email: string, password: string): Observable<UserCredential> {
        if (!this.isBrowser)
            return;

        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    signInWithProvider(provider: AuthProvider): Observable<UserCredential> {
        if (!this.isBrowser)
            return;

        let authProvider: FireBaseAuthProvider;
        switch (provider) {
            case AuthProvider.GOOGLE: authProvider = new GoogleAuthProvider(); break;
            case AuthProvider.FACEBOOK: authProvider = new FacebookAuthProvider(); break;
            case AuthProvider.TWITTER: authProvider = new TwitterAuthProvider(); break;
            case AuthProvider.APPLE: authProvider = new GoogleAuthProvider(); break;
        }

        return from(signInWithPopup(this.auth, authProvider));
    }

    signOut(): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(this.auth.signOut());
    }

    getSignInProvider(): Observable<string | null> {
        if (!this.isBrowser) {
            return of(null);
        }

        if (!this.auth.currentUser) {
            return of(null);
        }

        return from(this.auth.currentUser.getIdTokenResult()).pipe(map((result) => {
            return result.signInProvider;
        }));
    }

    updatePassword(newPassword: string): Observable<void> {
        return from(updatePassword(this.auth.currentUser, newPassword));
    }

    async getErrorMessageFromError(error: any): Promise<string> {
        this.logger.log(error);
        let errorMessage = await firstValueFrom(this.translateService.get("error.unknown-error"));

        if (error.name && error.name === "FirebaseError") {
            if (error.code && error.code.startsWith("auth/")) {
                const errorCode = "error.auth." + error.code.substring("auth/".length);
                errorMessage = await firstValueFrom(this.translateService.get(errorCode));

                if (errorMessage === errorCode) {
                    this.logger.warn("No Translation found for error: ", errorCode, error.message);
                    errorMessage = await firstValueFrom(this.translateService.get("error.unknown-error"));
                }
            }
        }

        return errorMessage;
    }

    private handleAuthentication(user: User) {
        if (user) {
            this.getSignInProvider().subscribe((signInProvider) => {
                if (signInProvider === 'password' && user.emailVerified === false) {
                    this.router.navigate(['verify-email'], { state: { email: user.email } });
                } else {
                    this.user = user;
                    this.router.navigate(['posts']);
                }
            });
        } else if (this.user) {
            this.user = null;
            this.router.navigate(['']);
        }
    }
}