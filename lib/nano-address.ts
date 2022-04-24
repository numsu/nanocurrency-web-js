//@ts-ignore
import { blake2b } from 'blakejs'

import Convert from './util/convert'

export default class NanoAddress {

	static readonly alphabet = '13456789abcdefghijkmnopqrstuwxyz'
	static readonly prefix = 'nano_'

	static deriveAddress = (publicKey: string): string => {
		const publicKeyBytes = Convert.hex2ab(publicKey)
		const checksum = blake2b(publicKeyBytes, undefined, 5).reverse()
		const encoded = this.encodeNanoBase32(publicKeyBytes)
		const encodedChecksum = this.encodeNanoBase32(checksum)

		return this.prefix + encoded + encodedChecksum
	}

	static encodeNanoBase32 = (publicKey: Uint8Array): string => {
		const length = publicKey.length
		const leftover = (length * 8) % 5
		const offset = leftover === 0 ? 0 : 5 - leftover

		let value = 0
		let output = ''
		let bits = 0

		for (let i = 0; i < length; i++) {
			value = (value << 8) | publicKey[i]
			bits += 8

			while (bits >= 5) {
				output += this.alphabet[(value >>> (bits + offset - 5)) & 31]
				bits -= 5
			}
		}

		if (bits > 0) {
			output += this.alphabet[(value << (5 - (bits + offset))) & 31]
		}

		return output
	}

	static addressToPublicKey = (input: string): string => {
		const cleaned = input
			.replace('nano_', '')
			.replace('xrb_', '')
		const publicKeyBytes = NanoAddress.decodeNanoBase32(cleaned)
		return Convert.ab2hex(publicKeyBytes).slice(0, 64)
	}

	static decodeNanoBase32 = (input: string): Uint8Array => {
		const length = input.length
		const leftover = (length * 5) % 8
		const offset = leftover === 0 ? 0 : 8 - leftover

		let bits = 0
		let value = 0
		let index = 0
		let output = new Uint8Array(Math.ceil((length * 5) / 8))

		for (let i = 0; i < length; i++) {
			value = (value << 5) | this.readChar(input[i])
			bits += 5

			if (bits >= 8) {
				output[index++] = (value >>> (bits + offset - 8)) & 255
				bits -= 8
			}
		}

		if (bits > 0) {
			output[index++] = (value << (bits + offset - 8)) & 255
		}

		if (leftover !== 0) {
			output = output.slice(1)
		}

		return output
	}

	/**
	 * Validates a Nano address with 'nano' and 'xrb' prefixes
	 *
	 * Derived from https://github.com/alecrios/nano-address-validator
	 *
	 * @param {string} address Nano address
	 */
	static validateNanoAddress = (address: string): boolean => {
		if (address === undefined) {
			throw Error('Address must be defined.')
		}

		if (typeof address !== 'string') {
			throw TypeError('Address must be a string.')
		}

		const allowedPrefixes: string[] = ['nano', 'xrb']
		const pattern = new RegExp(
			`^(${allowedPrefixes.join('|')})_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$`,
		)

		if (!pattern.test(address)) {
			return false
		}

		const expectedChecksum = address.slice(-8)
		const publicKey = this.stripAddress(address)
		const publicKeyBuffer = this.decodeNanoBase32(publicKey)
		const actualChecksumBuffer = blake2b(publicKeyBuffer, null, 5).reverse()
		const actualChecksum = this.encodeNanoBase32(actualChecksumBuffer)

		return expectedChecksum === actualChecksum
	}

	static nanoAddressToHexString = (addr: string): string => {
		addr = addr.slice(-60)
		const isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(addr)
		if (isValid) {
			const keyBytes = this.decodeNanoBase32(addr.substring(0, 52))
			const hashBytes = this.decodeNanoBase32(addr.substring(52, 60))
			const blakeHash = blake2b(keyBytes, undefined, 5).reverse()
			if (Convert.ab2hex(hashBytes) == Convert.ab2hex(blakeHash)) {
				const key = Convert.ab2hex(keyBytes).toUpperCase()
				return key
			}
			throw new Error('Checksum mismatch in address')
		} else {
			throw new Error('Illegal characters in address')
		}
	}

	static stripAddress(address: string): string {
		return address.slice(address.indexOf('_') + 1, -8)
	}

	private static readChar(char: string): number {
		const idx = this.alphabet.indexOf(char)

		if (idx === -1) {
			throw new Error(`Invalid character found: ${char}`)
		}

		return idx
	}

}
