export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  type: 'Debit' | 'Credit';
  amount: number;
  merchant: string;
  category: string;
}

export interface TransactionType {
  code: string;
  label: string;
}

export interface CreateTransactionDto {
  accountId: string;
  type: 'Debit' | 'Credit';
  amount: number;
  date: string;
  merchant: string;
  category: string;
}
