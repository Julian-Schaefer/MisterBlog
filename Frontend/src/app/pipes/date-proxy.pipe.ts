import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'date'
})
export class DateProxyPipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  async transform(value: any, pattern: string = 'medium'): Promise<string> {
    const currentLang = this.translateService.currentLang;
    const datePipe = new DatePipe(currentLang);

    return new Promise((resolve) => {
      this.translateService.get('date.dateFormatPattern').subscribe({
        next: (localePattern) => {
          resolve(datePipe.transform(value, localePattern));
        },
        error: () => {
          resolve(datePipe.transform(value, pattern));
        }
      })
    });
  }

}
