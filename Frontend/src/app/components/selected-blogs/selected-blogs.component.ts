import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlogService } from 'src/app/services/blog/blog.service';
import { UtilService } from 'src/app/services/util.service';
import { SelectedBlog } from 'src/app/services/SelectedBlog';
import { AddBlogDialogComponent } from '../add-blog-dialog/add-blog-dialog.component';
import { Store } from '@ngrx/store';
import * as actions from './redux/blog-selection.actions';
import { selectBlogSelectionState } from './redux/blog-selection.reducer';
@Component({
  selector: 'selected-blogs',
  templateUrl: './selected-blogs.component.html',
  styleUrls: ['./selected-blogs.component.css']
})
export class SelectedBlogsComponent implements OnInit {
  @Input() useOwnBorder = true;

  state$ = this.store.select(selectBlogSelectionState);

  constructor(private dialog: MatDialog, public utilService: UtilService, private store: Store, @Inject(MAT_DIALOG_DATA) data: any) {
    if (data) {
      this.useOwnBorder = data.useOwnBorder;
    }
  }

  ngOnInit(): void {
    this.store.dispatch(actions.getBlogSelection({ showLoadingIndicator: true }));
  }

  toggleSelectedBlog(event: any, selectedBlog: SelectedBlog): void {
    const toggledBlogSelection: SelectedBlog = { ...selectedBlog, isSelected: event.checked };
    this.store.dispatch(actions.toggleBlogSelection({ toggledBlogSelection }));
  }

  deleteSelectedBlog(selectedBlog: SelectedBlog): void {
    this.store.dispatch(actions.deleteBlogSelection({ blogSelection: selectedBlog }))
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