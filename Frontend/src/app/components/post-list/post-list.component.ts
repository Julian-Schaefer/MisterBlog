import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from 'src/app/services/blog.service';
import { BlogPost } from 'src/app/services/BlogPost';
import { ServiceResultStatus } from 'src/app/services/ServiceResult';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent {

  loading: boolean;
  loadingMore: boolean;
  blogPosts: BlogPost[];

  constructor(private blogService: BlogService) {
    this.loadBlogPosts();
  }

  loadBlogPosts(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.blogService.getBlogPosts().subscribe(result => {
      this.blogPosts = result.content;

      if (result.status == ServiceResultStatus.FINISHED) {
        this.loading = false;
      }
    });
  }

  loadMoreBlogPosts(): void {
    if (this.loadingMore) {
      return;
    }

    this.loadingMore = true;
    this.blogService.getBlogPosts(this.blogPosts.length).subscribe(result => {
      this.blogPosts = result.content;

      if (result.status == ServiceResultStatus.FINISHED) {
        this.loadingMore = false;
      }
    });
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.blogPosts && this.blogPosts.length > 0)
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        this.loadMoreBlogPosts();
      }
  }
}