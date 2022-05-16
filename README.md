# sensei-client-js

A javascript client for the [Sensei](https://l2.technology/sensei) HTTP API. This is designed to work in the browser and in NodeJS environments. There are typescript types available for all endpoints.

## Installation

Can be added to your project by running `npm install --save @l2-technology/sensei-client`

## Authentication

When using from the browser you can rely on `login` and `logout` to set a cookie with a `macaroon` that will automatically be passed for future requests.

When using from nodeJS you can use `setMacaroon` to explicitly set a macaroon to use for the client instance.

## Usage

Instantiate and export a client to use from a utils/integration file

```javascript
// src/utils/sensei.ts
import SenseiClient from '@l2-technology/sensei-client';

const senseiHost = 'http://localhost:3000';
const senseiClient = new SenseiClient({ basePath: senseiHost });

export default senseiClient;
```

Import your client and use it

```javascript
import senseiClient from './src/utils/sensei';

// initialize your sensei node
const { pubkey, macaroon } = await senseiClient.init({
  username: 'satoshi',
  alias: 'satoshi',
  passphrase: 'donthardcodethissomewhere',
  electrumUrl: 'ssl://blockstream.info:993',
  start: true,
});

senseiClient.setMacaroon(macaroon);

// send bitcoin to this address to fund your node
const { address } = await senseiClient.getUnusedAddress();

// create lightweight child node
const { alicePubkey, aliceMacaroon } = await senseiClient.createNode({
  username: 'alice',
  alias: 'alice',
  passphrase: 'alicespassphrase',
  start: true,
});

// search nodes for alice
const { nodes } = await senseiClient.getNodes({
  page: 0,
  searchTerm: alicePubkey,
  take: 1,
});

const aliceNodeInfo = nodes[0];
const { listenAddr, listenPort } = aliceNodeInfo;

// open a public channel with alice
await senseiClient.openChannel({
  nodeConnectionString: `${alicePubkey}@${listenAddr}:${listenPort}`,
  amtSatoshis: 25000,
  isPublic: true,
});

// have alice generate an invoice for 1000 satoshis
senseiClient.setMacaroon(aliceMacaroon);
const { invoice } = await senseiClient.createInvoice({
  amountMillisats: 1000000,
  description: 'paying for some coffee',
});

// have admin node pay the invoice
senseiClient.setMacaroon(macaroon);
await senseiClient.payInvoice(invoice);
```
