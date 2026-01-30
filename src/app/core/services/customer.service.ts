import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Customer } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly DATA_URL = '/assets/mock/customers.json';
  private cache$?: Observable<Customer[]>;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Customer[]>(this.DATA_URL).pipe(
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  getCustomerByCIF(cif: string): Observable<Customer | undefined> {
    return new Observable((observer) => {
      this.getCustomers().subscribe({
        next: (customers) => {
          const customer = customers.find((c) => c.CIF === cif);
          observer.next(customer);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  clearCache(): void {
    this.cache$ = undefined;
  }
}
