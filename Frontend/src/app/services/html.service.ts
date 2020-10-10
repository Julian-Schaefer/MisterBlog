import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBlogSelection } from '../components/preview/preview.component';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HTMLService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBlogPosts(blogUrl: string): Observable<Blob> {
    return this.http.get(this.baseUrl + "/html?url=" + blogUrl, { responseType: 'blob' });
  }

  getSpecificBlogPost(blogUrl: string, headerSelector: string): Observable<string> {
    return this.http.get(this.baseUrl + "/html?url=" + blogUrl + "&headerSelector=" + headerSelector, { responseType: 'text' });
  }

  createBlogSelection(blogSelection: IBlogSelection) {
    return this.http.post(this.baseUrl + "/blog-selection", blogSelection, { responseType: "text" });
  }

  getSelectorArray(element: HTMLElement, rootElement: HTMLElement): { tagName: string, siblingIndex: number }[] {
    let selected = this.cloneElement(element);

    let selectorArray: { tagName: string, siblingIndex: number }[] = [];

    while (selected) {
      if (selected.tagName.toLowerCase() === rootElement.tagName.toLowerCase() && selected.id === rootElement.id) {
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
}