export interface IMarketOptions {
  id: number,
  base: {
      ticker: string,
      decimal: number,
      address: string,
  },
  quote: {
    ticker: string,
    decimal: number,
    address: string,
  },
  fee: number
}

export interface IMarketData {
  ask_orders: {
    price: string,
    quantity: string
  }[],
  bid_orders: {
    price: string,
    quantity: string
  }[]
}

export interface IFormattedMarketData {
  ask_orders: {
    price: string,
    quantity: string
  }[],
  bid_orders: {
    price: string,
    quantity: string
  }[]
}