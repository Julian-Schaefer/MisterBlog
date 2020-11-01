import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { HTMLService } from '../../services/html.service';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

enum Step {
  SELECT_FIRST_BLOG_POST_HEADER = 0,
  SELECT_FIRST_BLOG_POST_INTRODUCTION = 1,
  SELECT_SECOND_BLOG_POST_HEADER = 2,
  SELECT_SECOND_BLOG_POST_INTRODUCTION = 3,
  SELECT_OLD_BLOG_POSTS_LINK = 4,
  SELECT_BLOG_POST_HEADER = 5,
  SELECT_BLOG_POST_CONTENT = 6,
  SELECT_BLOG_POST_DATE = 7,
  SELECT_BLOG_POST_AUTHOR = 8,
}

export interface IBlogSelection {
  blogUrl: string;
  postHeaderSelector: string;
  postIntroductionSelector: string;
  oldPostsSelector: string;
  headerSelector: string;
  dateSelector: string;
  authorSelector: string;
  contentSelector: string;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  isOptional = false;

  blogUrl: string;

  @ViewChild('previewIframe') previewIframe: ElementRef<HTMLIFrameElement>;
  @ViewChild('stepper') stepper: MatStepper;

  step = Step.SELECT_FIRST_BLOG_POST_HEADER;
  selectedElement: any;
  selectedElements: any[] = [];
  previewLoading = true;
  nextButtonEnabled = false;

  constructor(private dialog: MatDialog, private htmlService: HTMLService, public activatedRoute: ActivatedRoute, private router: Router, private zone: NgZone) {
    this.blogUrl = this.activatedRoute.snapshot.queryParamMap.get('url');
    this.htmlService.getBlogPosts(this.blogUrl).subscribe((data) => {
      this.setupPreviewIframe(data);
    });
  }

  onElementSelected(e: MouseEvent) {
    this.unselectElement();
    this.selectElement(e.target);
  }

  onBackClick(): void {
    this.unselectElement();

    if (this.step === Step.SELECT_BLOG_POST_HEADER) {
      this.previewLoading = true;
      this.htmlService.getBlogPosts(this.blogUrl).subscribe((data) => {
        this.previousStep();
        this.setupPreviewIframe(data);
        this.selectElement(this.selectedElements[this.step]);
      });
    } else {
      this.previousStep();
      this.selectElement(this.selectedElements[this.step]);
    }
  }

