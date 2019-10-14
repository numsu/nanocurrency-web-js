import words from './words'
import { Util } from './util/util'
import { Convert } from './util/convert'

//@ts-ignore
import { algo, enc, lib, PBKDF2, SHA256 } from 'crypto-js'

export default class Bip39Mnemonic {

	password: string

	constructor(password: string) {
		this.password = password
	}

	createWallet = (entropy: string): { mnemonic: string, seed: string } => {
		if (entropy) {
			if (entropy.length !== 64) {
				throw new Error('Invalid entropy length, must be a 64 byte hexadecimal string')
			}
			if (!/^[0-9a-f]+$/i.test(entropy)) {
				throw new Error('Entopy is not a valid hexadecimal string')
			}
		}

		if (!entropy) {
			entropy = this.randomHex(64)
		}

		const entropyBinary = Convert.hexStringToBinary(entropy)
		const entropySha256Binary = Convert.hexStringToBinary(this.calculateChecksum(entropy))
		const entropyBinaryWithChecksum = entropyBinary + entropySha256Binary

		const mnemonicWords = []
		for (let i = 0; i < entropyBinaryWithChecksum.length; i += 11) {
			mnemonicWords.push(words[parseInt(entropyBinaryWithChecksum.substr(i, 11), 2)])
		}

		const mnemonicFinal = mnemonicWords.join(' ')
		const seed = this.mnemonicToSeed(mnemonicFinal)

		return {
			mnemonic: mnemonicFinal,
			seed,
		}
	}

	validateMnemonic = (mnemonic: string): boolean => {
		const wordArray = Util.normalizeUTF8(mnemonic).split(' ')
		if (wordArray.length % 3 !== 0) {
			return false
		}

		const bits = wordArray.map((w: string) => {
			const wordIndex = words.indexOf(w)
			if (wordIndex === -1) {
				return false
			}
			return (wordIndex.toString(2)).padStart(11, '0')
		}).join('')

		const dividerIndex = Math.floor(bits.length / 33) * 32
		const entropyBits = bits.slice(0, dividerIndex)
		const checksumBits = bits.slice(dividerIndex)
		const entropyBytes = entropyBits.match(/(.{1,8})/g).map((bin: string) => parseInt(bin, 2))

		if (entropyBytes.length < 16) return false
		if (entropyBytes.length > 32) return false
		if (entropyBytes.length % 4 !== 0) return false

		const entropyHex = Convert.bytesToHexString(entropyBytes)
		const newChecksum = this.calculateChecksum(entropyHex)
		const inputChecksum = Convert.binaryToHexString(checksumBits)

		if (newChecksum != inputChecksum) {
			return false
		}

		return true
	}

	mnemonicToSeed = (mnemonic: string): string => {
		const normalizedMnemonic = Util.normalizeUTF8(mnemonic)
		const normalizedPassword = 'mnemonic' + Util.normalizeUTF8(this.password)

		return PBKDF2(
			normalizedMnemonic,
			normalizedPassword,
			{
				keySize: 512 / 32,
				iterations: 2048,
				hasher: algo.SHA512,
			})
			.toString(enc.Hex)
	}

	private randomHex = (length: number): string => {
		return lib.WordArray.random(length / 2).toString()
	}

	private calculateChecksum = (entropyHex: string): string => {
		const entropySha256 = SHA256(enc.Hex.parse(entropyHex)).toString()
		return entropySha256.substr(0, entropySha256.length / 32)
	}

}
