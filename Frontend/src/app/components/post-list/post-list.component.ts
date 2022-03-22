import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { BlogService } from 'src/app/services/blog/blog.service';
import { BlogPost } from 'src/app/services/BlogPost';
import { ServiceResult, ServiceResultStatus } from 'src/app/services/ServiceResult';
import { UtilService } from 'src/app/services/util.service';
import { selectPostListState } from './redux/post-list.reducer';
import { selectBlogSelectionState } from '../selected-blogs/redux/blog-selection.reducer';
import * as actions from './redux/post-list.actions';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  private routerEventSubscription: Subscription;

  state$ = this.store.select(selectPostListState);
  blogSelectionState$ = this.store.select(selectBlogSelectionState);

  constructor(public utilService: UtilService, private store: Store, private router: Router) {
    this.routerEventSubscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.loadBlogPosts();
      }
    })
  }

  ngOnInit(): void {
    this.loadBlogPosts();

    this.blogSelectionState$.subscribe((blogSelectionState) => {
      if (blogSelectionState.hasChanged) {
        this.loadBlogPosts();
      }
    })
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

  @HostListener("window:scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadMoreBlogPosts();
    }
  }
}