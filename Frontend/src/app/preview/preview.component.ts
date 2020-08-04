import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface IBlogSelection {
  blogUrl?: string;
  headerSelector?: string;
  dateSelector?: string;
  authorSelector?: string;
  introductionSelector?: string;
  contentSelector?: string;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  blogUrl: string;
  step = 1;
  stage = 1;
  previewHtml: string;
  selectedElement: any;
  selectedElements: any[] = [];
  nextButtonEnabled = false;

  constructor(private http: HttpClient, public activatedRoute: ActivatedRoute) {
    this.blogUrl = this.activatedRoute.snapshot.queryParamMap.get('url');
    http.get("http://localhost:8080/html?url=" + this.blogUrl, { responseType: 'text' }).subscribe((data) => this.previewHtml = data);
  }

  onElementSelected(e: any) {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.selectedElement = e.target;
    this.selectedElement.style.border = "red 2px solid";
    this.nextButtonEnabled = true;
  }

  onNextClick(): void {
    this.nextButtonEnabled = false;

    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.selectedElements[this.step - 1] = this.selectedElement;
    this.step += 1;

    if (this.selectedElements[this.step - 1]) {
      this.selectedElement = this.selectedElements[this.step - 1];
      this.selectedElement.style.border = "red 2px solid";
      this.nextButtonEnabled = true;
    }
  }

  onBackClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.step -= 1;

    this.selectedElement = this.selectedElements[this.step - 1];
    this.selectedElement.style.border = "red 2px solid";
    this.nextButtonEnabled = true;
  }

  onFinishClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.selectedElements[this.step - 1] = this.selectedElement;

    let counter = 1;
    let articleSelection: IBlogSelection = {
      blogUrl: this.blogUrl
    };

    for (let element of this.selectedElements) {
      let selected = element;
      let selectorString = this.getTagName(selected);
      while (selected.parentElement) {
        if (selected.parentElement.tagName.toLowerCase() === "div" && selected.parentElement.id === "preview-div") {
          break;
        }

        selectorString = this.getTagName(selected.parentElement) + selectorString;
        selected = selected.parentElement;
      }

      selectorString = selectorString.trim();

      switch (counter) {
        case 1: articleSelection = { ...articleSelection, headerSelector: selectorString }; break;
        case 2: articleSelection = { ...articleSelection, dateSelector: selectorString }; break;
        case 3: articleSelection = { ...articleSelection, authorSelector: selectorString }; break;
        case 4: articleSelection = { ...articleSelection, introductionSelector: selectorString }; break;
        case 5: articleSelection = { ...articleSelection, contentSelector: selectorString }; break;
      }

      counter++;
    }

    console.log(articleSelection);

    this.http.post("http://localhost:8080/blog-selection", articleSelection, { responseType: 'text' }).subscribe(data => {
      console.log(data);
    });
  }

  getTagName(element: any): string {
    let tagName = element.tagName.toLowerCase();
    if (element.classList.length !== 0) {
      tagName += ".";
      for (let className of element.classList) {
        tagName += className + " ";
      }
    }

    tagName += " ";
    return tagName;
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
