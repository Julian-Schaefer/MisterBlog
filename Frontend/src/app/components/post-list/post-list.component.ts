import { Component } from '@angular/core';
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
  blogPosts: BlogPost[];

  constructor(private blogService: BlogService) {
    this.loadBlogPosts();
  }

  loadBlogPosts(): void {
    this.loading = true;
    this.blogService.getBlogPosts().subscribe(result => {
      this.blogPosts = result.content;

      if (result.status == ServiceResultStatus.FINISHED) {
        this.loading = false;
      }
    });
  }
}