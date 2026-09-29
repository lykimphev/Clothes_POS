export interface Currency {
  id: number;
  currencycode: string;
  namecurrency: string;
  status?: boolean;
}

export interface Exchange {
  id: number;
  rate: number;
  date?: string;
  from_currency_id: number;
  to_currency_id: number;
  status?: boolean;

  fromCurrency?: Currency;
  toCurrency?: Currency;
}
