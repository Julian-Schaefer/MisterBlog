import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogPost } from './BlogPost';
import { SelectedBlog } from './SelectedBlog';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBlogPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.baseUrl + "/blog-selection");
  }

  getSelectedBlogs(): Observable<SelectedBlog[]> {
    return this.http.get<SelectedBlog[]>(this.baseUrl + "/blog-selection/selected");
  }
}
