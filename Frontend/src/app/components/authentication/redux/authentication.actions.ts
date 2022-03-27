import { createAction, props } from '@ngrx/store';
import { AuthProvider } from './AuthProvider';

export const reset = createAction(
    '[Authentication] Reset'
);

export const signInWithEmail = createAction(
    '[Authentication] Sign in with Email',
    props<{ email: string, password: string }>()
);

export const signUpWithEmail = createAction(
    '[Authentication] Sign up with Email',
    props<{ email: string, password: string }>()
);

export const signInWithProvider = createAction(
    '[Authentication] Sign in with Provider',
    props<{ provider: AuthProvider }>()
)

export const signInSuccess = createAction(
    '[Authentication] Sign in success'
);

export const signInFailed = createAction(
    '[Authentication] Sign in failed',
    props<{ error: any }>()
);