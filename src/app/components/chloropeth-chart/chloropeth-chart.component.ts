import * as d3 from 'd3';
import * as topojson from 'topojson-client';

import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';

import { DataService } from 'src/app/services/data.service';
import { ICountryCount } from 'src/app/models/ICountryCount';
import { scaleLinear } from 'd3';

@Component({
  selector: 'pd-chloropeth-chart',
  templateUrl: './chloropeth-chart.component.html',
  styleUrls: ['./chloropeth-chart.component.scss']
})
export class ChloropethChartComponent implements OnInit, AfterViewInit {

  @Input() consumptionData: Array<ICountryCount>;

  chartHeight = 500;
  margin = { top: 8, right: 32, bottom: 24, left: 32 };
  barWidth = 24;

  hostElement; // Native element hosting the SVG container
  svg; // Top level SVG element
  gSvg; // SVG Group element

  chartWidth: number;

  projection;
  path;

  toolTip;

  geoJsonInfo;

  colors = ['#fff', '#ffecb3', '#ffe082', '#ffca28', '#ffb300', '#ff8f00'].reverse();


  countryCountMap: Map<string, number> = new Map();

  constructor(private elRef: ElementRef, private dataService: DataService) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.createChart();
  }


  private computeChartWidth() {
    this.chartWidth = 1600 + this.margin.left + this.margin.right;
  }


  private setChartDimensions() {
    this.svg = d3.select(this.hostElement).select('.content').append('svg')
        .attr('class', 'chloro')
        .attr('width', this.chartWidth)
        .attr('height', this.chartHeight + this.margin.bottom);
  }

  private addGraphicsElement() {
    this.gSvg = this.svg.append('g').attr('transform', 'translate(200, 80)');
  }


  private setToolTip() {
    this.toolTip = d3.select(this.hostElement)
      .append('div')
      .style('visibility', 'hidden')
      .style('position', 'absolute')
      .attr('class', 'chloroToolTip');
  }


  private drawMap() {

    const self = this;

    this.gSvg.selectAll('path')
      .data(this.geoJsonInfo.features)
      // .data(topojson.object(this.topology, this.topology.objects.countries)
      //     .geometries)
      // .data(topojson.feature(this.topology))
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('fill', d => {
        console.log(d.properties.count);
        return d.properties.count > 500 ? this.colors[0] :
        d.properties.count > 100 ? this.colors[1] :
        d.properties.count > 50 ? this.colors[2] :
        d.properties.count > 20 ? this.colors[3] :
        d.properties.count > 0 ? this.colors[4] : this.colors[5];
      })
      .attr('stroke', '#cacaca')
      .attr('stroke-width', 1)
      .on('mouseover', function(d, i) { self.mouseover(d, i, this); })
      .on('mousemove', function(d, i) { self.mousemove(d, this); })
    . on('mouseleave', function(d, i) { self.mouseleave(d, this); })
  }


  private createLegend() {

    const keys = ['20', '50', '100', '500'];

    const width = 48;

    const keyG = this.svg.append('g')
      .attr('class', 'key')
      .attr('transform', 'translate(0, 30)');


    const legendColors = this.colors.reverse().slice(1);


    keyG.selectAll('rect')
      .data(legendColors.splice(0))
      .enter()
      .append('rect')
      .attr('height', 12)
      .attr('width', width)
      .attr('x', (_, i) => i * width)
      .attr('fill', d =>  d);


    keyG.selectAll('line')
      .data(keys)
      .enter()
      .append('line')
      .attr('x1', (_, i) => width + i * width)
      .attr('x2', (_, i) => width + i * width)
      .attr('y2', 12)
      .attr('stroke', '#666');


    keyG.selectAll('text')
      .data(keys)
      .enter()
      .append('text')
      .attr('x', (_, i) => width + i * width - 12)
      .attr('y', 28)
      // .attr('stroke', '#777')
      .attr('class', 'chloroLegendText')
      .text(d => '> ' + d);


    keyG.append('text')
      .attr('class', 'chloroCaption')
      .attr('x', 0)
      .attr('y', -10)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .attr('font-size', '12')
      .attr('font-style', 'italic')
      .text('Participant Count');

  }

  createChart() {
    if (this.consumptionData && this.consumptionData.length > 0) {

      this.consumptionData.forEach(row => {
        const name =  row.countryName.split(',')[0];
        this.countryCountMap[name] = row.count;
      });

      this.removeExistingChartFromParent();

      this.projection = d3.geoEquirectangular();
      this.projection
        .scale(172);

      this.path = d3.geoPath(this.projection);

      this.computeChartWidth();

      this.setChartDimensions();
      this.addGraphicsElement();

      this.setToolTip();

      this.dataService.getGeoJson().subscribe(countriesData => {

        countriesData.features.forEach((feature, countryIndex) => {
          const properties = feature.properties;

          const count = this.countryCountMap[properties.name] ? this.countryCountMap[properties.name] :
            this.countryCountMap[properties.name_long] ? this.countryCountMap[properties.name_long] :
            this.countryCountMap[properties.formal_en] ? this.countryCountMap[properties.formal_en] :
            this.countryCountMap[properties.name_sort] ? this.countryCountMap[properties.name_sort] : 0;

          feature.properties.count = count;
        });

        this.geoJsonInfo = countriesData;

        this.drawMap();
        this.createLegend();
      });
    }
  }

  private removeExistingChartFromParent() {
    d3.select(this.hostElement).select('svg').remove();
  }


  private mouseover(d, i, self) {
    let htmlContent = `<div class="countryToolTip">`;
    htmlContent += `<div> Country : <b>${d.properties.name_long}</b> </div><div> Participant Count : <b>${d.properties.count}</b> </div>`;
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
