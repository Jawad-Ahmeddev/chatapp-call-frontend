import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallScreenComponentComponent } from './call-screen-component.component';

describe('CallScreenComponentComponent', () => {
  let component: CallScreenComponentComponent;
  let fixture: ComponentFixture<CallScreenComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallScreenComponentComponent]
    });
    fixture = TestBed.createComponent(CallScreenComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
