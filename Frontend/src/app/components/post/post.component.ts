import { Component, ViewEncapsulation } from '@angular/core';
import { BlogPost } from 'src/app/services/BlogPost';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from 'src/app/services/blog/blog.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PostComponent {
  blogPost: BlogPost;

  constructor(private blogService: BlogService, private router: Router, private activatedRoute: ActivatedRoute) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.blogPost = this.router.getCurrentNavigation().extras.state.data as BlogPost;
    } else {
      this.blogService.getBlogPostFromUrl(this.activatedRoute.snapshot.queryParamMap.get('url')).subscribe(data => {
        this.blogPost = data;
      });
    }
  }
}
