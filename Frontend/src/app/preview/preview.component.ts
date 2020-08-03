import { Component } from '@angular/core';
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
    http.get("http://localhost:8080/html?url=" + url, { responseType: 'text' }).subscribe((data) => this.comment = data);
  }

  onClick(e: any) {
    let selected = e.target;
    let selectorString = this.getTagName(selected);
    while (selected.parentElement) {
      if (selected.parentElement.tagName.toLowerCase() === "div" && selected.parentElement.id === "preview-div") {
        break;
      }

      selectorString = this.getTagName(selected.parentElement) + selectorString;
      selected = selected.parentElement;
    }

    console.log(selectorString);
  }

  getTagName(element: any) {
    return element.tagName.toLowerCase() + ' ';
  }

  onMouseOver(e: any) {
    e.target.style.border = "black 1px solid";
  }

  onMouseOut(e: any) {
    e.target.style.border = "none";
  }
}
