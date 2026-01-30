import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';
import { Account } from '../../../core/models';
import { SecureStorage } from '../../../core/utils/secure-storage.util';

const ACCOUNTS_STORAGE_KEY = 'accounts_data';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly DATA_URL = '/assets/mock/accounts.json';
  private cache$?: Observable<Account[]>;
  private accountsSignal = signal<Account[]>([]);

  constructor(private http: HttpClient) {
    this.loadAccountsFromStorage();
  }

  private loadAccountsFromStorage(): void {
    const stored = SecureStorage.getItem<Account[]>(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      this.accountsSignal.set(stored);
    }
  }

  getAccounts(): Observable<Account[]> {
    if (this.accountsSignal().length > 0) {
      return new Observable((observer) => {
        observer.next(this.accountsSignal());
        observer.complete();
      });
    }

    if (!this.cache$) {
      this.cache$ = this.http.get<Account[]>(this.DATA_URL).pipe(
        map((accounts) => {
          this.accountsSignal.set(accounts);
          SecureStorage.setItem(ACCOUNTS_STORAGE_KEY, accounts);
          return accounts;
        }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  getAccountsByCustomerId(customerId: string): Observable<Account[]> {
    return this.getAccounts().pipe(
      map((accounts) => accounts.filter((a) => a.customerId === customerId))
    );
  }

  getAccountById(accountId: string): Observable<Account | undefined> {
    return this.getAccounts().pipe(
      map((accounts) => accounts.find((a) => a.id === accountId))
    );
  }

  updateAccountBalance(accountId: string, newBalance: number): void {
    const accounts = this.accountsSignal();
    const updatedAccounts = accounts.map((account) =>
      account.id === accountId ? { ...account, balance: newBalance } : account
    );
    this.accountsSignal.set(updatedAccounts);
    SecureStorage.setItem(ACCOUNTS_STORAGE_KEY, updatedAccounts);
  }

  getAccountBalance(accountId: string): number {
    const account = this.accountsSignal().find((a) => a.id === accountId);
    return account?.balance ?? 0;
  }

  clearCache(): void {
    this.cache$ = undefined;
    this.accountsSignal.set([]);
    SecureStorage.removeItem(ACCOUNTS_STORAGE_KEY);
  }
}