  onNextClick(): void {
    this.unselectElement();
    this.selectedElements[this.step] = this.htmlService.cloneElement(this.selectedElement);

    switch (this.step) {
      case Step.SELECT_SECOND_BLOG_POST_HEADER:
        try {
          this.htmlService.checkElementTypesAndDepths(this.selectedElements[Step.SELECT_FIRST_BLOG_POST_HEADER], this.selectedElements[Step.SELECT_SECOND_BLOG_POST_HEADER]);
          this.nextStep();
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      case Step.SELECT_SECOND_BLOG_POST_INTRODUCTION:
        try {
          this.htmlService.checkElementTypesAndDepths(this.selectedElements[Step.SELECT_FIRST_BLOG_POST_INTRODUCTION], this.selectedElements[Step.SELECT_SECOND_BLOG_POST_INTRODUCTION]);
          this.nextStep();
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      case Step.SELECT_OLD_BLOG_POSTS_LINK:
        this.previewLoading = true;
        let headerElement = this.selectedElements[Step.SELECT_FIRST_BLOG_POST_HEADER];
        let headerSelectionArray = this.getSelectorArray(headerElement);
        let headerSelector = this.htmlService.buildSelectorString(headerSelectionArray);
        this.htmlService.getSpecificBlogPost(this.blogUrl, headerSelector).subscribe((data) => {
          this.setupPreviewIframe(data);
          this.nextStep();
        });
        break;
      default:
        this.nextStep();
        break;
    }

    this.selectElement(this.selectedElements[this.step]);
  }

  setupPreviewIframe(data: string) {
    const blob = new Blob([data], { type: "text/html" });
    this.previewIframe.nativeElement.src = URL.createObjectURL(blob);

    this.previewIframe.nativeElement.onload = (_) => {
      this.previewIframe.nativeElement.contentWindow.document.body.onmouseover = (e) => {
        this.onMouseOver(e);
      }

      this.previewIframe.nativeElement.contentWindow.document.body.onmouseout = (e) => {
        this.onMouseOut(e);
      }

      this.previewIframe.nativeElement.contentWindow.document.body.onmousedown = (e) => {
        this.onElementSelected(e);
      }

      this.zone.run(() => {
        this.previewLoading = false;
      });
    }
  }

  onFinishClick(): void {
    this.unselectElement();
    this.selectedElements[this.step] = this.selectedElement;

    let articleSelection: IBlogSelection = {
      blogUrl: this.blogUrl,
      postHeaderSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_FIRST_BLOG_POST_HEADER]),
        this.getSelectorArray(this.selectedElements[Step.SELECT_SECOND_BLOG_POST_HEADER])),
      postIntroductionSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_FIRST_BLOG_POST_INTRODUCTION]),
        this.getSelectorArray(this.selectedElements[Step.SELECT_SECOND_BLOG_POST_INTRODUCTION])),
      oldPostsSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_OLD_BLOG_POSTS_LINK])),
      headerSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_BLOG_POST_HEADER])),
      authorSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_BLOG_POST_AUTHOR])),
      dateSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_BLOG_POST_DATE])),
      contentSelector: this.htmlService.buildSelectorString(this.getSelectorArray(this.selectedElements[Step.SELECT_BLOG_POST_CONTENT])),
    };

    console.log(articleSelection);

    this.htmlService.createBlogSelection(articleSelection).subscribe(_ => {
      this.router.navigate([""]);
    }, error => {
      this.dialog.open(ErrorDialogComponent, { data: error });
    });
  }

  onSelectionChange(event: StepperSelectionEvent): void {
    this.unselectElement();

    if (this.step > Step.SELECT_OLD_BLOG_POSTS_LINK && event.selectedIndex <= Step.SELECT_OLD_BLOG_POSTS_LINK) {
      this.previewLoading = true;
      this.htmlService.getBlogPosts(this.blogUrl).subscribe((data) => {
        this.step = event.selectedIndex;
        this.setupPreviewIframe(data);
        this.selectElement(this.selectedElements[this.step]);
      });
    } else {
      this.step = event.selectedIndex;
      this.selectElement(this.selectedElements[this.step]);
    }
  }

  nextStep(): void {
    this.step += 1;
    this.stepper.selected.completed = true;
    this.stepper.next();
  }

  previousStep(): void {
    this.step -= 1;
    this.stepper.selected.completed = false;
    this.stepper.previous();
  }

  getSelectorArray(element: HTMLElement): { tagName: string, siblingIndex: number }[] {
    return this.htmlService.getSelectorArray(element, this.previewIframe.nativeElement.contentWindow.document.body);
  }

  getDOMElement(element: HTMLElement): HTMLElement {
    let domElement;
    this.previewIframe.nativeElement.contentWindow.document.body.querySelectorAll("*").forEach(currentElement => {
      if (!domElement && currentElement.isEqualNode(element)) {
        domElement = currentElement;
      }
    });

    return domElement;
  }

  unselectElement() {
    this.zone.run(() => {
      if (this.selectedElement) {
        this.nextButtonEnabled = false;
        this.selectedElement.style.border = "none";
      }
    });
  }

  selectElement(element: any): void {
    this.zone.run(() => {
      element = this.getDOMElement(element);

      if (element) {
        this.selectedElement = element;
        element.style.border = "red 2px solid";
        this.nextButtonEnabled = true;
      }
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
