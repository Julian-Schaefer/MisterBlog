import { TestBed } from '@angular/core/testing';

import { DateInterceptor } from './date.interceptor';

describe('DateInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      DateInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: DateInterceptor = TestBed.inject(DateInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
