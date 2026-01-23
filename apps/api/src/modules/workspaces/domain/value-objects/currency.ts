import { z } from "zod";

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "MXN",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
  "BRL",
  "ARS",
  "CLP",
  "COP",
  "PEN",
] as const;

const schema = z.enum(CURRENCIES, {
  message: "Invalid currency code",
});

export type CurrencyCode = (typeof CURRENCIES)[number];

export class Currency {
  readonly value: CurrencyCode;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  static default(): Currency {
    return new Currency("USD");
  }
}
