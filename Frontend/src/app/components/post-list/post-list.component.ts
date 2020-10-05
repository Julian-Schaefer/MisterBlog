import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BlogService } from 'src/app/services/blog.service';
import { BlogPost } from 'src/app/services/BlogPost';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent {

  loading: boolean;
  blogPosts: BlogPost[];

  constructor(private dialog: MatDialog, private router: Router, private blogService: BlogService) {
    this.loadBlogPosts();
  }

  loadBlogPosts(): void {
    this.loading = true;
    this.blogService.getBlogPosts().subscribe(data => {
      this.blogPosts = data;
      this.loading = false;
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddBlogDialog, { data: { url: '' } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(["preview"], { queryParams: { url: result } });
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