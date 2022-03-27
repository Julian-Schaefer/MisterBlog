import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { map, mergeMap, catchError, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import * as AuthenticationActions from './authentication.actions';
import { AuthProvider } from './AuthProvider';

@Injectable()
export class AuthenticationEffects {

    signInWithEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActions.signInWithEmail),
            mergeMap((action) => this.authService.signInWithEmail(action.email, action.password)
                .pipe(
                    map(_ => AuthenticationActions.signInSuccess()),
                    catchError(error => of(AuthenticationActions.signInFailed({ error })))
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
                    case AuthProvider.TWITTER: observable = this.authService.signInWithGoogle(); break;
                    case AuthProvider.APPLE: observable = this.authService.signInWithGoogle(); break;
                }

                return observable
                    .pipe(
                        map(_ => AuthenticationActions.signInSuccess()),
                        catchError(error => of(AuthenticationActions.signInFailed({ error }))),
                        take(1)
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService
    ) { }
}