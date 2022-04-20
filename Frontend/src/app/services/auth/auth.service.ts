import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { User } from "../user";
import firebaseApp from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { EMPTY, from, Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { AuthProvider } from 'src/app/components/authentication/redux/AuthProvider';

@Injectable(
    { providedIn: "root" }
)
export class AuthService {

    public user: User;
    private isBrowser: boolean;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        public ngZone: NgZone,
        private localStorageService: LocalStorageService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            this.auth.authState.subscribe(user => {
                this.handleAuthentication(user, false);
            });
        }
    }

    signUpWithEmail(email: string, password: string): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(this.auth.createUserWithEmailAndPassword(email, password)
            .then((_) => {
                this.sendVerificationEmail();
            })
        );
    }

    sendVerificationEmail(): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(this.auth.currentUser.then(user => {
            return user.sendEmailVerification();
        }));
    }

    resetPassword(email: string): Observable<void> {
        if (!this.isBrowser)
            return EMPTY;

        return from(this.auth.sendPasswordResetEmail(email));
    }

    get isLoggedIn(): boolean {
        if (!this.isBrowser)
            return false;

        const user = JSON.parse(this.localStorageService.getItem('user'));

        if (!user) return false;

        if (user.providerId !== "password") {
            return user != null && user.uid != null;
        } else {
            return user != null && user.uid != null && user.emailVerified != false;
        }
    }

    getIdToken(): Observable<string | null> {
        if (!this.isBrowser) {
            return of(null);
        }

        return this.auth.idToken;
    }

    signInWithEmail(email: string, password: string): Observable<firebaseApp.auth.UserCredential> {
        if (!this.isBrowser)
            return;

        return from(this.auth.signInWithEmailAndPassword(email, password).then((credential) => {
            this.handleAuthentication(credential.user, true);
            return credential;
        }));
    }

    signInWithProvider(provider: AuthProvider): Observable<firebaseApp.auth.UserCredential> {
        if (!this.isBrowser)
            return;

        let authProvider: firebaseApp.auth.AuthProvider;
        switch (provider) {
            case AuthProvider.GOOGLE: authProvider = new firebaseApp.auth.GoogleAuthProvider(); break;
            case AuthProvider.FACEBOOK: authProvider = new firebaseApp.auth.FacebookAuthProvider(); break;
            case AuthProvider.TWITTER: authProvider = new firebaseApp.auth.TwitterAuthProvider(); break;
            case AuthProvider.APPLE: authProvider = new firebaseApp.auth.GoogleAuthProvider(); break;
        }

        return from(this.auth.signInWithPopup(authProvider).then((credential) => {
            this.handleAuthentication(credential.user, true);
            return credential;
        }));
    }

    signOut(): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(this.auth.signOut().then((_) => {
            this.handleAuthentication(null, true);
        }));
    }

    handleAuthentication(user: User, shouldNavigate: boolean) {
        if (user) {
            this.user = user;
            this.localStorageService.setItem('user', JSON.stringify(this.user));
            if (shouldNavigate) {
                this.router.navigate(['posts']);
            }
        } else {
            this.user = null;
            this.localStorageService.removeItem('user');
            if (shouldNavigate) {
                this.router.navigate(['']);
            }
        }
    }
}