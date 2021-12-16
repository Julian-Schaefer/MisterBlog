import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectedBlogsComponent } from './selected-blogs.component';

describe('SelectedBlogsComponent', () => {
  let component: SelectedBlogsComponent;
  let fixture: ComponentFixture<SelectedBlogsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedBlogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedBlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
