import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChloropethChartComponent } from './chloropeth-chart.component';

describe('ChloropethChartComponent', () => {
  let component: ChloropethChartComponent;
  let fixture: ComponentFixture<ChloropethChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChloropethChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChloropethChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
