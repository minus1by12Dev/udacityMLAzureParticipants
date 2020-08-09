import { BrowserModule } from '@angular/platform-browser';
import { ChloropethChartComponent } from './components/chloropeth-chart/chloropeth-chart.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HistogramComponent } from './components/histogram/histogram.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ChloropethChartComponent,
    HistogramComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [DashboardComponent]
})
export class AppModule { }
