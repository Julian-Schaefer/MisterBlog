import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth/auth.service';
import { reset, sendVerificationEmail } from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {

  state$ = this.store.select(selectAuthenticationState);

  constructor(public authService: AuthService, private store: Store) {
    this.store.dispatch(reset());
  }

  sendVerificationEmail() {
    this.store.dispatch(sendVerificationEmail());
  }
}
