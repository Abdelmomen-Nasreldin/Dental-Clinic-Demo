import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitsDetailsComponent } from './visits-details.component';

describe('VisitsDetailsComponent', () => {
  let component: VisitsDetailsComponent;
  let fixture: ComponentFixture<VisitsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
