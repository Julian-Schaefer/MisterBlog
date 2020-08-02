import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  comment = '';
  
  constructor(private http: HttpClient, public activatedRoute: ActivatedRoute) {
    let url = this.activatedRoute.snapshot.queryParamMap.get('url');
    console.log(url);
    http.get("http://localhost:8080/html?url=" + url, {responseType: 'text'}).subscribe((data) => this.comment = data);
  }

  onClick(e: any) {
    console.log(e);
    let selected = e.target;
    let s = "<" + e.target.tagName + ">";
    while(selected.parentElement) {
      s += "<" + selected.parentElement.tagName + ">";
      selected = selected.parentElement;
    }
    console.log(s);
  }
  
  onMouseOver(e: any) {
    e.target.style.border = "black 1px solid";
  }
  
  onMouseOut(e: any) {
    e.target.style.border = "none";
  }
}
