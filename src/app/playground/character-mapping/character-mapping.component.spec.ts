import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterMappingComponent } from './character-mapping.component';

describe('CharacterMappingComponent', () => {
  let component: CharacterMappingComponent;
  let fixture: ComponentFixture<CharacterMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CharacterMappingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CharacterMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
