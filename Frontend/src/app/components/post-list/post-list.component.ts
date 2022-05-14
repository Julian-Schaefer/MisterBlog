import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { UtilService } from 'src/app/services/util.service';
import { selectPostListState } from './redux/post-list.reducer';
import { selectBlogSelectionState } from '../selected-blogs/redux/blog-selection.reducer';
import * as actions from './redux/post-list.actions';
import { MatDialog } from '@angular/material/dialog';
import { SelectedBlogsComponent } from '../selected-blogs/selected-blogs.component';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  private routerEventSubscription: Subscription;
  @ViewChild(IonContent, { static: false }) content: IonContent;

  state$ = this.store.select(selectPostListState);
  blogSelectionState$ = this.store.select(selectBlogSelectionState);

  constructor(public utilService: UtilService, private store: Store, private router: Router, private dialog: MatDialog) { }

  ionViewWillEnter() {
    const componentUrl = this.router.url;
    this.routerEventSubscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd && evt.url && evt.url === componentUrl) {
        this.loadBlogPosts();
        this.content.scrollToTop(700);
      }
    })
  }

  ionViewWillLeave() {
    if (this.routerEventSubscription) {
      this.routerEventSubscription.unsubscribe();
    }
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