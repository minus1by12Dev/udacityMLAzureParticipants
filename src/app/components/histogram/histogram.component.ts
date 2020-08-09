import * as d3 from 'd3';

import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';

import { ICountryCount } from 'src/app/models/ICountryCount';

@Component({
  selector: 'pd-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit, AfterViewInit {

  @Input() consumptionData: Array<ICountryCount>;

  chartHeight = 500;
  margin = { top: 8, right: 32, bottom: 108, left: 32 };
  barWidth = 24;

  hostElement; // Native element hosting the SVG container
  svg; // Top level SVG element
  gSvg; // SVG Group element

  chartWidth: number;

  xScale;
  xAxes;
  yScale;

  toolTip;

  dataColumns: string[];
  dataSumArray;

  participantsTotal = 0;
  countries = 0;

  color = ['#1AAE9F', '#EF9453', '#F7C325', '#E95E6F'];
  keys = ['> 100', '50 - 100', '20 - 50', ' < 20'];

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.createChart();
  }

  computeChartWidth() {
    this.chartWidth = (this.consumptionData.length * this.barWidth) + this.margin.left + this.margin.right + 80;
  }


  private setXScale() {
    this.xScale = d3.scaleBand()
        .domain(d3.range(this.consumptionData.length).map(String))
        .range([this.margin.left, this.chartWidth - this.margin.right]);
  }

  private setXAxes() {
    this.xAxes = d3.scaleBand()
        .domain(this.consumptionData.map(d => d.countryName.split(',')[0]))
        .range([this.margin.left, this.chartWidth - this.margin.right]);
  }



  private setYScale() {
    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.consumptionData, d => d.count)])
      .range([this.chartHeight, this.margin.top]);
  }



  private setChartDimensions() {
    this.svg = d3.select(this.hostElement).select('.content').append('svg')
        .attr('class', 'histo')
        .attr('width', this.chartWidth)
        .attr('height', this.chartHeight + this.margin.bottom);
  }

  private addGraphicsElement() {
    this.gSvg = this.svg.append('g').attr('transform', 'translate(' + this.margin.left / 2 + ',' + -this.margin.top + ')');
    // this.gSvg = this.svg.append('g').attr('transform', 'translate(' + this.margin.left / 2 + ',' + 0 + ')');
  }


  private setToolTip() {
    this.toolTip = d3.select(this.hostElement)
      .append('div')
      .style('visibility', 'hidden')
      .style('position', 'absolute')
      .attr('class', 'histoToolTip');
  }


  private plotData() {

    const self = this;

    this.gSvg.append('g')
    .selectAll('rect')
    .data(this.consumptionData)
    .join('rect')
    .attr('x', (_, i) => this.xScale(i))
    .attr('width', this.barWidth)
    .attr('y', d => this.yScale(d.count))
    .attr('height', d => this.chartHeight - this.yScale(d.count))
    .on('mouseover', function(d, i) { self.mouseover(d, i, this); })
    .on('mousemove', function(d, i) { self.mousemove(d, this); })
    .on('mouseleave', function(d, i) { self.mouseleave(d, this); })
    .attr('fill', d => d.count >= 100 ? this.color[0] : d.count >= 50 ? this.color[1] : d.count >= 20 ? this.color[2] : this.color[3]);
  }


  private plotXAxes() {
    this.svg.append('g')
        .attr('class', 'histoXAxisGroup')
        .attr('transform', `translate( ${this.margin.left + this.barWidth / 8}, ${this.chartHeight - this.margin.top / 2})`)
        .attr('text-anchor', 'start')
        // .attr("transform", `translate(${(margin.left / 2)}, ${chartHeight - margin.bottom})`)
        .call(d3
            .axisBottom(this.xAxes)
            // .ticks(5)
            .tickSize(14));


    const ticks = d3.selectAll('.histoXAxisGroup .tick text');
    ticks.attr('transform', 'rotate(72)');
  }



  private plotYAxes() {
      this.svg.append('g')
          .attr('class', 'histoYAxisGroup')
          .attr('transform', `translate( ${this.margin.left + this.margin.left / 2}, 0)`)
          .call(d3.axisLeft(this.yScale)
              .ticks(10)
              .tickSize(12));


      const ticks = d3.selectAll('.histoYAxisGroup .tick');
      ticks.each(function(d: any) {
          if (d === 0) {
              d3.select(this).remove();
          }
      });
  }


  private createLegend() {

    const moveLeft = 320;
    const dotSize = 20;

    const legendColor = d3.scaleOrdinal()
      .domain(this.keys)
      .range(this.color);

    this.svg.append('text')
      .attr('x', this.chartWidth - moveLeft)
      .attr('y', 60 )
      .style('fill', '#444')
      .text(d => 'Participants By Country')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold');


    this.svg.selectAll('dots')
      .data(this.keys)
      .enter()
      .append('rect')
        .attr('x', this.chartWidth - moveLeft)
        .attr('y', (d, i) => 80 + i * (dotSize + 5 ))
        .attr('width', dotSize)
        .attr('height', dotSize)
        .style('fill', d => legendColor(d));


    this.svg.selectAll('labels')
      .data(this.keys)
      .enter()
      .append('text')
        .attr('x', this.chartWidth - moveLeft + dotSize * 1.5)
        .attr('y', (d, i) => 80 + i * ( dotSize + 5 ) + (dotSize / 2))
        .style('fill', d => legendColor(d))
        .text(d => d)
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')
        .attr('font-size', '13px');
  }


  createChart() {
    if (this.consumptionData && this.consumptionData.length > 0) {

      this.removeExistingChartFromParent();

      this.computeChartWidth();
      this.setXScale();
      this.setXAxes();

      this.setYScale();

      this.setChartDimensions();
      this.addGraphicsElement();

      this.setToolTip();

      this.plotData();

      this.plotXAxes();
      this.plotYAxes();

      this.createLegend();

      setTimeout(() => {
        this.consumptionData.map(row => {
          this.participantsTotal += row.count;
          this.countries += 1;
        });
      });

    }
  }

  private removeExistingChartFromParent() {
    d3.select(this.hostElement).select('svg').remove();
  }

  private mouseover(d, i, self) {
    let htmlContent = `<div class="countryToolTip">`;
    htmlContent += `<div> Country : <b>${d.countryName}</b> </div><div> Participant Count : <b>${d.count}</b> </div>`;
    htmlContent += '</div>';

    d3.select(self)
      .attr('stroke-width', '1')
      .attr('stroke', '#444');

    this.toolTip
      .style('visibility', 'visible')
      .html(htmlContent);
  }

  private mousemove(d, self) {
    this.toolTip
      .style('top', d3.event.pageY - 10 + 'px')
      .style('left', d3.event.pageX + 10 + 'px');
  }

  private mouseleave(d, self) {
    d3.select(self).attr('stroke-width', '0');

    this.toolTip
        .style('visibility', 'hidden');
  }

}
