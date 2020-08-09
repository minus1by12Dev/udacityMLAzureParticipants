import { Component, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { DataService } from 'src/app/services/data.service';
import { ICountryCount } from 'src/app/models/ICountryCount';

@Component({
  selector: 'pd-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  countryCount$: Observable<ICountryCount[]>;
  errorMessage = '';

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.countryCount$ = this.dataService.countryCount$
      .pipe(
        tap(data => console.log(data)),
        catchError(err => {
          this.errorMessage = err;
          return EMPTY;
        })
      )
  }

}
