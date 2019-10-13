import { AddressGenerator } from './lib/address-generator'
import { AddressImporter, Account, Wallet } from './lib/address-importer'
import BlockSigner, { TransactionBlock, RepresentativeBlock, SignedBlock } from './lib/block-signer'
import BigNumber from 'bignumber.js'
import NanoConverter from './lib/nano-converter'

const generator = new AddressGenerator()
const importer = new AddressImporter()
const wallet = {

	/**
	 * Generate a new Nano cryptocurrency wallet
	 *
	 * This function generates a wallet from random entropy. Wallet includes
	 * a BIP39 mnemonic phrase in line with the Nano Ledger implementation and
	 * a seed, the account is derived using BIP32 deterministic hierarchial algorithm
	 * with input parameters 44'/165' and index 0.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * Generation uses CryptoJS to generate random entropy by default. You can give your own entropy
	 * as a parameter and it will be used instead.
	 *
	 * An optional seed password can be used to encrypt the mnemonic phrase so the seed
	 * cannot be derived correctly without the password. Recovering the password is not possible.
	 *
	 * @param {string} [entropy] Optional 64 byte hexadecimal string entropy to be used instead of the default
	 * @param {string} [seedPassword] Optional seed password
	 * @returns the generated mnemonic, seed and account
	 */
	generate: (entropy?: string, seedPassword?: string): Wallet => {
		return generator.generateWallet(entropy, seedPassword)
	},

	/**
	 * Import a Nano cryptocurrency wallet from a mnemonic phrase
	 *
	 * This function imports a wallet from a mnemonic phrase. Wallet includes the mnemonic phrase,
	 * a seed derived with BIP39 standard and an account derived using BIP32 deterministic hierarchial
	 * algorithm with input parameters 44'/165' and index 0.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * @param {string} mnemonic The mnemonic phrase. Words are separated with a space
	 * @param {string} [seedPassword] Optional seed password
	 * @throws Throws an error if the mnemonic phrase doesn't pass validations
	 * @returns the imported mnemonic, seed and account
	 */
	fromMnemonic: (mnemonic: string, seedPassword?: string): Wallet => {
		return importer.fromMnemonic(mnemonic, seedPassword)
	},

	/**
	 * Import a Nano cryptocurrency wallet from a seed
	 *
	 * This function imports a wallet from a seed. Wallet includes the seed and an account derived using
	 * BIP39 standard and an account derived using BIP32 deterministic hierarchial algorithm with input
	 * parameters 44'/165' and index 0.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * @param {string} seed The seed
	 * @returns the importes seed and account
	 */
	fromSeed: (seed: string): Wallet => {
		return importer.fromSeed(seed)
	},

	/**
	 * Derive accounts for the seed
	 *
	 * This function derives Nano accounts with the BIP32 deterministic hierarchial algorithm
	 * from the given seed with input parameters 44'/165' and indexes based on the from and to
	 * parameters.
	 *
	 * @param {string} seed The seed
	 * @param {number} from The start index
	 * @param {number} to The end index
	 */
	accounts: (seed: string, from: number, to: number): Account[] => {
		return importer.fromSeed(seed, from, to).accounts
	},

}

const blockSigner = new BlockSigner()
const block = {

	/**
	 * Sign a send block with the input parameters
	 *
	 * For a receive block, put your own address to the 'toAddress' property.
	 * All the NANO amounts should be input in RAW format. The addresses should be
	 * valid Nano addresses. Fetch the current balance, frontier (previous block) and
	 * representative address from the blockchain and generate work for the signature.
	 *
	 * The return value of this function is ready to be published to the blockchain.
	 *
	 * NOTICE: Always fetch up-to-date account info from the blockchain
	 *         before signing the block
	 *
	 * @param {SendBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 */
	sign: (data: TransactionBlock, privateKey: string): SignedBlock => {
		return blockSigner.sign(data, privateKey)
	},

	/**
	 * Sign a representative change block with the input parameters
	 *
	 * For a change block, put your own address to the 'address' property.
	 * All the NANO amounts should be input in RAW format. The addresses should be
	 * valid Nano addresses. Fetch the current balance, previous block from the
	 * blockchain and generate work for the signature. Set the new representative address
	 * as the representative.
	 *
	 * NOTICE: Always fetch up-to-date account info from the blockchain
	 *         before signing the block
	 *
	 * @param {RepresentativeBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 *
	 */
	representative: (data: RepresentativeBlock, privateKey: string): SignedBlock => {
		const block: TransactionBlock = {
			...data,
			fromAddress: data.address,
			amountRaw: '0',
			toAddress: 'nano_1111111111111111111111111111111111111111111111111111hifc8npp' // Burn address
		}

		return blockSigner.sign(block, privateKey)
	},

}

const converter = {

	/**
	 * Convert Nano values
	 *
	 * Possible units are RAW, NANO, MRAI, KRAI, RAI
	 *
	 * @param {string | BigNumber} input The input value
	 * @param {string} inputUnit The unit of the input value
	 * @param {string} outputUnit The unit you wish to convert to
	 */
	convert: (input: string | BigNumber, inputUnit: string, outputUnit: string) => {
		return NanoConverter.convert(input, inputUnit, outputUnit)
	},

}

export {
	wallet,
	block,
	converter,
}
