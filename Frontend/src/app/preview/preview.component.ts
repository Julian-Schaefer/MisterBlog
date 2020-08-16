import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { HTMLService } from '../services/html.service';

enum Step {
  SELECT_FIRST_ARTICLE_HEADER = 0,
  SELECT_FIRST_ARTICLE_INTRODUCTION = 1,
  SELECT_SECOND_ARTICLE_HEADER = 2,
  SELECT_SECOND_ARTICLE_INTRODUCTION = 3,
  SELECT_OLD_ARTICLE_LINK = 4,
  SELECT_ARTICLE_HEADER = 5,
  SELECT_ARTICLE_CONTENT = 6,
  SELECT_ARTICLE_DATE = 7,
  SELECT_ARTICLE_AUTHOR = 8,
}

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
  @ViewChild("previewDiv") previewDiv: ElementRef<HTMLElement>;

  step = Step.SELECT_FIRST_ARTICLE_HEADER;
  selectedElement: any;
  selectedElements: any[] = [];
  nextButtonEnabled = false;

  constructor(private dialog: MatDialog, private htmlService: HTMLService, public activatedRoute: ActivatedRoute) {
    this.blogUrl = this.activatedRoute.snapshot.queryParamMap.get('url');
    this.htmlService.getBlogPosts(this.blogUrl).subscribe((data) => this.previewHtml = data);
  }

  onElementSelected(e: MouseEvent) {
    this.unselectElement();
    this.selectElement(e.target);
  }

  onBackClick(): void {
    this.unselectElement();

    if (this.step === Step.SELECT_OLD_ARTICLE_LINK) {
      this.htmlService.getBlogPosts(this.blogUrl).subscribe((data) => {
        this.step -= 1;
        this.previewHtml = data;
        this.selectElement(this.selectedElements[this.step]);
      });
    } else {
      this.step -= 1;
      this.selectElement(this.selectedElements[this.step]);
    }
  }

  onNextClick(): void {
    this.unselectElement();
    this.selectedElements[this.step] = this.cloneElement(this.selectedElement);

    switch (this.step) {
      case Step.SELECT_SECOND_ARTICLE_HEADER:
        try {
          this.checkElementTypesAndDepths(this.selectedElements[Step.SELECT_FIRST_ARTICLE_HEADER], this.selectedElements[Step.SELECT_SECOND_ARTICLE_HEADER]);
          this.step += 1;
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      case Step.SELECT_SECOND_ARTICLE_INTRODUCTION:
        try {
          this.checkElementTypesAndDepths(this.selectedElements[Step.SELECT_FIRST_ARTICLE_INTRODUCTION], this.selectedElements[Step.SELECT_SECOND_ARTICLE_INTRODUCTION]);

          let headerElement = this.selectedElements[Step.SELECT_FIRST_ARTICLE_HEADER];
          let headerSelectionArray = this.getSelectorArray(headerElement);
          let headerSelector = this.buildSelectorString(headerSelectionArray);
          this.htmlService.getSpecificBlogPost(this.blogUrl, headerSelector).subscribe((data) => {
            this.previewHtml = data;
            this.step += 1;
          });
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      default:
        this.step += 1;
        break;
    }

    this.selectElement(this.selectedElements[this.step]);
  }

  onFinishClick(): void {
    this.unselectElement();
    this.selectedElements[this.step - 1] = this.selectedElement;

    let articleSelection: IBlogSelection = {
      blogUrl: this.blogUrl
    };

    console.log(this.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_FIRST_ARTICLE_HEADER]),
      this.getSelectorArray(this.selectedElements[Step.SELECT_SECOND_ARTICLE_HEADER])));
    console.log(this.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_FIRST_ARTICLE_INTRODUCTION]),
      this.getSelectorArray(this.selectedElements[Step.SELECT_SECOND_ARTICLE_INTRODUCTION])));
    console.log(this.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_OLD_ARTICLE_LINK])));

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

    // this.htmlService.post("http://localhost:8080/blog-selection", articleSelection, { responseType: 'text' }).subscribe(data => {
    //   console.log(data);
    // });
  }

  getSelectorArray(element: HTMLElement): { tagName: string, siblingIndex: number }[] {
    let selected = this.cloneElement(element);

    let selectorArray: { tagName: string, siblingIndex: number }[] = [];

    while (selected) {
      if (selected.tagName.toLowerCase() === this.previewDiv.nativeElement.tagName.toLowerCase() && selected.id === this.previewDiv.nativeElement.id) {
        break;
      }

      let siblingIndex = -1;
      if (selected.parentElement) {
        let siblings = selected.parentElement.children as HTMLCollection;
        for (let siblingCounter = 0; siblingCounter < siblings.length; siblingCounter++) {
          let sibling = siblings.item(siblingCounter);
          if (sibling === selected) {
            siblingIndex = siblingCounter;
            break;
          }
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
        if (firstSelector.siblingIndex === secondSelector.siblingIndex && firstSelector.siblingIndex !== -1) {
          selectorString += firstSelector.tagName + ":eq(" + firstSelector.siblingIndex + ") > ";
        } else {
          selectorString += firstSelector.tagName + " > ";
        }
      }
    } else {
      for (let selector of firstSelectorArray) {
        if (selector.siblingIndex !== -1) {
          selectorString += selector.tagName + ":eq(" + selector.siblingIndex + ") > ";
        } else {
          selectorString += selector.tagName + " > ";
        }
      }
    }

    return selectorString.substr(0, selectorString.length - 3)
  }

  checkElementTypesAndDepths(firstElement: HTMLElement, secondElement: HTMLElement): void {
    firstElement = this.cloneElement(firstElement);
    secondElement = this.cloneElement(secondElement);

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

  cloneElement(element: HTMLElement): HTMLElement {
    let document = element.ownerDocument.cloneNode(true) as Document;

    let clone;
    document.querySelectorAll("*").forEach(currentElement => {
      if (!clone && currentElement.isEqualNode(element)) {
        clone = currentElement;
      }
    });

    return clone;
  }

  getDOMElement(element: HTMLElement): HTMLElement {
    let domElement;
    this.previewDiv.nativeElement.querySelectorAll("*").forEach(currentElement => {
      if (!domElement && currentElement.isEqualNode(element)) {
        domElement = currentElement;
      }
    });

    return domElement;
  }

  unselectElement() {
    if (this.selectedElement) {
      this.nextButtonEnabled = false;
      this.selectedElement.style.border = "none";
    }
  }

  selectElement(element: any): void {
    element = this.getDOMElement(element);

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
