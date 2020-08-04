import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface IArticleSelection {
  headerSelector?: string;
  dateSelector?: string;
  authorSelector?: string;
  introductionSelector?: string;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  step = 1;
  comment = '';
  articleSelection: IArticleSelection;
  selectedElement: any;
  selectedElements: any[] = [];

  constructor(private http: HttpClient, public activatedRoute: ActivatedRoute) {
    let url = this.activatedRoute.snapshot.queryParamMap.get('url');
    http.get("http://localhost:8080/html?url=" + url, { responseType: 'text' }).subscribe((data) => this.comment = data);
  }

  onElementSelected(e: any) {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.selectedElement = e.target;
    this.selectedElement.style.border = "red 2px solid";
    console.log(this.articleSelection);
  }

  onNextClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    let selected = this.selectedElement;
    let selectorString = this.getTagName(selected);
    while (selected.parentElement) {
      if (selected.parentElement.tagName.toLowerCase() === "div" && selected.parentElement.id === "preview-div") {
        break;
      }

      selectorString = this.getTagName(selected.parentElement) + selectorString;
      selected = selected.parentElement;
    }

    this.selectedElements[this.step] = this.selectedElement;

    // switch (this.step) {
    //   case 1: this.articleSelection = { ...this.articleSelection, headerSelector: selectorString }; break;
    //   case 2: this.articleSelection = { ...this.articleSelection, dateSelector: selectorString }; break;
    //   case 3: this.articleSelection = { ...this.articleSelection, authorSelector: selectorString }; break;
    //   case 4: this.articleSelection = { ...this.articleSelection, introductionSelector: selectorString }; break;
    // }

    this.step += 1;
  }

  onBackClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.step -= 1;

    this.selectedElement = this.selectedElements[this.step];
    this.selectedElement.style.border = "red 2px solid";
  }

  getTagName(element: any) {
    return element.tagName.toLowerCase() + ' ';
  }

  onMouseOver(e: any) {
    if (e.target !== this.selectedElement) {
      e.target.style.border = "black 1px solid";
    }
  }

  onMouseOut(e: any) {
    if (e.target !== this.selectedElement) {
      e.target.style.border = "none";
    }
  }
}
