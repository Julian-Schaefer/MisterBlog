import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from 'src/app/services/account/account.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent {

  @Input() showLanguageSelector = true;

  constructor(public translateService: TranslateService, public dialog: MatDialog) { }

  openLanguageDialog(): void {
    this.dialog.open(LanguageDialog);
  }
}

@Component({
  template: `
  <h1 mat-dialog-title>{{'account.change-language' | translate}}</h1>
  <div mat-dialog-content>
    <mat-form-field appearance="fill" controlType="select">
        <mat-select [(value)]="language" (selectionChange)="onLanguageChanged()">
            <div *ngFor="let supportedLanguage of translateService.getLangs()">
              <mat-option [value]="supportedLanguage">{{ 'languages.'+supportedLanguage | translate }}</mat-option>
            </div>
        </mat-select>
    </mat-form-field>
  </div>
`,
  styles: [
    `h1 {
      font-family: Lobster!important;
      font-size: 32px!important;
      color: #3f51b5!important;
      text-align: center;
    }`,
    'mat-form-field { padding: 10px; }',
    '.mat-dialog-content { margin: auto; }'
  ]
})
export class LanguageDialog implements OnInit {
  language = 'en';

  constructor(
    private dialogRef: MatDialogRef<LanguageDialog>,
    private router: Router,
    private accountService: AccountService,
    public translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.language = this.translateService.currentLang;
  }

  onLanguageChanged() {
    if (this.language === this.translateService.getDefaultLang()) {
      this.accountService.setLanguage(this.translateService.getDefaultLang());
    }

    this.router.navigate(['/', this.language])
    this.dialogRef.close();
  }
}