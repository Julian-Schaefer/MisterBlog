import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { User } from "../user";
import firebaseApp from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { EMPTY, from, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

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

        return from(this.auth.signInWithEmailAndPassword(email, password));
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

        const user = JSON.parse(localStorage.getItem('user'));

        if (user.providerId !== "password") {
            return user !== null && user.uid !== null;
        } else {
            return (user !== null && user.emailVerified !== false);
        }
    }

    getIdToken(): Observable<any | null> {
        if (!this.isBrowser)
            return null;

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
        return this.auth.signInWithPopup(provider);
    }

    signOut(): Observable<void> {
        if (!this.isBrowser)
            return;

        return from(this.auth.signOut().then((_) => {
            this.router.navigate(['about']);
        }));
    }

    handleAuthentication(user: User) {
        if (user) {
            this.user = user;
            //localStorage.setItem('user', JSON.stringify(this.user));
            this.router.navigate(['']);
        } else {
            this.user = null;
            //localStorage.removeItem('user');
        }
    }
}