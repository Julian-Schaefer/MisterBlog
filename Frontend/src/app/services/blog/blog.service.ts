import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogPost } from '../BlogPost';
import { SelectedBlog } from '../SelectedBlog';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { Socket } from 'ngx-socket-io';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private BLOG_POSTS_KEY = "blog-posts-key";

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient,
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private socket: Socket) {
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
    return new Observable((subscriber) => {
      this.authService.getIdToken().subscribe((token: string) => {
        if (token) {
          this.socket.ioSocket.io.opts.query = { Authorization: `Bearer ${token}`, user_id: this.authService.user.uid };
          this.socket.connect();

          this.socket.on('update', (update) => {
            if (update.status === "completed") {
              this.socket.disconnect();
              subscriber.next();
            }
          });

          this.socket.on('error', (err) => {
            this.socket.disconnect();
            subscriber.error(err);
          })

          this.socket.emit('add_selected_blog', selectedBlog);
        }
      });
    });
  }

  deleteSelectedBlog(selectedBlog: SelectedBlog): Observable<void> {
    return this.http.delete<void>(this.baseUrl + "/blog-selection", { body: selectedBlog });
  }
}
