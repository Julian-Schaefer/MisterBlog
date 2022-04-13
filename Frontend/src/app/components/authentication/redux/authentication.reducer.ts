import { createReducer, on } from '@ngrx/store';
import * as AuthenticationActions from './authentication.actions';

export interface AuthenticationState {
    inProgress: boolean;
    success: boolean;
    error: string;
}

export const initialState: AuthenticationState = {
    inProgress: false,
    success: false,
    error: null,
};

export const reducer = createReducer(
    initialState,
    on(AuthenticationActions.reset, (_) => {
        return ({ ...initialState });
    }),
    on(AuthenticationActions.signInSuccess, (_) => {
        return ({ ...initialState, success: true });
    }),
    on(AuthenticationActions.signInFailed, (state, { error }) => {
        return ({ ...state, inProgress: false, success: false, error: error });
    }),
    on(AuthenticationActions.signInWithEmail, (state) => {
        return ({ ...state, inProgress: true, success: false, error: null });
    }),
    on(AuthenticationActions.signUpWithEmail, (state) => {
        return ({ ...state, inProgress: true, success: false, error: null });
    }),
    on(AuthenticationActions.signInWithProvider, (state) => {
        return ({ ...state, inProgress: true, success: false, error: null });
    }),
    on(AuthenticationActions.resetPassword, (state) => {
        return ({ ...state, inProgress: true, success: false, error: null });
    }),
    on(AuthenticationActions.resetPasswordSuccess, (_) => {
        return ({ ...initialState, success: true });
    }),
    on(AuthenticationActions.resetPasswordFailed, (state, { error }) => {
        return ({ ...state, inProgress: false, success: false, error: error });
    }),
);

export const selectAuthenticationState = (state: any): AuthenticationState => {
    return state.authentication;
}