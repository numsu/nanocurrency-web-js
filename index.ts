import { AddressGenerator } from './lib/address-generator'
import { AddressImporter } from './lib/address-importer'
import BlockSigner, { SendBlock, ReceiveBlock } from './lib/block-signer'

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
	 * Generation uses CryptoJS to generate random entropy. You can give your own entropy
	 * as a parameter and it will be used instead.
	 *
	 * An optional seed password can be used to encrypt the mnemonic phrase so the seed
	 * cannot be derived correctly without the password. Recovering the password is not possible.
	 *
	 * @param {string} [entropy] Optional entropy to be used instead of the default
	 * @param {string} [seedPassword] Optional seed password
	 * @returns the generated mnemonic, seed and account
	 */
	generate: (entropy?: string, seedPassword?: string) => {
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
	fromMnemonic: (mnemonic: string, seedPassword?: string) => {
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
	fromSeed: (seed: string) => {
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
	accounts: (seed: string, from: number, to: number) => {
		return importer.fromSeed(seed, from, to).accounts
	},

}

const blockSigner = new BlockSigner()
const block = {

	/**
	 * Sign a send block with the input parameters
	 *
	 * @param {SendBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 */
	send: (data: SendBlock, privateKey: string) => {
		return blockSigner.send(data, privateKey)
	},

	/**
	 * Sign a receive block with the input parameters
	 *
	 * @param {SendBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 */
	receive: (data: ReceiveBlock, privateKey: string) => {
		return blockSigner.receive(data, privateKey)
	},

	// TODO: change representative block

}

export default {
	wallet,
	block,
}
