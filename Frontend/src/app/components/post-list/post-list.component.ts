import { Component } from '@angular/core';
import { BlogService } from 'src/app/services/blog.service';
import { BlogPost } from 'src/app/services/BlogPost';

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
    this.blogService.getBlogPosts().subscribe(data => {
      this.blogPosts = data;
      this.loading = false;
    });
  }

}
