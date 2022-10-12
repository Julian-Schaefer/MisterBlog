import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { reset, sendVerificationEmail } from '../redux/authentication.actions';
import { selectAuthenticationState } from '../redux/authentication.reducer';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {

  state$ = this.store.select(selectAuthenticationState);
  email?: string;

  constructor(private store: Store, private route: ActivatedRoute, private router: Router,
    public translateService: TranslateService) {
    this.route.queryParams.subscribe(_ => {
      const currentNavigation = this.router.getCurrentNavigation();
      if (currentNavigation && currentNavigation.extras && currentNavigation.extras.state) {
        this.store.dispatch(reset());
        this.email = this.router.getCurrentNavigation().extras.state.email;
      }
    });
  }

  sendVerificationEmail() {
    this.store.dispatch(sendVerificationEmail());
  }
}
