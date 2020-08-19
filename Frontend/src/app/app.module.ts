import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PreviewComponent } from './preview/preview.component';
import { HomeComponent, AddBlogDialog } from './home/home.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';

import { AuthService } from './shared/services/AuthService';
import { PostListComponent } from './components/post-list/post-list.component';

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    HomeComponent,
    AddBlogDialog,
    ErrorDialogComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    PostListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
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
    MatProgressSpinnerModule
  ],
  entryComponents: [AddBlogDialog],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }