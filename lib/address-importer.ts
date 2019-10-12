import Bip32KeyDerivation from './bip32-key-derivation'
import Bip39Mnemonic from './bip39-mnemonic'
import { Ed25519 } from './ed25519'
import { NanoAddress } from './nano-address'

export class AddressImporter {

	fromMnemonic(mnemonic: string, seedPassword = ''): Wallet {
		const bip39 = new Bip39Mnemonic(seedPassword)
		if (!bip39.validateMnemonic(mnemonic)) {
			throw new Error('Invalid mnemonic phrase')
		}

		const seed = bip39.mnemonicToSeed(mnemonic)
		return this.nano(seed, 0, 0, mnemonic)
	}

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
	 * Generates the wallet
	 * @param {String} seedPassword Password for the seed
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
