import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap, catchError, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import * as AuthenticationActions from './authentication.actions';
import { AuthProvider } from './AuthProvider';

@Injectable()
export class AuthenticationEffects {

    private getErrorMessageFromError(error: any): Observable<string> {
        if (error.name && error.name === "FirebaseError") {
            if (error.code && error.code.startsWith("auth/")) {
                const errorCode = "error.auth." + error.code.substring("auth/".length);
                return this.translateService.get(errorCode).pipe(
                    map((errorMessage) => {
                        if (errorMessage !== errorCode) {
                            return errorMessage;
                        }

                        return error.message;
                    }));
            }
        }

        return this.translateService.get("unknown-error");
    }


    signInWithEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.signInWithEmail),
            mergeMap((action) => this.authService.signInWithEmail(action.email, action.password)
                .pipe(
                    map(_ => AuthenticationActions.signInSuccess()),
                    catchError(error => this.getErrorMessageFromError(error).pipe(
                        map((errorMessage) => AuthenticationActions.signInFailed({ error: errorMessage }))
                    ))
                )
            )
        )
    );

    signUpWithEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.signUpWithEmail),
            mergeMap((action) => this.authService.signUpWithEmail(action.email, action.password)
                .pipe(
                    map(_ => AuthenticationActions.signUpWithEmailSuccess()),
                    catchError(error => this.getErrorMessageFromError(error).pipe(
                        map((errorMessage) => AuthenticationActions.signUpWithEmailFailed({ error: errorMessage }))
                    ))
                )
            )
        )
    );

    signInWithProvider$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.signInWithProvider),
            mergeMap((action) => {
                let observable: Observable<any>;
                switch (action.provider) {
                    case AuthProvider.GOOGLE: observable = this.authService.signInWithGoogle(); break;
                    case AuthProvider.FACEBOOK: observable = this.authService.signInWithFacebook(); break;
                    case AuthProvider.TWITTER: observable = this.authService.signInWithTwitter(); break;
                    case AuthProvider.APPLE: observable = this.authService.signInWithApple(); break;
                }

                return observable
                    .pipe(
                        map(_ => AuthenticationActions.signInSuccess()),
                        catchError(error => this.getErrorMessageFromError(error).pipe(
                            map((errorMessage) => AuthenticationActions.signInFailed({ error: errorMessage })))),
                        take(1)
                    );
            })
        )
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.resetPassword),
            mergeMap((action) => this.authService.resetPassword(action.email)
                .pipe(
                    map(_ => AuthenticationActions.resetPasswordSuccess()),
                    catchError(error => this.getErrorMessageFromError(error).pipe(
                        map((errorMessage) => AuthenticationActions.resetPasswordFailed({ error: errorMessage }))
                    ))
                )
            )
        )
    );

    sendVerificationEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.sendVerificationEmail),
            mergeMap((action) => this.authService.sendVerificationEmail()
                .pipe(
                    map(_ => AuthenticationActions.sendVerificationEmailSuccess()),
                    catchError(error => this.getErrorMessageFromError(error).pipe(
                        map((errorMessage) => AuthenticationActions.sendVerificationEmailFailed({ error: errorMessage }))
                    ))
                )
            )
        )
    );


    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private translateService: TranslateService
    ) { }
}