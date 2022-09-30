import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogPost } from '../BlogPost';
import { SelectedBlog } from '../SelectedBlog';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from '../local-storage-service/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private BLOG_POSTS_KEY = "blog-posts-key";

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient,
    private localStorageService: LocalStorageService) {
  }

  getBlogPostsFromLocalStorage(): BlogPost[] {
    let blogPostString = this.localStorageService.getItem(this.BLOG_POSTS_KEY);
    if (blogPostString) {
      let blogPosts = JSON.parse(blogPostString) as BlogPost[];
      return blogPosts;
    } else {
      return [];
    }
  }

  saveBlogPostsToLocalStorage(blogPosts: BlogPost[]) {
    this.localStorageService.setItem(this.BLOG_POSTS_KEY, JSON.stringify(blogPosts));
  }

  getBlogPosts(latestDate?: Date): Observable<BlogPost[]> {
    if (latestDate) {
      return this.http.get<BlogPost[]>(this.baseUrl + `/blog-selection?latestDate=${latestDate.toISOString()}`);
    }

    return this.http.get<BlogPost[]>(this.baseUrl + `/blog-selection`);
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
