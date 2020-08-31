import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(public authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let idToken = this.authService.getIdToken();
        request = this.addToken(request, idToken);

        return next.handle(request).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(request, next);
            } else {
                return throwError(error);
            }
        }));
    }

    private addToken(request: HttpRequest<any>, idToken: string) {
        return request.clone({
            setHeaders: {
                'Authorization': `Bearer ${idToken}`
            }
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshIdToken().pipe(
                switchMap((idToken: string) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(idToken);
                    return next.handle(this.addToken(request, idToken));
                }));
        } else {
            return this.refreshTokenSubject.pipe(
                filter(idToken => idToken != null),
                take(1),
                switchMap(token => {
                    return next.handle(this.addToken(request, token));
                }));
        }
    }
}