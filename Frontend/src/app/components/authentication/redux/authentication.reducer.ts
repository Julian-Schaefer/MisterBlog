import { createReducer, on } from '@ngrx/store';
import * as AuthenticationActions from './authentication.actions';

export interface State {
    authenticationInProgress: boolean;
    error: string;
}

export const initialState: State = {
    authenticationInProgress: false,
    error: null,
};

export const reducer = createReducer(
    initialState,
    on(AuthenticationActions.reset, (_) => {
        return ({ ...initialState });
    }),
    on(AuthenticationActions.signInSuccess, (_) => {
        return ({ ...initialState });
    }),
    on(AuthenticationActions.signInFailed, (state, { error }) => {
        return ({ ...state, authenticationInProgress: false, error: error });
    }),
    on(AuthenticationActions.signInWithEmail, (state) => {
        return ({ ...state, authenticationInProgress: true, error: null });
    }),
    on(AuthenticationActions.signUpWithEmail, (state) => {
        return ({ ...state, authenticationInProgress: true, error: null });
    }),
    on(AuthenticationActions.signInWithProvider, (state) => {
        return ({ ...state, authenticationInProgress: true, error: null });
    })
);

export const selectAuthenticationState = (state: any): State => {
    return state.authentication;
}