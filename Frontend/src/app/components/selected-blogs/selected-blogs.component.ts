import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BlogService } from 'src/app/services/blog.service';
import { UtilService } from 'src/app/services/util.service';
import { SelectedBlog } from 'src/app/services/SelectedBlog';

@Component({
  selector: 'selected-blogs',
  templateUrl: './selected-blogs.component.html',
  styleUrls: ['./selected-blogs.component.css']
})
export class SelectedBlogsComponent {
  @Output() selectedBlogsUpdated = new EventEmitter<string>();

  loading: boolean;
  selectedBlogs: SelectedBlog[];

  constructor(private dialog: MatDialog, private blogService: BlogService, public utilService: UtilService) {
    this.loadSelectedBlogs();
  }


  loadSelectedBlogs(): void {
    this.loading = true;
    this.blogService.getSelectedBlogs().subscribe(data => {
      this.selectedBlogs = data;
      this.loading = false;
    });
  }

  updateSelectedBlogs(): void {
    this.blogService.setSelectedBlogs(this.selectedBlogs).subscribe(_ => {
      this.selectedBlogsUpdated.emit();
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddBlogDialog, { data: { url: '' } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blogService.addSelectedBlog({ blogUrl: result, isSelected: true }).subscribe(() => {
          this.loadSelectedBlogs();
        })
      }
    })
  }
}

@Component({
  selector: 'add-blog-dialog',
  templateUrl: './add-blog-dialog.html'
})
export class AddBlogDialog {

  constructor(public dialogRef: MatDialogRef<AddBlogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}