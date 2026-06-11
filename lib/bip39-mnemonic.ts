import { pbkdf2 } from '@noble/hashes/pbkdf2.js'
import { sha256, sha512 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

import Convert from './util/convert'
import { randomHex } from './util/secure-random'
import Util from './util/util'
import words from './words'

export default class Bip39Mnemonic {

	/**
	 * Creates a BIP39 wallet
	 *
	 * @param {string} [entropy] - (Optional) the entropy to use instead of generating
	 * @returns {MnemonicSeed} The mnemonic phrase and a seed derived from the (generated) entropy
	 */
	static createWallet = (entropy: string, password: string): MnemonicSeed => {
		if (entropy) {
			if (entropy.length !== 64) {
				throw new Error('Invalid entropy length, must be a 32 bit hexadecimal string')
			}
			if (!/^[0-9a-fA-F]+$/i.test(entropy)) {
				throw new Error('Entopy is not a valid hexadecimal string')
			}
		}

		if (!entropy) {
			entropy = randomHex(32)
		}

		const mnemonic = this.deriveMnemonic(entropy)
		const seed = this.mnemonicToSeed(mnemonic, password)

		return {
			mnemonic,
			seed,
		}
	}

	/**
	 * Creates an old Nano wallet
	 *
	 * @param {string} seed - (Optional) the seed to be used for the wallet
	 * @returns {MnemonicSeed} The mnemonic phrase and a generated seed if none provided
	 */
	static createLegacyWallet = (seed?: string): MnemonicSeed => {
		if (seed) {
			if (seed.length !== 64) {
				throw new Error('Invalid entropy length, must be a 32 bit hexadecimal string')
			}
			if (!/^[0-9a-fA-F]+$/i.test(seed)) {
				throw new Error('Entopy is not a valid hexadecimal string')
			}
		}

		if (!seed) {
			seed = randomHex(32)
		}

		const mnemonic = this.deriveMnemonic(seed)

		return {
			mnemonic,
			seed,
		}
	}

	static deriveMnemonic = (entropy: string): string => {
		const entropyBinary = Convert.hexStringToBinary(entropy)
		const entropySha256Binary = Convert.hexStringToBinary(this.calculateChecksum(entropy))
		const entropyBinaryWithChecksum = entropyBinary + entropySha256Binary

		const mnemonicWords = []
		for (let i = 0; i < entropyBinaryWithChecksum.length; i += 11) {
			mnemonicWords.push(words[parseInt(entropyBinaryWithChecksum.substr(i, 11), 2)])
		}

		return mnemonicWords.join(' ')
	}

	/**
	 * Validates a mnemonic phrase
	 *
	 * @param {string} mnemonic - The mnemonic phrase to validate
	 * @returns {boolean} Is the mnemonic phrase valid
	 */
	static validateMnemonic = (mnemonic: string): boolean => {
		const wordArray = Util.normalizeUTF8(mnemonic).split(' ')
		if (wordArray.length % 3 !== 0) {
			return false
		}

		const bits = wordArray.map((w: string) => {
			const wordIndex = words.indexOf(w)
			if (wordIndex === -1) {
				return false
			}
			return (Convert.dec2bin(wordIndex)).padStart(11, '0')
		}).join('')

		const dividerIndex = Math.floor(bits.length / 33) * 32
		const entropyBits = bits.slice(0, dividerIndex)
		const checksumBits = bits.slice(dividerIndex)
		const entropyBytes = entropyBits.match(/(.{1,8})/g).map((bin: string) => parseInt(bin, 2))

		if (entropyBytes.length < 16) {
			return false
		}

		if (entropyBytes.length > 32) {
			return false
		}

		if (entropyBytes.length % 4 !== 0) {
			return false
		}

		const entropyHex = Convert.bytesToHexString(entropyBytes)
		const newChecksum = this.calculateChecksum(entropyHex)
		const inputChecksum = Convert.binaryToHexString(checksumBits)

		if (parseInt(newChecksum, 16) != parseInt(inputChecksum, 16)) {
			return false
		}

		return true
	}

	/**
	 * Converts the mnemonic phrase to an old Nano seed
	 *
	 * @param {string} mnemonic Mnemonic phrase separated by spaces
	 */
	static mnemonicToLegacySeed = (mnemonic: string): string => {
		const wordArray = Util.normalizeUTF8(mnemonic).split(' ')
		const bits = wordArray.map((w: string) => {
			const wordIndex = words.indexOf(w)
			if (wordIndex === -1) {
				return false
			}
			return (Convert.dec2bin(wordIndex)).padStart(11, '0')
		}).join('')

		const dividerIndex = Math.floor(bits.length / 33) * 32
		const entropyBits = bits.slice(0, dividerIndex)
		const entropyBytes = entropyBits.match(/(.{1,8})/g).map((bin: string) => parseInt(bin, 2))
		const entropyHex = Convert.bytesToHexString(entropyBytes)

		return entropyHex
	}

	/**
	 * Converts the mnemonic phrase to a BIP39 seed
	 *
	 * @param {string} mnemonic Mnemonic phrase separated by spaces
	 */
	static mnemonicToSeed = (mnemonic: string, password: string): string => {
		const normalizedMnemonic = Util.normalizeUTF8(mnemonic)
		const normalizedPassword = 'mnemonic' + Util.normalizeUTF8(password)

		return bytesToHex(pbkdf2(
			sha512,
			utf8ToBytes(normalizedMnemonic),
			utf8ToBytes(normalizedPassword),
			{
				c: 2048,
				dkLen: 64,
			}))
	}

	private static calculateChecksum = (entropyHex: string): string => {
		const entropySha256 = bytesToHex(sha256(Convert.hex2ab(entropyHex)))
		return entropySha256.substr(0, entropySha256.length / 32)
	}

}

interface MnemonicSeed {
	mnemonic: string,
	seed: string,
}
