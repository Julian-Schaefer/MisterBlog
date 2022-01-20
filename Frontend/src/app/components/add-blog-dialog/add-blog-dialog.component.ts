import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { BlogService } from 'src/app/services/blog/blog.service';

@Component({
  selector: 'app-add-blog-dialog',
  templateUrl: './add-blog-dialog.component.html',
  styleUrls: ['./add-blog-dialog.component.css']
})
export class AddBlogDialogComponent {

  blogUrl: string = '';
  loading = false;

  constructor(public dialogRef: MatDialogRef<AddBlogDialogComponent>, private blogService: BlogService) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onAddClick(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.blogService.addSelectedBlog({ blogUrl: this.blogUrl, isSelected: true }).pipe(finalize(() => this.loading = false)).subscribe({
      complete: () => {
        this.dialogRef.close(this.blogUrl);
      }, error: (err) => {
        console.log("err");
      }
    });
  }
}
