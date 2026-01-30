import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxDecimalPlaces(maxDecimals: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString();
    const decimalPart = value.split('.')[1];

    if (decimalPart && decimalPart.length > maxDecimals) {
      return { maxDecimalPlaces: { max: maxDecimals, actual: decimalPart.length } };
    }

    return null;
  };
}

export function notFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      return { futureDate: true };
    }

    return null;
  };
}

export function amountRange(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = parseFloat(control.value);

    if (value < min) {
      return { minAmount: { min, actual: value } };
    }

    if (value > max) {
      return { maxAmount: { max, actual: value } };
    }

    return null;
  };
}

export function merchantLength(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const length = control.value.trim().length;

    if (length < min) {
      return { minLength: { min, actual: length } };
    }

    if (length > max) {
      return { maxLength: { max, actual: length } };
    }

    return null;
  };
}

export function balanceValidator(currentBalance: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent;
    if (!formGroup) {
      return null;
    }

    const type = formGroup.get('type')?.value;
    const amount = formGroup.get('amount')?.value;

    if (type === 'Debit' && amount > currentBalance) {
      return { insufficientBalance: { balance: currentBalance, amount } };
    }

    return null;
  };
}
