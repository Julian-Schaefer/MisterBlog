import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { UtilService } from 'src/app/services/util.service';
import { selectPostListState } from './redux/post-list.reducer';
import { selectBlogSelectionState } from '../selected-blogs/redux/blog-selection.reducer';
import * as actions from './redux/post-list.actions';
import { MatDialog } from '@angular/material/dialog';
import { SelectedBlogsComponent } from '../selected-blogs/selected-blogs.component';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  private routerEventSubscription: Subscription;

  state$ = this.store.select(selectPostListState);
  blogSelectionState$ = this.store.select(selectBlogSelectionState);

  constructor(public utilService: UtilService, private store: Store, private router: Router, private dialog: MatDialog) {
    this.routerEventSubscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.loadBlogPosts();
      }
    })
  }

  ngOnInit(): void {
    this.store.dispatch(actions.initializePostList());
    this.loadBlogPosts();

    this.blogSelectionState$.subscribe((blogSelectionState) => {
      if (blogSelectionState.hasChanged) {
        this.loadBlogPosts();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerEventSubscription) {
      this.routerEventSubscription.unsubscribe();
    }
  }

  loadBlogPosts(): void {
    this.store.dispatch(actions.refreshPostList());
  }

  loadMoreBlogPosts(): void {
    this.store.dispatch(actions.loadMorePostList());
  }

  onSelectedBlogsClick(): void {
    this.dialog.open(SelectedBlogsComponent, {
      data: {
        useOwnBorder: false
      }
    });
  }

  async handleScroll($event: any) {
    const scrollElement = await $event.target.getScrollElement();
    const bufferHeight = 80;

    if (scrollElement.scrollTop >= scrollElement.scrollHeight - scrollElement.clientHeight - bufferHeight) {
      this.loadMoreBlogPosts();
    }
  }
}