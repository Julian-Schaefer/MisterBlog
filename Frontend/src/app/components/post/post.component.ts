import { Component, ViewEncapsulation } from '@angular/core';
import { BlogPost } from 'src/app/services/BlogPost';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PostComponent {
  blogPost: BlogPost;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.blogPost = this.router.getCurrentNavigation().extras.state.data as BlogPost;
    } else {
      console.log(this.activatedRoute.snapshot.queryParamMap.get('url'));
    }
  }
}
