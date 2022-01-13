import { TestBed } from '@angular/core/testing';

import { HTMLService } from './html.service';

describe('HTMLService', () => {
  let service: HTMLService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HTMLService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
