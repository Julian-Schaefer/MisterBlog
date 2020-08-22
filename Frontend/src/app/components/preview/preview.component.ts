import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { HTMLService } from '../../services/html.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
export class PreviewComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  isOptional = false;

  blogUrl: string;
  previewHtml: string;
  @ViewChild("previewDiv") previewDiv: ElementRef<HTMLElement>;

  step = Step.SELECT_FIRST_BLOG_POST_HEADER;
  selectedElement: any;
  selectedElements: any[] = [];
  nextButtonEnabled = false;

  constructor(private dialog: MatDialog, private htmlService: HTMLService, public activatedRoute: ActivatedRoute, private formBuilder: FormBuilder) {
    this.blogUrl = this.activatedRoute.snapshot.queryParamMap.get('url');
    this.htmlService.getBlogPosts(this.blogUrl).subscribe((data) => this.previewHtml = data);
  }

  ngOnInit() {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ''
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ''
    });
  }

  onElementSelected(e: MouseEvent) {
    this.unselectElement();
    this.selectElement(e.target);
  }

  onBackClick(): void {
    this.unselectElement();

    if (this.step === Step.SELECT_BLOG_POST_HEADER) {
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
    this.selectedElements[this.step] = this.htmlService.cloneElement(this.selectedElement);

    switch (this.step) {
      case Step.SELECT_SECOND_BLOG_POST_HEADER:
        try {
          this.htmlService.checkElementTypesAndDepths(this.selectedElements[Step.SELECT_FIRST_BLOG_POST_HEADER], this.selectedElements[Step.SELECT_SECOND_BLOG_POST_HEADER]);
          this.step += 1;
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      case Step.SELECT_SECOND_BLOG_POST_INTRODUCTION:
        try {
          this.htmlService.checkElementTypesAndDepths(this.selectedElements[Step.SELECT_FIRST_BLOG_POST_INTRODUCTION], this.selectedElements[Step.SELECT_SECOND_BLOG_POST_INTRODUCTION]);
          this.step += 1;
        } catch (e) {
          this.dialog.open(ErrorDialogComponent, { data: e })
        }
        break;
      case Step.SELECT_OLD_BLOG_POSTS_LINK:
        let headerElement = this.selectedElements[Step.SELECT_FIRST_BLOG_POST_HEADER];
        let headerSelectionArray = this.getSelectorArray(headerElement);
        let headerSelector = this.htmlService.buildSelectorString(headerSelectionArray);
        this.htmlService.getSpecificBlogPost(this.blogUrl, headerSelector).subscribe((data) => {
          this.previewHtml = data;
          this.step += 1;
        });
        break;
      default:
        this.step += 1;
        break;
    }

    this.selectElement(this.selectedElements[this.step]);
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

    this.htmlService.createBlogSelection(articleSelection).subscribe(data => {
      console.log(data);
    });
  }

  getSelectorArray(element: HTMLElement): { tagName: string, siblingIndex: number }[] {
    return this.htmlService.getSelectorArray(element, this.previewDiv.nativeElement)
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
