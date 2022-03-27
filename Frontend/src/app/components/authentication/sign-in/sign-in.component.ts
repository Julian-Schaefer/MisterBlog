import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as actions from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {

  hidePassword = true;
  state$ = this.store.select(selectAuthenticationState);

  constructor(private store: Store) {
    this.store.dispatch(actions.reset());
  }

  signInWithEmail(email: string, password: string) {
    this.store.dispatch(actions.signInWithEmail({ email, password }))
  }

}
