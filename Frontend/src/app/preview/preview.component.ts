import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import * as clone2 from 'clone';

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
  nextButtonEnabled = false;

  constructor(private dialog: MatDialog, private http: HttpClient, public activatedRoute: ActivatedRoute) {
    this.blogUrl = this.activatedRoute.snapshot.queryParamMap.get('url');
    http.get("http://localhost:8080/html?url=" + this.blogUrl, { responseType: 'text' }).subscribe((data) => this.previewHtml = data);
  }

  onElementSelected(e: any) {
    this.unselectElement();
    this.selectElement(e.target);
  }

  onBackClick(): void {
    this.unselectElement();

    this.step -= 1;
    if (this.step < 0) {
      this.stage -= 1;
      this.step = this.selectedElements[this.stage].length - 1;
    }

    this.selectElement(this.selectedElements[this.stage][this.step]);
  }

  onNextClick(): void {
    this.unselectElement();

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

        try {
          this.checkFirstAndSecondStage();
          this.step += 1;
          if (this.step > 1) {
            this.stage += 1;
            this.step = 0;
          }
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      case 2:
        this.selectedElements[this.stage][this.step] = this.selectedElement;
        this.stage += 1;
        this.step = 0;
        let headerElement = this.selectedElements[0][0];
        console.log(headerElement);
        let arr = this.getSelectorArray(headerElement);
        let sel = this.buildSelectorString(arr);
        this.http.get("http://localhost:8080/html?url=" + this.blogUrl + "&headerSelector=" + sel, { responseType: 'text' }).subscribe((data) => { console.log(data); this.previewHtml = data });
        break;
    }

    this.selectElement(this.selectedElements[this.stage][this.step]);
  }

  onFinishClick(): void {
    this.unselectElement();

    this.selectedElements[this.step - 1] = this.selectedElement;

    let articleSelection: IBlogSelection = {
      blogUrl: this.blogUrl
    };

    console.log(this.buildSelectorString(this.getSelectorArray(this.selectedElements[0][0]), this.getSelectorArray(this.selectedElements[1][0])));
    console.log(this.buildSelectorString(this.getSelectorArray(this.selectedElements[0][1]), this.getSelectorArray(this.selectedElements[1][1])));
    console.log(this.buildSelectorString(this.getSelectorArray(this.selectedElements[2][0])));

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

    //   let tagName = selectedElementFirstStage.tagName.toLowerCase();
    //   let selectorString = tagName;

    //   let firstClassList = selectedElementFirstStage.classList as DOMTokenList;
    //   let secondClassList = selectedElementSecondStage.classList as DOMTokenList;

    //   if (firstClassList.length > 0) {
    //     selectorString += ".";
    //   }

    //   firstClassList.forEach(cssClass => {
    //     if (secondClassList.contains(cssClass)) {
    //       selectorString += cssClass + " ";
    //     }
    //   });

    //   console.log(selectorString);

    //   selectedElementFirstStage = selectedElementFirstStage.parentElement;
    //   selectedElementSecondStage = selectedElementSecondStage.parentElement;
    // }


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

  getSelectorArray(element: any): { tagName: string, siblingIndex: number }[] {
    let selected = clone2(element);
    let selectorArray: { tagName: string, siblingIndex: number }[] = [];

    while (selected) {
      if (selected.tagName.toLowerCase() === "div" && selected.id === "preview-div") {
        break;
      }

      let siblings = selected.parentElement.children as HTMLCollection;
      let siblingIndex = 0;
      for (let siblingCounter = 0; siblingCounter < siblings.length; siblingCounter++) {
        let sibling = siblings.item(siblingCounter);
        if (sibling === selected) {
          siblingIndex = siblingCounter;
          break;
        }
      }

      //selectorString = selected.tagName.toLowerCase() + ":eq(" + siblingIndex + ") > " + selectorString;
      let tagName = selected.tagName.toLowerCase();
      selectorArray.push({ tagName, siblingIndex });

      selected = selected.parentElement;
    }

    return selectorArray.reverse();
  }

  buildSelectorString(firstSelectorArray: { tagName: string, siblingIndex: number }[], secondSelectorArray: { tagName: string, siblingIndex: number }[] = null): string {
    let selectorString = "";
    if (firstSelectorArray && secondSelectorArray) {
      for (let counter = 0; counter < firstSelectorArray.length; counter++) {
        let firstSelector = firstSelectorArray[counter];
        let secondSelector = secondSelectorArray[counter];
        if (firstSelector.siblingIndex === secondSelector.siblingIndex) {
          selectorString += firstSelector.tagName + ":eq(" + firstSelector.siblingIndex + ") > ";
        } else {
          selectorString += firstSelector.tagName + " > ";
        }
      }
    } else {
      for (let selector of firstSelectorArray) {
        selectorString += selector.tagName + ":eq(" + selector.siblingIndex + ") > ";
      }
    }

    return selectorString.substr(0, selectorString.length - 3)
  }

  checkFirstAndSecondStage(): void {
    this.checkElementTypesAndDepths(this.selectedElements[0][this.step], this.selectedElements[1][this.step]);
  }

  checkElementTypesAndDepths(firstElement: any, secondElement: any): void {
    while (firstElement && secondElement) {
      if (firstElement.tagName !== secondElement.tagName) {
        throw "Tagnames not matching!";
      }


      if ((firstElement.parentElement && !secondElement.parentElement) || (!firstElement.parentElement && secondElement.parentElement)) {
        throw "Depths not matching";
      } else {
        firstElement = firstElement.parentElement;
        secondElement = secondElement.parentElement;
      }
    }
  }

  unselectElement() {
    if (this.selectedElement) {
      this.nextButtonEnabled = false;
      this.selectedElement.style.border = "none";
    }
  }

  selectElement(element: any): void {
    if (element) {
      this.selectedElement = element;
      element.style.border = "red 2px solid";
      this.nextButtonEnabled = true;
    }
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