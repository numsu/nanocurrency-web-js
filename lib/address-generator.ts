import AddressImporter, { Wallet } from './address-importer'
import Bip39Mnemonic from './bip39-mnemonic'

export default class AddressGenerator {

	/**
	 * Generates a hierarchial deterministic BIP32/39/44 wallet
	 *
	 * @param {string} [entropy] - (Optional) Custom entropy if the caller doesn't want a default generated entropy
	 * @param {string} [seedPassword] - (Optional) Password for the seed
	 */
	static generateWallet = (entropy = '', seedPassword: string = ''): Wallet => {
		const mnemonicSeed = Bip39Mnemonic.createWallet(entropy, seedPassword)
		const wallet = AddressImporter.fromSeed(mnemonicSeed.seed, 0, 0)
		return {
			...wallet,
			mnemonic: mnemonicSeed.mnemonic,
		}
	}

	/**
	 * Generates a legacy Nano wallet
	 */
	static generateLegacyWallet = (seed?: string): Wallet => {
		const mnemonicSeed = Bip39Mnemonic.createLegacyWallet(seed)
		return AddressImporter.fromLegacySeed(mnemonicSeed.seed, 0, 0, mnemonicSeed.mnemonic)
	}

}
