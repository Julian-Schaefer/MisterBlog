import { Injectable, NgZone } from '@angular/core';
import { User } from "../user";
import firebaseApp from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { from, Observable } from 'rxjs';

@Injectable(
    { providedIn: "root" }
)
export class AuthService {
    user: User;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        public ngZone: NgZone
    ) {
        this.auth.authState.subscribe(user => {
            this.handleAuthentication(user);
        })
    }

    signInWithEmail(email: string, password: string): Observable<firebaseApp.auth.UserCredential> {
        return from(this.auth.signInWithEmailAndPassword(email, password));
    }

    signUpWithEmail(email: string, password: string) {
        return this.auth.createUserWithEmailAndPassword(email, password)
            .then((_) => {
                this.sendVerificationMail();
            }).catch((error) => {
                window.alert(error.message)
            })
    }

    async sendVerificationMail() {
        let user = await this.auth.currentUser;
        return user.sendEmailVerification()
            .then(() => {
                this.router.navigate(['verify-email-address']);
            })
    }

    resetPassword(passwordResetEmail) {
        return this.auth.sendPasswordResetEmail(passwordResetEmail)
            .then(() => {
                window.alert('Password reset email sent, check your inbox.');
            }).catch((error) => {
                window.alert(error)
            })
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user.providerId !== "password") {
            return user !== null && user.uid !== null;
        } else {
            return (user !== null && user.emailVerified !== false);
        }
    }

    getIdToken(): Observable<string> {
        return this.auth.idToken;
    }

    signInWithGoogle() {
        return from(this.signInWithProvider(new firebaseApp.auth.GoogleAuthProvider()));
    }

    signInWithFacebook() {
        return from(this.signInWithProvider(new firebaseApp.auth.FacebookAuthProvider()));
    }

    private signInWithProvider(provider) {
        return this.auth.signInWithPopup(provider);
    }

    signOut() {
        return this.auth.signOut();
    }

    handleAuthentication(user: User) {
        if (user) {
            this.user = user;
            localStorage.setItem('user', JSON.stringify(this.user));
            this.router.navigate(['']);
        } else {
            this.user = null;
            localStorage.removeItem('user');
            this.router.navigate(['about']);
        }
    }
}