import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {

  @Input('height')
  height: string;
  @Input('scale')
  scale: string;

  styleString: string;

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.styleString = "height: " + this.height + "; transform: scale(" + this.scale + ");";
    this.spinner.show('spinner');
  }

  ngOnDestroy(): void {
    this.spinner.hide('spinner');
  }
}
