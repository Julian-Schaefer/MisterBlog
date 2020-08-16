import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HTMLService {

  private baseUrl = "http://localhost:8080";

  constructor(private http: HttpClient) { }

  getBlogPosts(blogUrl: string): Observable<string> {
    return this.http.get(this.baseUrl + "/html?url=" + blogUrl, { responseType: 'text' });
  }

  getSpecificBlogPost(blogUrl: string, headerSelector: string): Observable<string> {
    return this.http.get(this.baseUrl + "/html?url=" + blogUrl + "&headerSelector=" + headerSelector, { responseType: 'text' });
  }
}