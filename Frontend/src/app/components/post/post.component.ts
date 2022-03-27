import { Component, ViewEncapsulation } from '@angular/core';
import { BlogPost } from 'src/app/services/BlogPost';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from 'src/app/services/blog/blog.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PostComponent {
  blogPost: BlogPost;
  blogUrl: string;

  constructor(private utilService: UtilService, private blogService: BlogService, private router: Router, private activatedRoute: ActivatedRoute) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.setBlogPost(this.router.getCurrentNavigation().extras.state.data as BlogPost);
    } else {
      this.blogService.getBlogPostFromUrl(this.activatedRoute.snapshot.queryParamMap.get('url')).subscribe(data => {
        this.setBlogPost(data);
      });
    }
  }

  private setBlogPost(blogPost: BlogPost) {
    this.blogPost = blogPost;

    if (blogPost.blogUrl) {
      this.blogUrl = this.utilService.getHostname(blogPost.blogUrl);
    } else {
      const blogUrl = this.utilService.getHostname(blogPost.postUrl);
      this.blogUrl = blogUrl.substring(0, blogUrl.indexOf('/'))
    }
  }
}
