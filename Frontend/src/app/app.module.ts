import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
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
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PreviewComponent } from './components/preview/preview.component';
import { AddBlogDialog } from './components/selected-blogs/selected-blogs.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { SignInComponent } from './components/authentication/sign-in/sign-in.component';
import { SignUpComponent } from './components/authentication/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/authentication/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/authentication/verify-email/verify-email.component';
import { AuthService } from './services/auth.service';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';
import { SelectedBlogsComponent } from './components/selected-blogs/selected-blogs.component';

import { SafeHtmlPipe } from './util/SafeHtmlPipe';
import { SafeURLPipe } from './util/SafeURLPipe';

import { AuthenticationInterceptor } from './interceptors/authentication.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    AddBlogDialog,
    ErrorDialogComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    PostListComponent,
    PostComponent,
    SafeHtmlPipe,
    SafeURLPipe,
    SelectedBlogsComponent
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
    DragDropModule
  ],
  entryComponents: [AddBlogDialog],
  providers: [AuthService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthenticationInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }