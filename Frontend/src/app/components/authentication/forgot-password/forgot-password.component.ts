import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { reset, resetPassword } from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  state$ = this.store.select(selectAuthenticationState);
  resetPasswordForm: FormGroup;

  constructor(private store: Store, formBuilder: FormBuilder,
    public translateService: TranslateService) {
    this.store.dispatch(reset());
    this.resetPasswordForm = formBuilder.group({
      email: [null, [Validators.required]]
    });
  }

  resetPassword(email: string) {
    this.store.dispatch(resetPassword({ email }));
  }
}
