import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BlogService } from 'src/app/services/blog/blog.service';
import { UtilService } from 'src/app/services/util.service';
import { SelectedBlog } from 'src/app/services/SelectedBlog';
import { AddBlogDialogComponent } from '../add-blog-dialog/add-blog-dialog.component';
import { Store } from '@ngrx/store';
import * as actions from './blog-selection.actions';
import { selectBlogSelectionState } from './blog-selection.reducer';
@Component({
  selector: 'selected-blogs',
  templateUrl: './selected-blogs.component.html',
  styleUrls: ['./selected-blogs.component.css']
})
export class SelectedBlogsComponent implements OnInit {
  @Output() selectedBlogsUpdated = new EventEmitter<string>();

  state$ = this.store.select(selectBlogSelectionState);

  constructor(private dialog: MatDialog, private blogService: BlogService, public utilService: UtilService, private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(actions.getBlogSelection());
  }

  updateSelectedBlogs(): void {
    // this.blogService.setSelectedBlogs(this.selectedBlogs).subscribe(_ => {
    //   this.selectedBlogsUpdated.emit();
    // });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddBlogDialogComponent);
    dialogRef.afterClosed().subscribe(blogSelection => {
      if (blogSelection) {
        this.store.dispatch(actions.addBlogSelection({ blogSelection }));
      }
    })
  }
}