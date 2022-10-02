import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {

  constructor(public dialogRef: MatDialogRef<AccountComponent>, private authService: AuthService) { }

  signOut() {
    this.authService.signOut().subscribe(() => {
      this.dialogRef.close();
    });
  }

  deleteAccount() {

  }
}
