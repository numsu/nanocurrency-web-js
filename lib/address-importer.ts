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
		return this.nano(seed, 0, 0, mnemonic)
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
		if (!/^[0-9a-f]+$/i.test(seed)) {
			throw new Error('Seed is not a valid hexadecimal string')
		}

		return this.nano(seed, from, to, undefined)
	}
	

	/**
	 * Import a wallet using a legacy seed
	 * 
	 * @param {string} seed - The seed to import the wallet from
	 * @param {number} [from] - (Optional) The start index of the private keys to derive from
	 * @param {number} [to] - (Optional) The end index of the private keys to derive to
	 * @returns {Wallet} The wallet derived from the seed
	 */
	fromLegacySeed(seed: string, from: number = 0, to: number = 0): Wallet {
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

		return {
			mnemonic: undefined,
			seed,
			accounts,
		}
	}

	/**
	 * Derives the private keys
	 * 
	 * @param {string} seed - The seed to use for private key derivation
	 * @param {number} from - The start index of private keys to derive from
	 * @param {number} to - The end index of private keys to derive to
	 * @param {string} [mnemonic] - (Optional) the mnemonic phrase to return with the wallet
	 */
	private nano(seed: string, from: number, to: number, mnemonic?: string): Wallet {
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

		return {
			mnemonic,
			seed,
			accounts,
		}
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
