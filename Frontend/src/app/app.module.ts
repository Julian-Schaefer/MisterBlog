import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { provideAuth, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver, connectAuthEmulator } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerModule } from "ngx-spinner";
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { SocialSignInComponent } from './components/authentication/social-sign-in/social-sign-in.component';
import { ForgotPasswordComponent } from './components/authentication/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/authentication/verify-email/verify-email.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';
import { SelectedBlogsComponent } from './components/selected-blogs/selected-blogs.component';

import { SafeHtmlPipe } from './pipes/SafeHtmlPipe';
import { SafeURLPipe } from './pipes/SafeURLPipe';

import { AuthenticationInterceptor } from './interceptors/authentication.interceptor';
import { DateInterceptor } from './interceptors/date.interceptor';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AddBlogDialogComponent } from './components/add-blog-dialog/add-blog-dialog.component';
import { DateProxyPipe } from './pipes/date-proxy.pipe';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import * as postListReducer from 'src/app/components/post-list/redux/post-list.reducer';
import * as blogSelectionReducer from 'src/app/components/selected-blogs/redux/blog-selection.reducer';
import * as authenticationReducer from 'src/app/components/authentication/redux/authentication.reducer';
import { BlogSelectionEffects } from './components/selected-blogs/redux/blog-selection.effects';
import { PostListEffects } from './components/post-list/redux/post-list.effects';
import { AuthenticationEffects } from './components/authentication/redux/authentication.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { AboutComponent } from './components/about/about.component';
import { LoadingSpinnerComponent } from './util/components/loading-spinner/loading-spinner.component';
import { HeaderComponent } from './components/header/header.component';
import { AuthenticatorComponent } from './components/authentication/authenticator/authenticator.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { AccountComponent } from './components/account/account.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { getAuth } from 'firebase/auth';

export const interceptorProviders =
    [
        { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: DateInterceptor, multi: true }
    ];

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        ErrorDialogComponent,
        AuthenticatorComponent,
        ForgotPasswordComponent,
        VerifyEmailComponent,
        PostListComponent,
        PostComponent,
        SafeHtmlPipe,
        SafeURLPipe,
        SelectedBlogsComponent,
        AddBlogDialogComponent,
        DateProxyPipe,
        AboutComponent,
        SocialSignInComponent,
        LoadingSpinnerComponent,
        HeaderComponent,
        AccountComponent,
        ConfirmDialogComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        IonicModule.forRoot(),
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => {
            if (typeof document === 'undefined') {
                return getAuth(getApp())
            }

            const auth = initializeAuth(getApp(), {
                persistence: browserLocalPersistence,
                popupRedirectResolver: browserPopupRedirectResolver
            });

            if (!environment.production) {
                connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: false })
            }

            return auth;
        }),
        LoggerModule.forRoot({
            level: NgxLoggerLevel.INFO
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        StoreModule.forRoot({
            blogSelection: blogSelectionReducer.reducer,
            postList: postListReducer.reducer,
            authentication: authenticationReducer.reducer
        }),
        EffectsModule.forRoot([BlogSelectionEffects, PostListEffects, AuthenticationEffects]),
        FlexLayoutModule,
        NgxSkeletonLoaderModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatBadgeModule,
        MatGridListModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatDividerModule,
        MatIconModule,
        MatSnackBarModule,
        NgxSpinnerModule,
        MatSelectModule,
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
    ],
    providers: [interceptorProviders, { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        registerLocaleData(localeDe);
    }
}