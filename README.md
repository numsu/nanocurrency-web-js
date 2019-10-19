# nanocurrency-web

[![Build Status](https://travis-ci.org/numsu/nanocurrency-web-js.svg?branch=master)](https://travis-ci.org/numsu/nanocurrency-web-js)
[![npm version](https://badge.fury.io/js/nanocurrency-web.svg)](https://badge.fury.io/js/nanocurrency-web)
[![GitHub license](https://img.shields.io/github/license/numsu/nanocurrency-web-js)](https://github.com/numsu/nanocurrency-web-js/blob/master/LICENSE)

Toolkit for Nano cryptocurrency client side offline implementations allowing you to build web- and mobile applications using Nano without compromising the user's keys by sending them out of their own device.

The toolkit supports creating and importing wallets and signing blocks on-device. Meaning that the user's keys should never be required to leave the device.

## Features

* Generate wallets with a BIP32 mnemonic phrase
* BIP39/44 private key derivation
* Mnemonic is compatible with the Ledger Nano implementation
* Import wallets with a mnemonic phrase or a seed
* Sign send, receive and change representative blocks with a private key
* Runs in all web browsers and mobile frameworks built with Javascript
* Convert Nano units

---

## Usage

### From NPM

```console
npm install nanocurrency-web
```

| WARNING: do not use any of the keys or addresses listed below to send real assets! |
| --- |

#### Wallet handling

```javascript
import { wallet } from 'nanocurrency-web'

// Generates a new wallet with a mnemonic phrase, seed and an account
// You can also generate your own entropy for the mnemonic or set a seed password
// Notice, that losing the password will make the mnemonic phrase void
const wallet = wallet.generate(entropy?, password?)

// Import a wallet with the mnemonic phrase
const wallet = wallet.fromMnemonic(mnemonic, seedPassword?)

// Import a wallet with a seed
const wallet = wallet.fromSeed(seed)

// Derive private keys for a seed, from and to are number indexes
const accounts = wallet.accounts(seed, from, to)
```

```javascript
// The returned wallet JSON format is as follows:
{
    mnemonic: 'edge defense waste choose enrich upon flee junk siren film clown finish luggage leader kid quick brick print evidence swap drill paddle truly occur',
     seed: '0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310c',
    accounts: [
        {
            accountIndex: 0,
            privateKey: '3be4fc2ef3f3b7374e6fc4fb6e7bb153f8a2998b3b3dab50853eabe128024143',
            publicKey: '5b65b0e8173ee0802c2c3e6c9080d1a16b06de1176c938a924f58670904e82c4',
            address: 'nano_1pu7p5n3ghq1i1p4rhmek41f5add1uh34xpb94nkbxe8g4a6x1p69emk8y1d'
        }
    ]
}
```

#### Signing a receive block

```javascript
import { block } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3';
const data = {
    // Your current balance in RAW
    walletBalanceRaw: '18618869000000000000000000000000',

    // Your address
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',

    // From wallet info
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',

    // From wallet info
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',

    // From the pending transaction
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',

    // From the pending transaction in RAW
    amountRaw: '7000000000000000000000000000000',

    // Generate the work server-side or with a DPOW service
    work: 'c5cf86de24b24419',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signedBlock = block.receive(data, privateKey)
```

#### Signing a send block

```javascript
import { block } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3';
const data = {
    // Current balance from wallet info
    walletBalanceRaw: '5618869000000000000000000000000',

    // Your wallet address
    fromAddress: 'nano_1e5aqegc1jb7qe964u4adzmcezyo6o146zb8hm6dft8tkp79za3sxwjym5rx',

    // The address to send to
    toAddress: 'nano_1q3hqecaw15cjt7thbtxu3pbzr1eihtzzpzxguoc37bj1wc5ffoh7w74gi6p',

    // From wallet info
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',

    // Previous block, from wallet info
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',

    // The amount to send in RAW
    amountRaw: '2000000000000000000000000000000',

    // Generate work on server-side or with a DPOW service
    work: 'fbffed7c73b61367',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signedBlock = block.send(data, privateKey)
```

#### Signing a change representative block

```javascript
import { block } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3';
const data = {
    // Your current balance, from account info
    walletBalanceRaw: '3000000000000000000000000000000',

    // Your wallet address
    address: 'nano_3igf8hd4sjshoibbbkeitmgkp1o6ug4xads43j6e4gqkj5xk5o83j8ja9php',

    // The new representative
    representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs',

    // Previous block, from account info
    frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',

    // Generate work on the server side or with a DPOW service
    work: '0000000000000000',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signedBlock = block.representative(data, privateKey)
```

#### Converting units

Supported unit values are RAW, NANO, MRAI, KRAI, RAW.

```javascript
import { converter } from 'nanocurrency-web'

// Convert 1 Nano to RAW
const converted = converter.convert('1', 'NANO', 'RAW')

// Convert 1 RAW to Nano
const converted = converter.convert('1000000000000000000000000000000', 'RAW', 'NANO')
```

### In web

```html
<script src="https://unpkg.com/nanocurrency-web@1.0.6" type="text/javascript"></script>
<script type="text/javascript">
    NanocurrencyWeb.wallet.generate(...);
</script>
```

---

## Contributions

You are welcome to contribute to the module. To develop, use the following commands.

* `npm install` to install all the dependencies
* `npm run build` to build the Typescript code
* `npm run test` to run the tests

## Donations

If this helped you in your endeavours and you feel like supporting the developer, feel free to donate some Nano:

`nano_1wmcgzbqgbyyawsto6t37sc6y7pkekpctzp7n3ay6pcxcy717p5g79rpfj7e`
