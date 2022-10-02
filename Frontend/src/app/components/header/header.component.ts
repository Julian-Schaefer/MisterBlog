import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AccountComponent } from '../account/account.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(public authService: AuthService, private dialog: MatDialog) { }

  showAccountPopup() {
    this.dialog.open(AccountComponent, { maxWidth: "800px", maxHeight: "600px", width: "800px", height: "600px" });
  }

}
