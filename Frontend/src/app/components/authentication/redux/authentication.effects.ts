import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import * as AuthenticationActions from './authentication.actions';

@Injectable()
export class AuthenticationEffects {

    signInWithEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.signInWithEmail),
            mergeMap((action) => this.authService.signInWithEmail(action.email, action.password)
                .pipe(
                    map(_ => AuthenticationActions.signInSuccess()),
                    catchError(error => from(this.authService.getErrorMessageFromError(error)).pipe(map(errorMessage =>
                        AuthenticationActions.signInFailed({ error: errorMessage })))
                    )
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
                    catchError(error => from(this.authService.getErrorMessageFromError(error)).pipe(map(errorMessage =>
                        AuthenticationActions.signInFailed({ error: errorMessage })))
                    )
                )
            )
        )
    );

    signInWithProvider$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.signInWithProvider),
            mergeMap((action) => {
                return this.authService.signInWithProvider(action.provider)
                    .pipe(
                        map(_ => AuthenticationActions.signInSuccess()),
                        catchError(error => from(this.authService.getErrorMessageFromError(error)).pipe(map(errorMessage =>
                            AuthenticationActions.signInFailed({ error: errorMessage })))
                        ),
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
                    catchError(error => from(this.authService.getErrorMessageFromError(error)).pipe(map(errorMessage =>
                        AuthenticationActions.signInFailed({ error: errorMessage })))
                    )
                )
            )
        )
    );

    sendVerificationEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.sendVerificationEmail),
            mergeMap((_) => this.authService.sendVerificationEmail()
                .pipe(
                    map(_ => AuthenticationActions.sendVerificationEmailSuccess()),
                    catchError(error => from(this.authService.getErrorMessageFromError(error)).pipe(map(errorMessage =>
                        AuthenticationActions.signInFailed({ error: errorMessage })))
                    )
                )
            )
        )
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService
    ) { }
}