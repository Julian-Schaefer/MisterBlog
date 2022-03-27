import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NgxSpinnerModule } from "ngx-spinner";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { SignInComponent } from './components/authentication/sign-in/sign-in.component';
import { SignUpComponent } from './components/authentication/sign-up/sign-up.component';
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

export const interceptorProviders =
    [
        { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: DateInterceptor, multi: true }
    ];

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
        ErrorDialogComponent,
        SignInComponent,
        SignUpComponent,
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
        LoadingSpinnerComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp({
            apiKey: "AIzaSyDLY466XtHAJhe3aX89RbueINfryvSQS-c",
            authDomain: "blogify-cdb97.firebaseapp.com",
            databaseURL: "https://blogify-cdb97.firebaseio.com",
            projectId: "blogify-cdb97",
            storageBucket: "blogify-cdb97.appspot.com",
            messagingSenderId: "797738042746",
            appId: "1:797738042746:web:f79a733cfc9cbad72802c3",
            measurementId: "G-V0GCNMMWW7"
        }),
        AngularFireAuthModule,
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
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatBadgeModule,
        MatGridListModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatStepperModule,
        MatCheckboxModule,
        MatDividerModule,
        MatIconModule,
        NgxSpinnerModule,
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
    ],
    providers: [interceptorProviders],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        registerLocaleData(localeDe);
    }
}