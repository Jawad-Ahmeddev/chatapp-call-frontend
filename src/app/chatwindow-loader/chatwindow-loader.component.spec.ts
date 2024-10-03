import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatwindowLoaderComponent } from './chatwindow-loader.component';

describe('ChatwindowLoaderComponent', () => {
  let component: ChatwindowLoaderComponent;
  let fixture: ComponentFixture<ChatwindowLoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatwindowLoaderComponent]
    });
    fixture = TestBed.createComponent(ChatwindowLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
