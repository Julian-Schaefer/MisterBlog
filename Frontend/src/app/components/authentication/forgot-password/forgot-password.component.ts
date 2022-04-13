import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth/auth.service';
import { resetPassword } from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  state$ = this.store.select(selectAuthenticationState);
  resetPasswordForm: FormGroup;

  constructor(private store: Store, private formBuilder: FormBuilder) {
    this.resetPasswordForm = formBuilder.group({
      email: [null, [Validators.required]]
    });
  }

  resetPassword(email: string) {
    this.store.dispatch(resetPassword({ email }));
  }
}
