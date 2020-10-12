import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogPost } from './BlogPost';
import { SelectedBlog } from './SelectedBlog';
import { ServiceResult, ServiceResultStatus } from './ServiceResult';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private BLOG_POST_KEY = "blog-post-key";

  private baseUrl = environment.apiUrl;
  private blogPosts: Observable<BlogPost[]>;

  constructor(private http: HttpClient) { }

  getBlogPosts(): Observable<ServiceResult<BlogPost[]>> {
    return new Observable<ServiceResult<BlogPost[]>>(observer => {
      let blogPostString = localStorage.getItem(this.BLOG_POST_KEY);
      if (blogPostString) {
        let blogPosts = JSON.parse(blogPostString) as BlogPost[];
        observer.next({ status: ServiceResultStatus.STARTED, content: blogPosts });
      }

      this.http.get<BlogPost[]>(this.baseUrl + "/blog-selection").subscribe(blogPosts => {
        localStorage.setItem(this.BLOG_POST_KEY, JSON.stringify(blogPosts));
        observer.next({ status: ServiceResultStatus.FINISHED, content: blogPosts });
      })
    });
  }

  getSelectedBlogs(): Observable<SelectedBlog[]> {
    return this.http.get<SelectedBlog[]>(this.baseUrl + "/blog-selection/selected");
  }

  setSelectedBlogs(selectedBlogs: SelectedBlog[]): Observable<void> {
    return this.http.post<void>(this.baseUrl + "/blog-selection/selected", selectedBlogs);
  }
}
