import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptWritingComponent } from './script-writing.component';

describe('ScriptWritingComponent', () => {
  let component: ScriptWritingComponent;
  let fixture: ComponentFixture<ScriptWritingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScriptWritingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScriptWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
