import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface IArticleSelection {
  selector: string;
  siblingIndex: number;
}

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
  previewHtml: string;

  step = 0;
  stage = 0;
  selectedElement: any;
  selectedElements: any[][] = [[], [], [], []];
  secondStageElements: any[] = [];
  nextButtonEnabled = false;

  constructor(private http: HttpClient, public activatedRoute: ActivatedRoute) {
    this.blogUrl = this.activatedRoute.snapshot.queryParamMap.get('url');
    http.get("http://localhost:8080/html?url=" + this.blogUrl, { responseType: 'text' }).subscribe((data) => this.previewHtml = data);
  }

  onElementSelected(e: any) {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    console.log(e);
    this.selectedElement = e.target;
    this.selectedElement.style.border = "red 2px solid";
    this.nextButtonEnabled = true;
  }

  onNextClick(): void {
    this.nextButtonEnabled = false;

    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    switch (this.stage) {
      case 0:
        this.selectedElements[this.stage][this.step] = this.selectedElement;
        this.step += 1;
        if (this.step > 1) {
          this.stage += 1;
          this.step = 0;
        }
        break;
      case 1:
        this.selectedElements[this.stage][this.step] = this.selectedElement;
        this.step += 1;
        if (this.step > 1) {
          this.stage += 1;
          this.step = 0;
        }
        break;
    }

    if (this.selectedElements[this.stage][this.step]) {
      this.selectedElement = this.selectedElements[this.stage][this.step];
      this.selectedElement.style.border = "red 2px solid";
      this.nextButtonEnabled = true;
    }
  }

  onBackClick(): void {
    if (this.selectedElement) {
      this.selectedElement.style.border = "none";
    }

    this.step -= 1;
    if (this.step < 0) {
      this.stage -= 1;
    }

    this.selectedElement = this.selectedElements[this.stage][this.step];
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
      let selectorString: string = "";
      while (selected) {
        if (selected.tagName.toLowerCase() === "div" && selected.id === "preview-div") {
          break;
        }

        let siblings = selected.parentElement.children as HTMLCollection;
        let siblingIndex = 0;
        for (let counter = 0; counter < siblings.length; counter++) {
          let sibling = siblings.item(counter);
          if (sibling === selected) {
            siblingIndex = counter;
            break;
          }
        }

        selectorString = selected.tagName.toLowerCase() + ":eq(" + siblingIndex + ") > " + selectorString;
        selected = selected.parentElement;
      }

      /*
    for (let element of this.selectedElements) {
      let selected = element;
      let selectorString: string = "";
      while (selected) {
        if (selected.tagName.toLowerCase() === "div" && selected.id === "preview-div") {
          break;
        }

        let siblings = selected.parentElement.children as HTMLCollection;
        let siblingIndex = 0;
        for (let counter = 0; counter < siblings.length; counter++) {
          let sibling = siblings.item(counter);
          if (sibling === selected) {
            siblingIndex = counter;
            break;
          }
        }

        selectorString = selected.tagName.toLowerCase() + ":eq(" + siblingIndex + ") > " + selectorString;
        selected = selected.parentElement;
      }

      selectorString = selectorString.trim();
      */

      let tagName = selectedElementFirstStage.tagName.toLowerCase();
      let selectorString = tagName;

      let firstClassList = selectedElementFirstStage.classList as DOMTokenList;
      let secondClassList = selectedElementSecondStage.classList as DOMTokenList;

      if (firstClassList.length > 0) {
        selectorString += ".";
      }

      firstClassList.forEach(cssClass => {
        if (secondClassList.contains(cssClass)) {
          selectorString += cssClass + " ";
        }
      });

      console.log(selectorString);

      selectedElementFirstStage = selectedElementFirstStage.parentElement;
      selectedElementSecondStage = selectedElementSecondStage.parentElement;
    }


    // for (let element of this.selectedElements) {
    //   let selected = element;
    //   let selectorString = this.getTagName(selected);
    //   while (selected.parentElement) {
    //     if (selected.parentElement.tagName.toLowerCase() === "div" && selected.parentElement.id === "preview-div") {
    //       break;
    //     }

    //     selectorString = this.getTagName(selected.parentElement) + selectorString;
    //     selected = selected.parentElement;
    //   }

    //   selectorString = selectorString.trim();

    //   switch (counter) {
    //     case 1: articleSelection = { ...articleSelection, headerSelector: selectorString }; break;
    //     case 2: articleSelection = { ...articleSelection, dateSelector: selectorString }; break;
    //     case 3: articleSelection = { ...articleSelection, authorSelector: selectorString }; break;
    //     case 4: articleSelection = { ...articleSelection, introductionSelector: selectorString }; break;
    //     case 5: articleSelection = { ...articleSelection, contentSelector: selectorString }; break;
    //   }

    //   counter++;
    // }

    console.log(articleSelection);

    this.http.post("http://localhost:8080/blog-selection", articleSelection, { responseType: 'text' }).subscribe(data => {
      console.log(data);
    });
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
