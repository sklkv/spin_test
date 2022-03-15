import * as nearAPI from 'near-api-js';
import { IMarketOptions, IMarketData, IFormattedMarketData } from './types';
import { exponentialToDecimal } from './utils'

let near: nearAPI.Near;
let wallet: nearAPI.WalletConnection;
let accountId: string;
let account: nearAPI.Account;

const nearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  headers: {
    "Content-Type": "application/json"
  }
};

const initWallet = async (): Promise<void> => {
  near = await nearAPI.connect(
    Object.assign({
      deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() } 
    }, nearConfig));
  wallet = new nearAPI.WalletConnection(near, null);
  accountId = wallet.getAccountId();
  account = wallet.account();
}

const mainFunc = async (): Promise<void> => {
  if (!wallet.isSignedIn()) {
    signedOutFlow();
  } else {
    signedInFlow();
  }
}

const signedOutFlow = (): void => {
  const signInButton = document.querySelector<HTMLElement>('.sign-in-button');
  signInButton!.style.display = '';
  signInButton!.addEventListener('click', async () => {
    wallet.requestSignIn();
  });
}

const signedInFlow = async (): Promise<void> => {
  const { available } = await account.getAccountBalance();
  const totalNearTokens = nearAPI.utils.format.formatNearAmount(available);
  document.querySelector<HTMLElement>('.signed-in-block')!.style.display = '';
  document.querySelector<HTMLElement>('.account-id')!.innerText = accountId;
  document.querySelector<HTMLElement>('.account-balance')!.innerText = totalNearTokens;
  document.querySelector<HTMLElement>('.sign-out-button')!.addEventListener('click', async (e: Event) => {
    e.preventDefault();
    await wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  });

  const markets = await getMarketOptions();
  const selectOptions = markets.map((item) => ({
    label: `${item.base.ticker}/${item.quote.ticker}`,
    value: item.id
  }));

  const select = document.querySelector<HTMLSelectElement>('.markets-select');

  for (let i = 0; i <= selectOptions.length - 1; i++) {
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = selectOptions[i].value.toString();
    option.label = selectOptions[i].label;
    select?.appendChild(option);
  }

  let marketData = await getMarketData(Number(select?.value));

  let formattedMarketData = formatMarketData(marketData);
  generateTable(formattedMarketData);

  select?.addEventListener('change', async (e: Event) => {
    const { value } = e.target as HTMLSelectElement;
    marketData = await getMarketData(Number(value));
    formattedMarketData = formatMarketData(marketData);
    document.querySelector('.table')?.remove();
    generateTable(formattedMarketData);
  })

}

const generateTable = (data: IFormattedMarketData): void => {
  const parent = document.querySelector('.part-2');
  const table = document.createElement('div') as HTMLDivElement;
  table.className = 'table';
  const { ask_orders, bid_orders } = data;
  table.innerHTML = `
    <div style="display: flex; flex-direction: column">
      <div style="display: flex; flex-direction: row; justify-content: space-between; width: 500px">
        <p>price</p>
        <p>quantity</p>
      </div>
      ${ask_orders.map((item) => `
        <div style="display: flex; flex-direction: row; justify-content: space-between; width: 500px">
          <p>${item.price}</p>
          <p>${item.quantity}</p>
        </div>
      `)}
      ${bid_orders.map((item) => `
        <div style="display: flex; flex-direction: row; justify-content: space-between; width: 500px">
          <p>${item.price}</p>
          <p>${item.quantity}</p>
        </div>
      `)}
    </div
  `;
  parent?.appendChild(table);
}

const getMarketOptions = async (): Promise<IMarketOptions[]> => 
  await account.viewFunction("app_2.spin_swap.testnet", "markets", {});

const getMarketData = async (marketId: number): Promise<IMarketData> =>
  await account.viewFunction(
    "app_2.spin_swap.testnet", "view_market",
    { market_id: marketId }
  );

const formatMarketData = (data: IMarketData): IFormattedMarketData => {
  const { ask_orders, bid_orders } = data;
  const formattedAsk = ask_orders.map((item) => ({
    price: exponentialToDecimal(item.price),
    quantity: exponentialToDecimal(item.quantity),
  }))
  const formattedBid = bid_orders.map((item) => ({
    price: exponentialToDecimal(item.price),
    quantity: exponentialToDecimal(item.quantity),
  }))
  return {
    ask_orders: formattedAsk,
    bid_orders: formattedBid
  }
}

initWallet()
  .then(mainFunc)
  .catch(console.error);