import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/services/blog.service';
import { BlogPost } from 'src/app/services/BlogPost';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent {

  blogPosts: BlogPost[];

  constructor(private blogService: BlogService) {
    this.blogService.getBlogPosts().subscribe(data => {
      this.blogPosts = data;
    });
  }

}
