import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-social-sign-in',
  templateUrl: './social-sign-in.component.html',
  styleUrls: ['./social-sign-in.component.css']
})
export class SocialSignInComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

}
