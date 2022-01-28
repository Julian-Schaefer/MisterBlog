import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { BlogService } from 'src/app/services/blog/blog.service';

@Component({
  selector: 'app-add-blog-dialog',
  templateUrl: './add-blog-dialog.component.html',
  styleUrls: ['./add-blog-dialog.component.css']
})
export class AddBlogDialogComponent {

  private urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  addBlogFormControl = new FormControl('', [Validators.required, Validators.pattern(this.urlRegex)]);

  blogUrl: string = '';
  loading = false;
  error: string = null;

  constructor(public dialogRef: MatDialogRef<AddBlogDialogComponent>, private blogService: BlogService) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onAddClick(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    const blogSelection = { blogUrl: this.blogUrl, isSelected: true };
    this.blogService.addSelectedBlog(blogSelection).pipe(finalize(() => this.loading = false)).subscribe({
      complete: () => {
        this.dialogRef.close(blogSelection);
      }, error: (err) => {
        if (err.status == 406) {
          this.addBlogFormControl.setErrors({ "not_supported": err });
        } else if (err.status == 409) {
          this.addBlogFormControl.setErrors({ "conflict": err });
        } else {
          this.addBlogFormControl.setErrors({ "unknown": err });
        }
      }
    });
  }
}
