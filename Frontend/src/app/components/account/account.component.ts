import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AccountService } from 'src/app/services/account/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NGXLogger } from 'ngx-logger';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../authentication/authenticator/authenticator.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  hidePassword = true;
  hideRepeatedPassword = true;
  changePasswordForm: FormGroup;
  crossFieldErrorMatcher = new CrossFieldErrorMatcher();
  changePasswordInProgress = false;
  changePasswordError?: string;

  language = 'en';
  signInProvider$: Observable<string | null>;

  private passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
    const passwordControl = formGroup.get('password');
    const repeatedPasswordControl = formGroup.get('repeatedPassword');
    return passwordControl.value === repeatedPasswordControl.value ?
      null : { 'passwordMismatch': true };
  }

  constructor(public dialogRef: MatDialogRef<AccountComponent>,
    private dialog: MatDialog,
    private authService: AuthService,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private logger: NGXLogger,
    public translateService: TranslateService) { }

  ngOnInit(): void {
    this.language = this.translateService.currentLang;
    this.signInProvider$ = this.authService.getSignInProvider();

    this.changePasswordForm = this.formBuilder.group({
      password: [null, [Validators.required]],
      repeatedPassword: [null, [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  onLanguageChanged() {
    this.accountService.updateLanguage(this.language);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      this.closeDialog();
    });
  }

  changePassword(newPassword: string) {
    this.changePasswordInProgress = true;
    this.changePasswordError = null;

    this.authService.updatePassword(newPassword).subscribe({
      next: () => {
        this.changePasswordInProgress = false;
        this.snackBar.open(this.translateService.instant('account.change-password-success'),
          this.translateService.instant('general.ok'), {
          duration: 4000,
        });
      },
      error: (err) => {
        this.authService.getErrorMessageFromError(err).then((errorMessage) => {
          this.changePasswordInProgress = false;
          this.changePasswordError = errorMessage;
        });
      }
    })
  }

  deleteAccount() {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translateService.instant('account.delete'),
        message: this.translateService.instant('account.delete-confirm'),
        confirmText: this.translateService.instant('general.delete'),
        cancelText: this.translateService.instant('general.cancel')
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.accountService.deleteAccount().subscribe({
          next: () => {
            this.snackBar.open(this.translateService.instant('account.delete-success'),
              this.translateService.instant('general.ok'), {
              duration: 4000,
            });
            this.closeDialog();
          },
          error: (err) => {
            this.logger.log(err);
            this.snackBar.open(this.translateService.instant('account.delete-error'),
              this.translateService.instant('general.ok'), {
              duration: 4000,
            });
          }
        });
      }
    });
  }
}