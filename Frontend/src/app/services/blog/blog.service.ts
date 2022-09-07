import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogPost } from '../BlogPost';
import { SelectedBlog } from '../SelectedBlog';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageService } from '../local-storage-service/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private BLOG_POST_KEY = "blog-post-key";

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient,
    private localStorageService: LocalStorageService) {
  }

  getBlogPostsFromLocalStorage(): BlogPost[] {
    let blogPostString = this.localStorageService.getItem(this.BLOG_POST_KEY);
    if (blogPostString) {
      let blogPosts = JSON.parse(blogPostString) as BlogPost[];
      return blogPosts;
    } else {
      return [];
    }
  }

  getBlogPosts(page: number = 0): Observable<BlogPost[]> {
    return new Observable<BlogPost[]>(observer => {
      let relativeUrl = "/blog-selection";
      relativeUrl += "?page=" + page;

      this.http.get<BlogPost[]>(this.baseUrl + relativeUrl).subscribe({
        next: blogPosts => {
          if (page > 1) {
            let previousBlogPosts = this.getBlogPostsFromLocalStorage();
            blogPosts = previousBlogPosts.concat(blogPosts);
          }

          this.localStorageService.setItem(this.BLOG_POST_KEY, JSON.stringify(blogPosts));
          observer.next(blogPosts);
        },
        error: error => observer.error(error)
      });
    });
  }

  getBlogPostFromUrl(url: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(this.baseUrl + "/blog-selection/post?url=" + url);
  }

  getSelectedBlogs(): Observable<SelectedBlog[]> {
    return this.http.get<SelectedBlog[]>(this.baseUrl + "/blog-selection/selected");
  }

  setSelectedBlogs(selectedBlogs: SelectedBlog[]): Observable<SelectedBlog[]> {
    return this.http.post<SelectedBlog[]>(this.baseUrl + "/blog-selection/selected", selectedBlogs);
  }

  addSelectedBlog(selectedBlog: SelectedBlog): Observable<void> {
    return this.http.post<void>(this.baseUrl + "/blog-selection", selectedBlog);
  }

  deleteSelectedBlog(selectedBlog: SelectedBlog): Observable<void> {
    return this.http.delete<void>(this.baseUrl + "/blog-selection", { body: selectedBlog });
  }
}
