import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithEmailAndPassword,
    UserCredential,
    AuthProvider as FireBaseAuthProvider,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    Auth,
    User,
} from "@angular/fire/auth";
import { Router } from "@angular/router";
import { EMPTY, from, map, Observable, of, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthProvider } from 'src/app/components/authentication/redux/AuthProvider';

@Injectable(
    { providedIn: "root" }
)
export class AuthService {

    public user: User;

    private isBrowser: boolean;
    private isInitialized = false;
    private onInitialized = new Subject<void>;

    constructor(
        public router: Router,
        public ngZone: NgZone,
        private auth: Auth,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            onAuthStateChanged(this.auth, user => {
                this.handleAuthentication(user, false);
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

        if (this.isInitialized) {
            const user = this.auth.currentUser;

            if (!user) return of(false);

            if (user.providerId !== "password") {
                return of(user != null && user.uid != null);
            } else {
                return of(user != null && user.uid != null && user.emailVerified != false);
            }
        } else {
            return this.onInitialized.pipe(map(() => {
                const user = this.auth.currentUser;

                if (!user) return false;

                if (user.providerId !== "password") {
                    return user != null && user.uid != null;
                } else {
                    return user != null && user.uid != null && user.emailVerified != false;
                }
            }));
        }
    }

    getIdToken(): Observable<string> {
        if (!this.isBrowser) {
            return of(null);
        }

        if (this.isInitialized) {
            if (!this.auth.currentUser) {
                return of(null);
            }

            return from(this.auth.currentUser.getIdToken());
        } else {
            return new Observable(subscriber => {
                this.onInitialized.subscribe(() => {
                    if (!this.auth.currentUser) {
                        subscriber.next(null);
                    } else {
                        this.auth.currentUser.getIdToken().then(idToken => {
                            subscriber.next(idToken);
                        });
                    }
                });
            });
        }
    }

    signInWithEmail(email: string, password: string): Observable<UserCredential> {
        if (!this.isBrowser)
            return;

        return from(signInWithEmailAndPassword(this.auth, email, password).then((credential) => {
            this.handleAuthentication(credential.user, true);
            return credential;
        }));
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

        return from(signInWithPopup(this.auth, authProvider).then((credential) => {
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
        this.isInitialized = true;
        this.onInitialized.next();

        if (user) {
            this.user = user;
            if (shouldNavigate) {
                this.router.navigate(['posts']);
            }
        } else {
            this.user = null;
            if (shouldNavigate) {
                this.router.navigate(['']);
            }
        }
    }
}