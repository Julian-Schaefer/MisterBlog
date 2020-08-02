import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private dialog: MatDialog, private router: Router) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogElementsExampleDialog, { data: { url: '' }});
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.router.navigate(["preview"], { queryParams: { url: result }});
      }
    })
  }
}


@Component({
  selector: 'dialog-elements-example-dialog',
  templateUrl: './dialog-elements-example-dialog.html'
})
export class DialogElementsExampleDialog {
  
  constructor(public dialogRef: MatDialogRef<DialogElementsExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }) {}
    
  onCancelClick(): void {
    this.dialogRef.close();
  }
}
