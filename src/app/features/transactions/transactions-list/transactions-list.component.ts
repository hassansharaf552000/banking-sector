import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Transaction, Account, TransactionType } from '../../../core/models';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import {
  maxDecimalPlaces,
  notFutureDate,
  amountRange,
  merchantLength,
  balanceValidator,
} from '../../../shared/validators/custom-validators';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    Select,
    DatePicker,
    TagModule,
    ToastModule,
    NavbarComponent,
  ],
  providers: [MessageService],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss',
})
export class TransactionsListComponent implements OnInit {
  transactions = signal<Transaction[]>([]);
  filteredTransactions = signal<Transaction[]>([]);
  account = signal<Account | null>(null);
  loading = signal(true);
  showDialog = signal(false);
  showMiniStatement = signal(false);

  transactionTypes = signal<TransactionType[]>([]);
  categories = signal<string[]>([]);

  transactionForm!: FormGroup;
  filterForm!: FormGroup;

  miniStatementCount = 5;
  miniStatementTransactions = computed(() => {
    return this.filteredTransactions().slice(0, this.miniStatementCount);
  });

  currentSort = 'date-desc';
  currentDate = new Date();

  monthlyInsights = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTxns = this.transactions().filter((t) => {
      const txnDate = new Date(t.date);
      return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
    });

    const totalDebit = monthlyTxns
      .filter((t) => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredit = monthlyTxns
      .filter((t) => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = new Map<string, number>();
    monthlyTxns
      .filter((t) => t.type === 'Debit')
      .forEach((t) => {
        const current = categoryTotals.get(t.category) || 0;
        categoryTotals.set(t.category, current + t.amount);
      });

    let highestCategory = '';
    let highestAmount = 0;
    categoryTotals.forEach((amount, category) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestCategory = category;
      }
    });

    return {
      totalDebit,
      totalCredit,
      highestCategory,
      highestAmount,
      transactionCount: monthlyTxns.length,
    };
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('accountId');
    if (accountId) {
      this.loadData(accountId);
    }
  }

  initializeForms(): void {
    this.filterForm = this.fb.group({
      dateFrom: [null],
      dateTo: [null],
      type: [null],
      category: [null],
    });

    this.transactionForm = this.fb.group({
      type: ['Debit', Validators.required],
      amount: [
        null,
        [
          Validators.required,
          amountRange(0.01, 100000),
          maxDecimalPlaces(2),
        ],
      ],
      date: [new Date(), [Validators.required, notFutureDate()]],
      merchant: ['', [Validators.required, merchantLength(3, 50)]],
      category: ['', Validators.required],
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadData(accountId: string): void {
    this.loading.set(true);

    this.accountService.getAccountById(accountId).subscribe({
      next: (account) => {
        if (account) {
          this.account.set(account);
          this.updateBalanceValidator();
          this.loadTransactions(accountId);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading account:', error);
        this.loading.set(false);
      },
    });

    this.transactionService.getTransactionTypes().subscribe({
      next: (types) => this.transactionTypes.set(types),
    });

    this.transactionService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadTransactions(accountId: string): void {
    this.transactionService.getTransactionsByAccountId(accountId).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.filteredTransactions.set(transactions);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading.set(false);
      },
    });
  }

  updateBalanceValidator(): void {
    const balance = this.account()?.balance || 0;
    const amountControl = this.transactionForm.get('amount');
    amountControl?.addValidators(balanceValidator(balance));
    amountControl?.updateValueAndValidity();
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.transactions()];

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((t) => new Date(t.date) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= toDate);
    }

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    this.filteredTransactions.set(filtered);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filteredTransactions.set(this.transactions());
  }

  openNewTransactionDialog(): void {
    this.transactionForm.reset({
      type: 'Debit',
      date: new Date(),
    });
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
  }

  onSubmitTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formValue = this.transactionForm.value;
    const result = this.transactionService.createTransaction({
      accountId: this.account()!.id,
      type: formValue.type,
      amount: formValue.amount,
      date: this.formatDate(formValue.date),
      merchant: formValue.merchant.trim(),
      category: formValue.category,
    });

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: result.message,
      });

      this.loadTransactions(this.account()!.id);
      this.accountService.getAccountById(this.account()!.id).subscribe({
        next: (account) => {
          if (account) {
            this.account.set(account);
            this.updateBalanceValidator();
          }
        },
      });

      this.closeDialog();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
      });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  exportToCSV(): void {
    this.transactionService.downloadCSV(
      this.filteredTransactions(),
      `transactions_${this.account()?.id}_${Date.now()}.csv`
    );
    this.messageService.add({
      severity: 'success',
      summary: 'Export Successful',
      detail: 'Transactions exported to CSV',
    });
  }

  sortByDate(order: 'asc' | 'desc'): void {
    const sorted = [...this.filteredTransactions()].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    this.filteredTransactions.set(sorted);
    this.currentSort = `date-${order}`;
  }

  sortByAmount(order: 'asc' | 'desc'): void {
    const sorted = [...this.filteredTransactions()].sort((a, b) => {
      return order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    });
    this.filteredTransactions.set(sorted);
    this.currentSort = `amount-${order}`;
  }

  getTransactionTypeSeverity(type: string): 'success' | 'danger' {
    return type === 'Credit' ? 'success' : 'danger';
  }

  goBack(): void {
    const cif = this.route.snapshot.paramMap.get('cif');
    this.router.navigate(['/customer', cif]);
  }

  get typeControl() {
    return this.transactionForm.get('type');
  }
  get amountControl() {
    return this.transactionForm.get('amount');
  }
  get dateControl() {
    return this.transactionForm.get('date');
  }
  get merchantControl() {
    return this.transactionForm.get('merchant');
  }
  get categoryControl() {
    return this.transactionForm.get('category');
  }
}
