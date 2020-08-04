import { BrowserModule } from '@angular/platform-browser';
import { ChloropethChartComponent } from './components/chloropeth-chart/chloropeth-chart.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    DashboardComponent,
    ChloropethChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [DashboardComponent]
})
export class AppModule { }
