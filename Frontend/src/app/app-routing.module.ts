import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './components/authentication/sign-in/sign-in.component';
import { SignUpComponent } from './components/authentication/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/authentication/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/authentication/verify-email/verify-email.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [
  { path: 'posts', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'post', component: PostComponent, canActivate: [AuthGuard] },
  // Unauthenticated
  { path: '', component: AboutComponent, canActivate: [PublicGuard] },
  { path: 'sign-in', component: SignInComponent, canActivate: [PublicGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate: [PublicGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [PublicGuard] },
  { path: 'verify-email-address', component: VerifyEmailComponent, canActivate: [PublicGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy',
    onSameUrlNavigation: 'reload',
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
