import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarLoaderComponent } from './sidebar-loader.component';

describe('SidebarLoaderComponent', () => {
  let component: SidebarLoaderComponent;
  let fixture: ComponentFixture<SidebarLoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarLoaderComponent]
    });
    fixture = TestBed.createComponent(SidebarLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
