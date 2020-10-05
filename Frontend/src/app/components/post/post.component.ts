import { Component, ViewEncapsulation } from '@angular/core';
import { BlogPost } from 'src/app/services/BlogPost';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PostComponent {
  blogPost: BlogPost;
  contentHtml: string;

  constructor(private router: Router) {
    this.blogPost = this.router.getCurrentNavigation().extras.state.data as BlogPost;
    this.contentHtml = this.blogPost.content;
  }
}
