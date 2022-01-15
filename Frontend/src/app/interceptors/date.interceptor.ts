import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class DateInterceptor implements HttpInterceptor {

  constructor() { }

  private isDate = (s) => moment(s, moment.ISO_8601, true).isValid();

  private stringToDate(obj: Object) {
    return Object.keys(obj)
      .filter((key) => obj[key] && this.isDate(obj[key]))
      .map((key) => { obj[key] = moment(obj[key]).toDate() });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request)
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            if (event.body) {
              event.body.map(obj => Object.assign({}, obj, this.stringToDate(obj)));
            }
          }
        })
      );
  }

}
