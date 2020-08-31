import { Injectable, NgZone } from '@angular/core';
import { User } from "./user";
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Observable } from 'rxjs';

@Injectable(
    { providedIn: "root" }
)
export class AuthService {
    user: User; // Save logged in user data
    private idToken: string;

    constructor(
        public auth: AngularFireAuth, // Inject Firebase auth service
        public router: Router,
        public ngZone: NgZone // NgZone service to remove outside scope warning
    ) {
        /* Saving user data in localstorage when 
        logged in and setting up null when logged out */
        this.auth.authState.subscribe(user => {
            if (user) {
                this.user = user;
                localStorage.setItem('user', JSON.stringify(this.user));
                JSON.parse(localStorage.getItem('user'));
            } else {
                this.user = null;
                localStorage.removeItem('user');
                this.router.navigate(['sign-in']);
            }
        })
    }

    // Sign in with email/password
    signInWithEmail(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password)
            .then((result) => {
                this.user = result.user;
                localStorage.setItem('user', JSON.stringify(this.user));
                JSON.parse(localStorage.getItem('user'));
                this.router.navigate(['']);
            })
            .catch((error) => {
                window.alert(error.message)
            })
    }

    // Sign up with email/password
    signUpWithEmail(email, password) {
        return this.auth.createUserWithEmailAndPassword(email, password)
            .then((result) => {
                /* Call the SendVerificaitonMail() function when new user sign 
                up and returns promise */
                this.sendVerificationMail();
            }).catch((error) => {
                window.alert(error.message)
            })
    }

    // Send email verfificaiton when new user sign up
    async sendVerificationMail() {
        let user = await this.auth.currentUser;
        return user.sendEmailVerification()
            .then(() => {
                this.router.navigate(['verify-email-address']);
            })
    }

    // Reset Forggot password
    resetPassword(passwordResetEmail) {
        return this.auth.sendPasswordResetEmail(passwordResetEmail)
            .then(() => {
                window.alert('Password reset email sent, check your inbox.');
            }).catch((error) => {
                window.alert(error)
            })
    }

    // Returns true when user is looged in and email is verified
    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return (user !== null && user.emailVerified !== false) ? true : false;
    }

    refreshIdToken(): Observable<string> {
        return new Observable<string>((observer) => {
            this.auth.currentUser.then((currentUser) => {
                if (currentUser) {
                    currentUser.getIdToken(false).then((idToken) => {
                        observer.next(idToken);
                        observer.complete();
                    });
                }
            });
        });
    }

    getIdToken(): string {
        return this.idToken;
    }

    // Sign in with Google
    signInWithGoogle() {
        return this.signInWithProvider(new auth.GoogleAuthProvider());
    }

    signInWithFacebook() {
        return this.signInWithProvider(new auth.FacebookAuthProvider());
    }

    // Auth logic to run auth providers
    private signInWithProvider(provider) {
        return this.auth.signInWithPopup(provider)
            .then((result) => {
                this.user = result.user;
                localStorage.setItem('user', JSON.stringify(this.user));
                JSON.parse(localStorage.getItem('user'));
                this.router.navigate(['']);
            })
            .catch((error) => {
                window.alert(error)
            });
    }

    // Sign out 
    signOut() {
        return this.auth.signOut()
            .catch((error) => {
                window.alert(error)
            });
    }

}