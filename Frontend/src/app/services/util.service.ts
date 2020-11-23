import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getHostname(url: string): string {
    url = url.replace("https://", "").replace("http://", "");
    if (url.endsWith("/")) {
      url = url.substring(0, url.lastIndexOf("/"));
    }

    return url;
  }
}
