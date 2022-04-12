import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as actions from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

@Component({
  selector: 'app-authenticator',
  templateUrl: './authenticator.component.html',
  styleUrls: ['./authenticator.component.css']
})
export class AuthenticatorComponent implements OnInit, OnDestroy {

  hidePassword = true;
  state$ = this.store.select(selectAuthenticationState);
  isSignUp = false;

  private subscription: Subscription;

  constructor(private store: Store, private route: ActivatedRoute) {
    this.store.dispatch(actions.reset());
  }

  ngOnInit(): void {
    this.subscription = this.route
      .data
      .subscribe(data => {
        if (data.isSignUp) {
          this.isSignUp = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  signInOrSignUp(email: string, password: string) {
    this.isSignUp ? this.signUpWithEmail(email, password) : this.signInWithEmail(email, password);
  }

  private signInWithEmail(email: string, password: string) {
    this.store.dispatch(actions.signInWithEmail({ email, password }))
  }

  private signUpWithEmail(email: string, password: string) {
    this.store.dispatch(actions.signInWithEmail({ email, password }))
  }
}
