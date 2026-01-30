import { Injectable, signal } from '@angular/core';
import { Customer } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private selectedCustomerSignal = signal<Customer | null>(null);
  readonly selectedCustomer = this.selectedCustomerSignal.asReadonly();

  private selectedAccountIdSignal = signal<string | null>(null);
  readonly selectedAccountId = this.selectedAccountIdSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  setSelectedCustomer(customer: Customer | null): void {
    this.selectedCustomerSignal.set(customer);
  }

  setSelectedAccountId(accountId: string | null): void {
    this.selectedAccountIdSignal.set(accountId);
  }

  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  clearState(): void {
    this.selectedCustomerSignal.set(null);
    this.selectedAccountIdSignal.set(null);
    this.loadingSignal.set(false);
  }
}
