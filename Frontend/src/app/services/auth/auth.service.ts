import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { User } from "../user";
import firebaseApp from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { EMPTY, from, Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageService } from '../local-storage-service/local-storage.service';

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
                this.handleAuthentication(user);
            });
        }
    }

    signInWithEmail(email: string, password: string): Observable<firebaseApp.auth.UserCredential> {
        if (!this.isBrowser)
            return;

        return from(this.auth.signInWithEmailAndPassword(email, password).then((user) => {
            this.router.navigate(['posts']);
            return user;
        }));
    }

    signUpWithEmail(email: string, password: string) {
        if (!this.isBrowser)
            return;

        return this.auth.createUserWithEmailAndPassword(email, password)
            .then((_) => {
                this.sendVerificationMail();
            }).catch((error) => {
                window.alert(error.message)
            })
    }

    async sendVerificationMail() {
        if (!this.isBrowser)
            return;

        let user = await this.auth.currentUser;
        return user.sendEmailVerification()
            .then(() => {
                this.router.navigate(['verify-email-address']);
            })
    }

    resetPassword(passwordResetEmail) {
        if (!this.isBrowser)
            return;

        return this.auth.sendPasswordResetEmail(passwordResetEmail)
            .then(() => {
                window.alert('Password reset email sent, check your inbox.');
            }).catch((error) => {
                window.alert(error)
            })
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

    signInWithGoogle(): Observable<firebaseApp.auth.UserCredential> {
        return from(this.signInWithProvider(new firebaseApp.auth.GoogleAuthProvider()));
    }

    signInWithFacebook(): Observable<firebaseApp.auth.UserCredential> {
        return from(this.signInWithProvider(new firebaseApp.auth.FacebookAuthProvider()));
    }

    signInWithTwitter(): Observable<firebaseApp.auth.UserCredential> {
        return from(this.signInWithProvider(new firebaseApp.auth.TwitterAuthProvider()));
    }

    signInWithApple(): Observable<firebaseApp.auth.UserCredential> {
        return from(this.signInWithProvider(new firebaseApp.auth.GoogleAuthProvider()));
    }

    private async signInWithProvider(provider): Promise<firebaseApp.auth.UserCredential> {
        if (!this.isBrowser)
            return;

        await this.auth.setPersistence(firebaseApp.auth.Auth.Persistence.LOCAL);
        return this.auth.signInWithPopup(provider).then((user) => {
            this.router.navigate(['posts']);
            return user;
        });
    }

    signOut(): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(this.auth.signOut().then((_) => {
            this.router.navigate(['']);
        }));
    }

    handleAuthentication(user: User) {
        if (user) {
            this.user = user;
            this.localStorageService.setItem('user', JSON.stringify(this.user));
        } else {
            this.user = null;
            this.localStorageService.removeItem('user');
        }
    }
}