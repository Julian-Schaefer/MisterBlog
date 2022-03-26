import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {

  @Input('scale')
  scale: string = "0.6";

  @Input('style')
  style: string;

  @Input('color')
  color: string = "darkblue";

  name: string;
  styleString: string;

  @ViewChild('spinner') spinner: any;

  constructor(private spinnerService: NgxSpinnerService) {
    this.name = uuidv4();
  }

  ngOnInit(): void {
    this.styleString = "transform: scale(" + this.scale + ");";
    if (this.style) {
      this.styleString = this.style + " transform: scale(" + this.scale + ");";
    }

    this.spinnerService.show(this.name);
  }

  ngOnDestroy(): void {
    this.spinnerService.hide(this.name);
  }
}
