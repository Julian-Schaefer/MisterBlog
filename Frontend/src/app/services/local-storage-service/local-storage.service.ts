import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements Storage {

  private readonly isBrowser;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  [name: string]: any;

  length: number;

  clear(): void {
    if (this.isBrowser) localStorage.clear();
  }

  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  key(index: number): string | null {
    return this.isBrowser ? localStorage.key(index) : null;
  }

  removeItem(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }
}