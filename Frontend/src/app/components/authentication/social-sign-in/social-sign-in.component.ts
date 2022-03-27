import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as actions from '../redux/authentication.actions';
import { AuthProvider } from '../redux/AuthProvider';

@Component({
  selector: 'app-social-sign-in',
  templateUrl: './social-sign-in.component.html',
  styleUrls: ['./social-sign-in.component.css']
})
export class SocialSignInComponent {

  constructor(private store: Store) { }

  signInWithGoogle() {
    this.store.dispatch(actions.signInWithProvider({ provider: AuthProvider.GOOGLE }));
  }

  signInWithFacebook() {
    this.store.dispatch(actions.signInWithProvider({ provider: AuthProvider.FACEBOOK }));
  }

  signInWithTwitter() {
    this.store.dispatch(actions.signInWithProvider({ provider: AuthProvider.TWITTER }));
  }

  signInWithApple() {
    this.store.dispatch(actions.signInWithProvider({ provider: AuthProvider.APPLE }));
  }
}
