import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  comment = '';

  onClick(e: any) {
    console.log(e.target.innerText);
  }
  
  onMouseOver(e: any) {
    e.target.style.border = "black 1px solid";
  }
  
  onMouseOut(e: any) {
    e.target.style.border = "none";
  }
  
  constructor(private http: HttpClient) { 
    let url = "https://waldo.be";
    http.get("http://localhost:8080/html?url=" + url, {responseType: 'text'}).subscribe((data) => this.comment = data);
  }
}
