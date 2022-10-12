import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import * as actions from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

export class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl<any, any>, form: FormGroupDirective | NgForm): boolean {
    return control.dirty && form.invalid;
  }
}

@Component({
  selector: 'app-authenticator',
  templateUrl: './authenticator.component.html',
  styleUrls: ['./authenticator.component.css']
})
export class AuthenticatorComponent implements OnInit, OnDestroy {

  hidePassword = true;
  hideRepeatedPassword = true;
  state$ = this.store.select(selectAuthenticationState);
  isSignUp = false;
  authenticationForm: FormGroup;
  crossFieldErrorMatcher = new CrossFieldErrorMatcher();

  private subscription: Subscription;

  private passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
    const passwordControl = formGroup.get('password');
    const repeatedPasswordControl = formGroup.get('repeatedPassword');
    return passwordControl.value === repeatedPasswordControl.value ?
      null : { 'passwordMismatch': true };
  }

  constructor(private store: Store, private route: ActivatedRoute, private formBuilder: FormBuilder,
    public translateService: TranslateService) { }

  ngOnInit(): void {
    this.store.dispatch(actions.reset());

    this.subscription = this.route
      .data
      .subscribe(data => {
        if (data.isSignUp) {
          this.isSignUp = true;
        } else {
          this.isSignUp = false;
        }

        if (!this.isSignUp) {
          this.authenticationForm = this.formBuilder.group({
            email: [null, [Validators.required]],
            password: [null, [Validators.required]]
          });
        } else {
          this.authenticationForm = this.formBuilder.group({
            email: [null, [Validators.required]],
            password: [null, [Validators.required]],
            repeatedPassword: [null, [Validators.required]],
          }, { validators: this.passwordMatchValidator });
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
    this.store.dispatch(actions.signUpWithEmail({ email, password }))
  }
}
