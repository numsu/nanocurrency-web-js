# nanocurrency-web

[![Build Status](https://travis-ci.org/numsu/nanocurrency-web-js.svg?branch=master)](https://travis-ci.org/numsu/nanocurrency-web-js)
[![npm version](https://badge.fury.io/js/nanocurrency-web.svg)](https://badge.fury.io/js/nanocurrency-web)
[![GitHub license](https://img.shields.io/github/license/numsu/nanocurrency-web-js)](https://github.com/numsu/nanocurrency-web-js/blob/master/LICENSE)

Toolkit for Nano cryptocurrency client side offline implementations allowing you to build web- and mobile applications using Nano without ever compromising the user's keys by sending them out of their own device.

The toolkit supports creating and importing wallets and signing blocks on-device. Meaning that the user's keys should never be required to leave the device. And much more!

## Features

* Generate new HD wallets (BIP32/44 hierarchial deterministic) with a BIP39 mnemonic phrase (Used in Ledger hardware wallet)
* Generate new "legacy" Nano wallets with mnemonic phrases (Used in the Natrium wallet)
* Import HD wallets with a mnemonic phrase or a seed
* Import "legacy" wallets with the Nano mnemonic phrase or seed
* Sign send-, receive- and change (representative) blocks with a private key
* Convert Nano units
* Verify the signature of a block
* Sign any strings with the private key
* Verify the signature of any string with the public key
* Validate addresses and mnemonic words
* Runs in all web browsers and mobile frameworks built with Javascript (doesn't require server-side NodeJS functions)

---

## Installation
### From NPM

```console
npm install nanocurrency-web
```
### In web

```html
<script src="https://unpkg.com/nanocurrency-web@1.4.3" type="text/javascript"></script>
<script type="text/javascript">
    NanocurrencyWeb.wallet.generate(...);
</script>
```

## Usage

| WARNING: do not use any of the keys or addresses listed below to send real assets! |
| --- |

### Wallets and accounts
The wallet is a hexadecimal string called a seed. From this seed you can deterministically derive millions of unique accounts. The first account in a wallet starts at index 0.

The library is able to generate, import and derive accounts for HD wallets and "legacy" Nano wallets. A HD wallet seed length is 128 hexadecimal characters while a "legacy" Nano wallet seed is 64 characters long.

These are the two most common used wallets in different applications. A best bet would be to support both of them. For example, when an user wants to import a wallet, you could always generate both wallets and check if either wallet's account at index 0 has a frontier using [the accounts_frontiers RPC](https://docs.nano.org/commands/rpc-protocol/#accounts_frontiers) command.

```javascript
import { wallet } from 'nanocurrency-web'

// Generates a new wallet with a mnemonic phrase, seed and an account
// You can also generate your own entropy for the mnemonic or set a seed password
// Notice, that losing the password will make the mnemonic phrase void
const wallet = wallet.generate(entropy?, password?)

// Generates a legacy wallet with a mnemonic phrase, seed and an account
// You can provide your own seed to be used instead
const wallet = wallet.generateLegacy(seed?)

// Import a wallet with the mnemonic phrase
const wallet = wallet.fromMnemonic(mnemonic, seedPassword?)

// Import a wallet with the legacy mnemonic phrase
const wallet = wallet.fromLegacyMnemonic(mnemonic)

// Import a wallet with a seed, the mnemonic phrase will be undefined since it's not possible to infer it from the seed
const wallet = wallet.fromSeed(seed)

// Import a wallet with a legacy seed
const wallet = wallet.fromLegacySeed(seed)

// Derive private keys for a seed, from and to are number indexes. The first account index is 0.
const accounts = wallet.accounts(seed, from, to)

// Derive private keys for a legacy seed, from and to are number indexes. The first account index is 0.
const accounts = wallet.legacyAccounts(seed, from, to)
```

```javascript
// The returned wallet JSON format is as follows. The mnemonic phrase will be undefined when importing with a seed, unless it's imported with a legacy seed
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

### Blocks
There are three different types of blocks; send, receive and change. While all of these are called "state" blocks, they are interpreted differently based on the data they contain.

A send block means that the amount of Nano decreases in the account while a receive block means that the amount increases. If the amount stays the same, it's interpreted as a change (representative) block. You are able to change the representative also at the same time when sending or receiving. All blocks are signed with the account's private key.

The functions are designed to have user friendly usage, but they will return the block exactly the way as the network accepts them. All that is left is to publish the block to the network with the [process RPC command](https://docs.nano.org/commands/rpc-protocol/#process).

Always fetch the most up to date information for the account from the network using the [account_info RPC command](https://docs.nano.org/commands/rpc-protocol/#account_info).

If the account hasn't been opened yet (this is the first block), you will need to use the "genesis" as frontier: `0000000000000000000000000000000000000000000000000000000000000000`.

#### Signing a send block

```javascript
import { block } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3'
const data = {
    // Current balance from account info
    walletBalanceRaw: '5618869000000000000000000000000',

    // Your wallet address
    fromAddress: 'nano_1e5aqegc1jb7qe964u4adzmcezyo6o146zb8hm6dft8tkp79za3sxwjym5rx',

    // The address to send to
    toAddress: 'nano_1q3hqecaw15cjt7thbtxu3pbzr1eihtzzpzxguoc37bj1wc5ffoh7w74gi6p',

    // From account info
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',

    // Previous block, from account info
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',

    // The amount to send in RAW
    amountRaw: '2000000000000000000000000000000',

    // Generate work on server-side or with a DPOW service
    // This is optional, you don't have to generate work before signing the transaction
    work: 'fbffed7c73b61367',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signedBlock = block.send(data, privateKey)
```

#### Signing a receive block
```javascript
import { block } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3'
const data = {
    // Your current balance in RAW from account info
    walletBalanceRaw: '18618869000000000000000000000000',

    // Your address
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',

    // From account info
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',

    // From account info
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',

    // From the pending transaction
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',

    // From the pending transaction in RAW
    amountRaw: '7000000000000000000000000000000',

    // Generate the work server-side or with a DPOW service
    // This is optional, you don't have to generate work before signing the transaction
    work: 'c5cf86de24b24419',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signedBlock = block.receive(data, privateKey)
```

#### Signing a change (representative) block
```javascript
import { block } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3'
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
    // This is optional, you don't have to generate work before signing the transaction
    work: '0000000000000000',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signedBlock = block.representative(data, privateKey)
```
### Tools

#### Converting Nano units

Supported unit values are RAW, NANO, MRAI, KRAI, RAW.

```javascript
import { tools } from 'nanocurrency-web'

// Convert 1 Nano to RAW
const converted = tools.convert('1', 'NANO', 'RAW')

// Convert 1 RAW to Nano
const converted = tools.convert('1000000000000000000000000000000', 'RAW', 'NANO')
```

#### Verifying signatures and signing anything with the private key
Cryptocurrencies rely on asymmetric cryptographgy. This means that you can use the public key to validate the signature of the block that is signed with the private key.

For example implementing client side login with the password being the user's e-mail signed with their private key:

```javascript
import { tools } from 'nanocurrency-web'

const privateKey = '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3'
const signed = tools.sign(privateKey, 'foo@bar.com')

// On the backend, verify that the signed value matches the hashed signature in your database
```

You can also validate Nano blocks:
```javascript
import { tools } from 'nanocurrency-web'

const valid = tools.verifyBlock(publicKey, block)
```

You are able to challenge an user to prove ownership of a Nano address simply by making the user sign any string with the private key and then validating the signature with the public key. You are even able to derive the public key from the Nano address.
```javascript
import { tools } from 'nanocurrency-web'

const nanoAddress = 'nano_1pu7p5n3ghq1i1p4rhmek41f5add1uh34xpb94nkbxe8g4a6x1p69emk8y1d'
const privateKey = '3be4fc2ef3f3b7374e6fc4fb6e7bb153f8a2998b3b3dab50853eabe128024143'
const data = 'sign this'

// Make the user sign the data
const signature = tools.sign(privateKey, data)

// Infer the user's public key from the address (if not already known)
const publicKey = tools.addressToPublicKey(nanoAddress)

// Verify the signature using the public key, the signature and the original data
const validSignature = tools.verify(publicKey, signature, data)
```

#### Validating values
You are able to validate Nano addresses and mnemonic words.

```javascript
import { tools } from 'nanocurrency-web'

// Validate Nano address
const valid = tools.validateAddress('nano_1pu7p5n3ghq1i1p4rhmek41f5add1uh34xpb94nkbxe8g4a6x1p69emk8y1d')

// Validate mnemonic phrases
const valid = tools.validateMnemonic('edge defense waste choose enrich upon flee junk siren film clown finish luggage leader kid quick brick print evidence swap drill paddle truly occur')
```

#### Encrypting and decrypting strings
You are able to encrypt and decrypt strings to implement end-to-end encryption using the Diffie-Hellman key exchange by using the Nano address and private key. The public and private keys are converted to Curve25519 keys which are suitable for encryption within the library.

```javascript
import { box } from 'nanocurrency-web'

// Encrypt on device 1
const encrypted = box.encrypt(message, recipientAddress, senderPrivateKey)

// Send the encrypted message to the recipient and decrypt on device 2
const decrypted = box.decrypt(encrypted, senderAddress, recipientPrivateKey)
```

## Contributions

You are welcome to contribute to the module. To develop, use the following commands.

* `npm install` to install dependencies
* `npm run build` to build and pack the code
* `npm run test` to run tests

Fork the project, make your changes and request them to be merged with a pull request. Issues are also welcome. If you have any questions, you can find me lurking around the Nano discord server.

## Donations

If this helped you in your endeavours and you feel like supporting the developer, please donate some Nano:

`nano_1iic4ggaxy3eyg89xmswhj1r5j9uj66beka8qjcte11bs6uc3wdwr7i9hepm`

If you prefer the old fashioned way, I also have a [GitHub Sponsors account](https://github.com/sponsors/numsu).
