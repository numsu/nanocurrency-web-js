import AddressImporter, { Wallet } from './address-importer'
import Bip39Mnemonic from './bip39-mnemonic'

export default class AddressGenerator {

	/**
	 * Generates a hierarchial deterministic BIP32/39/44 wallet
	 *
	 * @param {string} [entropy] - (Optional) Custom entropy if the caller doesn't want a default generated entropy
	 * @param {string} [seedPassword] - (Optional) Password for the seed
	 */
	generateWallet(entropy = '', seedPassword: string = ''): Wallet {
		const bip39 = new Bip39Mnemonic(seedPassword)
		const mnemonicSeed = bip39.createWallet(entropy)
		const wallet = new AddressImporter().fromSeed(mnemonicSeed.seed, 0, 0)

		return {
			...wallet,
			mnemonic: mnemonicSeed.mnemonic,
		}
	}

	/**
	 * Generates a legacy Nano wallet
	 *
	 */
	generateLegacyWallet(seed?: string): Wallet {
		const bip39 = new Bip39Mnemonic()
		const mnemonicSeed = bip39.createLegacyWallet(seed)
		const wallet = new AddressImporter().fromLegacySeed(mnemonicSeed.seed, 0, 0, mnemonicSeed.mnemonic)

		return wallet
	}

}
