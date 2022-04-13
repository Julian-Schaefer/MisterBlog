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

export const signUpWithEmailSuccess = createAction(
    '[Authentication] Sign up with Email Success'
);

export const signUpWithEmailFailed = createAction(
    '[Authentication] Sign up with Email Failed',
    props<{ error: any }>()
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

export const resetPassword = createAction(
    '[Authentication] Reset Password',
    props<{ email: string }>()
);

export const resetPasswordSuccess = createAction(
    '[Authentication] Reset Password success'
);

export const resetPasswordFailed = createAction(
    '[Authentication] Reset Password failed',
    props<{ error: any }>()
);

export const sendVerificationEmail = createAction(
    '[Authentication] Send Verification Email'
);

export const sendVerificationEmailSuccess = createAction(
    '[Authentication] Send Verification Email success'
);

export const sendVerificationEmailFailed = createAction(
    '[Authentication] Send Verification Email failed',
    props<{ error: any }>()
);