import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryWritingComponent } from './story-writing.component';

describe('StoryWritingComponent', () => {
  let component: StoryWritingComponent;
  let fixture: ComponentFixture<StoryWritingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StoryWritingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoryWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
