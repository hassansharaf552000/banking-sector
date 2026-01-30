import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';
import { Transaction, CreateTransactionDto, TransactionType } from '../models';
import { SecureStorage } from '../utils/secure-storage.util';
import { AccountService } from './account.service';

const TRANSACTIONS_STORAGE_KEY = 'transactions_data';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly DATA_URL = '/assets/mock/transactions.json';
  private readonly TYPES_URL = '/assets/mock/transaction-types.json';
  private readonly CATEGORIES_URL = '/assets/mock/transaction-categories.json';

  private cache$?: Observable<Transaction[]>;
  private typesCache$?: Observable<TransactionType[]>;
  private categoriesCache$?: Observable<string[]>;

  private transactionsSignal = signal<Transaction[]>([]);

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.loadTransactionsFromStorage();
  }

  private loadTransactionsFromStorage(): void {
    const stored = SecureStorage.getItem<Transaction[]>(TRANSACTIONS_STORAGE_KEY);
    if (stored) {
      this.transactionsSignal.set(stored);
    }
  }

  getTransactions(): Observable<Transaction[]> {
    if (this.transactionsSignal().length > 0) {
      return new Observable((observer) => {
        observer.next(this.transactionsSignal());
        observer.complete();
      });
    }

    if (!this.cache$) {
      this.cache$ = this.http.get<Transaction[]>(this.DATA_URL).pipe(
        map((transactions) => {
          this.transactionsSignal.set(transactions);
          SecureStorage.setItem(TRANSACTIONS_STORAGE_KEY, transactions);
          return transactions;
        }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  getTransactionsByAccountId(accountId: string): Observable<Transaction[]> {
    return this.getTransactions().pipe(
      map((transactions) =>
        transactions
          .filter((t) => t.accountId === accountId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
    );
  }


  getTransactionTypes(): Observable<TransactionType[]> {
    if (!this.typesCache$) {
      this.typesCache$ = this.http
        .get<TransactionType[]>(this.TYPES_URL)
        .pipe(shareReplay(1));
    }
    return this.typesCache$;
  }

  getCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http
        .get<string[]>(this.CATEGORIES_URL)
        .pipe(shareReplay(1));
    }
    return this.categoriesCache$;
  }

  createTransaction(dto: CreateTransactionDto): {
    success: boolean;
    message: string;
    transaction?: Transaction;
  } {
    const currentBalance = this.accountService.getAccountBalance(dto.accountId);

    if (dto.type === 'Debit' && dto.amount > currentBalance) {
      return {
        success: false,
        message: 'Insufficient balance for this transaction',
      };
    }

    const newTransaction: Transaction = {
      id: this.generateTransactionId(),
      accountId: dto.accountId,
      date: dto.date,
      type: dto.type,
      amount: dto.amount,
      merchant: dto.merchant,
      category: dto.category,
    };

    const transactions = this.transactionsSignal();
    const updatedTransactions = [newTransaction, ...transactions];
    this.transactionsSignal.set(updatedTransactions);
    SecureStorage.setItem(TRANSACTIONS_STORAGE_KEY, updatedTransactions);

    const newBalance =
      dto.type === 'Debit'
        ? currentBalance - dto.amount
        : currentBalance + dto.amount;

    this.accountService.updateAccountBalance(dto.accountId, newBalance);

    return {
      success: true,
      message: 'Transaction created successfully',
      transaction: newTransaction,
    };
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `T${timestamp}${random}`;
  }

  exportToCSV(transactions: Transaction[]): string {
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Merchant', 'Category'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      t.amount.toFixed(2),
      t.merchant,
      t.category,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  downloadCSV(transactions: Transaction[], filename: string = 'transactions.csv'): void {
    const csvContent = this.exportToCSV(transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clearCache(): void {
    this.cache$ = undefined;
    this.transactionsSignal.set([]);
    SecureStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  }
}
