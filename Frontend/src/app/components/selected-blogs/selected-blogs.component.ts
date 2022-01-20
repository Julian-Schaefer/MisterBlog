import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BlogService } from 'src/app/services/blog/blog.service';
import { UtilService } from 'src/app/services/util.service';
import { SelectedBlog } from 'src/app/services/SelectedBlog';
import { AddBlogDialogComponent } from '../add-blog-dialog/add-blog-dialog.component';

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
    const dialogRef = this.dialog.open(AddBlogDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSelectedBlogs();
      }
    })
  }
}