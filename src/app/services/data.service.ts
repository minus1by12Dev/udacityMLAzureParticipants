import * as XLSX from 'xlsx';

import { HttpClient } from '@angular/common/http';
import { ICountryCount } from '../models/ICountryCount';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  countryCount: Array<ICountryCount> = [];

  constructor(private httpClient: HttpClient) { }

  countryCount$ = this.httpClient.get(environment.country_count_file_path, {responseType: 'arraybuffer'})
  .pipe(
    map(data => {

        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {raw: true});

        jsonData.map(row => {
          const countryCountRow: ICountryCount = {
            id: row['id'],
            countryName: row['country_name'],
            count: row['count']
          };
          this.countryCount.push(countryCountRow);
        });

        this.countryCount = this.countryCount.sort((d1, d2) => d2.count - d1.count);
        return this.countryCount;
    })
  );


  getGeoJson(): Observable<any>{
    return this.httpClient.get(environment.geo_json_path);
  }


  // getGeoJson(): Observable<any>{
  //   return this.httpClient.get('https://vega.github.io/vega-datasets/data/world-110m.json');
  // }


}
