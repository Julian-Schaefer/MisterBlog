import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface IArticleSelection {
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

  step = 1;
  previewHtml: string;
  selectedElement: any;
  selectedElements: any[] = [];
  nextButtonEnabled = false;

  constructor(private http: HttpClient, public activatedRoute: ActivatedRoute) {
    let url = this.activatedRoute.snapshot.queryParamMap.get('url');
    http.get("http://localhost:8080/html?url=" + url, { responseType: 'text' }).subscribe((data) => this.previewHtml = data);
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
  }

  onBackClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.step -= 1;

    this.selectedElement = this.selectedElements[this.step - 1];
    this.selectedElement.style.border = "red 2px solid";
  }

  onFinishClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.selectedElements[this.step - 1] = this.selectedElement;

    let counter = 1;
    let articleSelection: IArticleSelection;

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

    this.http.post("http://localhost:8080/blog-selection", articleSelection).subscribe(data => {
      console.log(data);
    });
  }

  getTagName(element: any): string {
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
