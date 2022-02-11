import { Injectable, NgZone } from '@angular/core';
import { User } from "../user";
import firebaseApp from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { Observable } from 'rxjs';

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

    signInWithEmail(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password)
            .then((result) => {
                this.handleAuthentication(result.user);
                this.router.navigate(['']);
            })
            .catch((error) => {
                window.alert(error.message)
            })
    }

    signUpWithEmail(email, password) {
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
        return (user !== null && user.emailVerified !== false) ? true : false;
    }

    getIdToken(): Observable<string> {
        return this.auth.idToken;
    }

    signInWithGoogle() {
        return this.signInWithProvider(new firebaseApp.auth.GoogleAuthProvider());
    }

    signInWithFacebook() {
        return this.signInWithProvider(new firebaseApp.auth.FacebookAuthProvider());
    }

    private signInWithProvider(provider) {
        return this.auth.signInWithPopup(provider)
            .then((result) => {
                this.handleAuthentication(result.user);
                this.router.navigate(['']);
            })
            .catch((error) => {
                window.alert(error)
            });
    }

    signOut() {
        return this.auth.signOut()
            .catch((error) => {
                window.alert(error)
            });
    }

    handleAuthentication(user: User) {
        if (user) {
            this.user = user;
            localStorage.setItem('user', JSON.stringify(this.user));
        } else {
            this.user = null;
            localStorage.removeItem('user');
            this.router.navigate(['about']);
        }
    }

}