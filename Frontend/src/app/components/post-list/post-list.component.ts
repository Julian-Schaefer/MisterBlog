import { ForwardRefHandling } from '@angular/compiler';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BlogService } from 'src/app/services/blog/blog.service';
import { BlogPost } from 'src/app/services/BlogPost';
import { ServiceResult, ServiceResultStatus } from 'src/app/services/ServiceResult';
import { UtilService } from 'src/app/services/util.service';
import { selectBlogSelectionState } from '../selected-blogs/blog-selection.reducer';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  loading: boolean;
  loadingMore: boolean;
  blogPosts: BlogPost[];
  private currentPage: number;

  blogSelectionState$ = this.store.select(selectBlogSelectionState);

  constructor(private blogService: BlogService, public utilService: UtilService, private store: Store) { }

  ngOnInit(): void {
    this.loadBlogPosts();

    this.blogSelectionState$.subscribe((state) => {
      if (state.hasChanged) {
        this.loadBlogPosts();
      }
    })
  }

  loadBlogPosts(): void {
    if (this.loading) {
      return;
    }

    this.currentPage = 0;
    this.loading = true;
    this.blogService.getBlogPosts().subscribe(result => this.saveResult(result));
  }

  loadMoreBlogPosts(): void {
    if (this.loadingMore || this.currentPage == 0) {
      return;
    }

    this.loadingMore = true;
    this.blogService.getBlogPosts(this.currentPage).subscribe(result => this.saveResult(result));
  }

  private saveResult(blogPostsResult: ServiceResult<BlogPost[]>) {
    this.blogPosts = blogPostsResult.content;
    this.currentPage++;

    if (blogPostsResult.status == ServiceResultStatus.FINISHED) {
      this.loading = false;
      this.loadingMore = false;
    }
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.blogPosts && this.blogPosts.length > 0)
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        this.loadMoreBlogPosts();
      }
  }
}