import Bip32KeyDerivation from './bip32-key-derivation'
import Bip39Mnemonic from './bip39-mnemonic'
import Ed25519 from './ed25519'
import NanoAddress from './nano-address'
import Signer from './signer'
import Convert from './util/convert'

export default class AddressImporter {

	/**
	 * Import a wallet using a mnemonic phrase
	 *
	 * @param {string} mnemonic - The mnemonic words to import the wallet from
	 * @param {string} [seedPassword] - (Optional) The password to use to secure the mnemonic
	 * @returns {Wallet} - The wallet derived from the mnemonic phrase
	 */
	fromMnemonic(mnemonic: string, seedPassword = ''): Wallet {
		const bip39 = new Bip39Mnemonic(seedPassword)
		if (!bip39.validateMnemonic(mnemonic)) {
			throw new Error('Invalid mnemonic phrase')
		}

		const seed = bip39.mnemonicToSeed(mnemonic)
		const accounts = this.accounts(seed, 0, 0)

		return {
			mnemonic,
			seed,
			accounts,
		}
	}

	/**
	 * Import a legacy wallet using a mnemonic phrase
	 *
	 * @param {string} mnemonic - The mnemonic words to import the wallet from
	 * @returns {Wallet} - The wallet derived from the mnemonic phrase
	 */
	fromLegacyMnemonic(mnemonic: string): Wallet {
		const bip39 = new Bip39Mnemonic()
		if (!bip39.validateMnemonic(mnemonic)) {
			throw new Error('Invalid mnemonic phrase')
		}

		const seed = bip39.mnemonicToLegacySeed(mnemonic)
		return this.fromLegacySeed(seed, 0, 0, mnemonic)
	}

	/**
	 * Validate mnemonic words
	 *
	 * @param mnemonic {string} mnemonic - The mnemonic words to validate
	 */
	validateMnemonic(mnemonic: string): boolean {
		const bip39 = new Bip39Mnemonic()
		return bip39.validateMnemonic(mnemonic);
	}

	/**
	 * Import a wallet using a seed
	 *
	 * @param {string} seed - The seed to import the wallet from
	 * @param {number} [from] - (Optional) The start index of the private keys to derive from
	 * @param {number} [to] - (Optional) The end index of the private keys to derive to
	 * @returns {Wallet} The wallet derived from the mnemonic phrase
	 */
	fromSeed(seed: string, from = 0, to = 0): Wallet {
		if (seed.length !== 128) {
			throw new Error('Invalid seed length, must be a 128 byte hexadecimal string')
		}
		if (!/^[0-9a-fA-F]+$/i.test(seed)) {
			throw new Error('Seed is not a valid hexadecimal string')
		}

		const accounts = this.accounts(seed, from, to)

		return {
			mnemonic: undefined,
			seed,
			accounts,
		}
	}


	/**
	 * Import a wallet using a legacy seed
	 *
	 * @param {string} seed - The seed to import the wallet from
	 * @param {number} [from] - (Optional) The start index of the private keys to derive from
	 * @param {number} [to] - (Optional) The end index of the private keys to derive to
	 * @returns {Wallet} The wallet derived from the seed
	 */
	fromLegacySeed(seed: string, from: number = 0, to: number = 0, mnemonic?: string): Wallet {
		if (seed.length !== 64) {
			throw new Error('Invalid seed length, must be a 64 byte hexadecimal string')
		}
		if (!/^[0-9a-fA-F]+$/i.test(seed)) {
			throw new Error('Seed is not a valid hexadecimal string')
		}

		const accounts = this.legacyAccounts(seed, from, to)
		return {
			mnemonic: mnemonic || new Bip39Mnemonic().deriveMnemonic(seed),
			seed,
			accounts,
		}
	}

	/**
	 * Derives BIP32 private keys
	 *
	 * @param {string} seed - The seed to use for private key derivation
	 * @param {number} from - The start index of private keys to derive from
	 * @param {number} to - The end index of private keys to derive to
	 */
	private accounts(seed: string, from: number, to: number): Account[] {
		const accounts = []

		for (let i = from; i <= to; i++) {
			const bip44 = new Bip32KeyDerivation(`44'/165'/${i}'`, seed)
			const privateKey = bip44.derivePath().key

			const ed25519 = new Ed25519()
			const keyPair = ed25519.generateKeys(privateKey)

			const nano = new NanoAddress()
			const address = nano.deriveAddress(keyPair.publicKey)

			accounts.push({
				accountIndex: i,
				privateKey: keyPair.privateKey,
				publicKey: keyPair.publicKey,
				address,
			})
		}

		return accounts
	}

	/**
	 * Derives legacy private keys
	 *
	 * @param {string} seed - The seed to use for private key derivation
	 * @param {number} from - The start index of private keys to derive from
	 * @param {number} to - The end index of private keys to derive to
	 */
	private legacyAccounts(seed: string, from: number, to: number): Account[] {
		const signer = new Signer()
		const accounts: Account[] = []
		for (let i = from; i <= to; i++) {
			const privateKey = Convert.ab2hex(signer.generateHash([seed, Convert.dec2hex(i, 4)]))

			const ed25519 = new Ed25519()
			const keyPair = ed25519.generateKeys(privateKey)

			const nano = new NanoAddress()
			const address = nano.deriveAddress(keyPair.publicKey)

			accounts.push({
				accountIndex: i,
				privateKey: keyPair.privateKey,
				publicKey: keyPair.publicKey,
				address,
			})
		}

		return accounts
	}

}

export interface Wallet {
	mnemonic: string
	seed: string
	accounts: Account[]
}

export interface Account {
	accountIndex: number
	privateKey: string
	publicKey: string
	address: string
}
