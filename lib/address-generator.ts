import Bip32KeyDerivation from './bip32-key-derivation'
import Bip39Mnemonic from './bip39-mnemonic'
import { Ed25519 } from './ed25519'
import { NanoAddress } from './nano-address'
import { Wallet } from './address-importer'

export class AddressGenerator {

	/**
	 * Generates the wallet
	 *
	 * @param {String} seedPassword Password for the seed
	 */
	generateWallet(entropy = '', seedPassword: string = ''): Wallet {
		const bip39 = new Bip39Mnemonic(seedPassword)
		const wallet = bip39.createWallet(entropy)

		const bip44 = new Bip32KeyDerivation(`44'/165'/0'`, wallet.seed)
		const privateKey = bip44.derivePath().key

		const ed25519 = new Ed25519()
		const keyPair = ed25519.generateKeys(privateKey)

		const nano = new NanoAddress()
		const address = nano.deriveAddress(keyPair.publicKey)

		return {
			mnemonic: wallet.mnemonic,
			seed: wallet.seed,
			accounts: [{
				accountIndex: 0,
				privateKey: keyPair.privateKey,
				publicKey: keyPair.publicKey,
				address,
			}],
		}
	}

}
