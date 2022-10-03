import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AccountService } from 'src/app/services/account/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NGXLogger } from 'ngx-logger';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  language = 'en';

  constructor(public dialogRef: MatDialogRef<AccountComponent>,
    private dialog: MatDialog,
    private authService: AuthService,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private logger: NGXLogger) { }

  ngOnInit(): void {
    this.language = this.translateService.currentLang;
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