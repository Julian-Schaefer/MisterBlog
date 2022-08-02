import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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

  constructor(public utilService: UtilService, private blogService: BlogService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ionViewWillEnter() {
    const blogPost = history.state.data as BlogPost;
    if (blogPost) {
      this.setBlogPost(blogPost);
    } else {
      this.blogPost = null;
      this.blogUrl = null;

      this.blogService.getBlogPostFromUrl(this.activatedRoute.snapshot.queryParamMap.get('url')).subscribe(data => {
        this.setBlogPost(data);
      });
    }
  }

  goToOriginalBlogPost() {
    window.open(this.blogPost.postUrl, "_blank");
  }

  private setBlogPost(blogPost: BlogPost) {
    this.blogPost = blogPost;

    if (blogPost.blogUrl) {
      this.blogUrl = blogPost.blogUrl;
    } else {
      this.blogUrl = blogPost.postUrl.substring(0, blogPost.postUrl.indexOf('/', "https://".length))
    }
  }
}
