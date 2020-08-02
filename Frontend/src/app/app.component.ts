import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Blogify';
  comment = '';
  onClick(e: any) {
    console.log(e.target.innerText);
  }
  
  constructor(private http: HttpClient) { 
    http.get("http://localhost:8080/hello/html", {responseType: 'text'}).subscribe((data) => this.comment = data);
  }
}
