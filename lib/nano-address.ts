import { Convert } from './util/convert'

//@ts-ignore
import { blake2b } from 'blakejs'

export class NanoAddress {

	readonly alphabet = '13456789abcdefghijkmnopqrstuwxyz'
	readonly prefix = 'nano_'

	deriveAddress = (publicKey: string): string => {
		const publicKeyBytes = Convert.hex2ab(publicKey)
		const checksum = blake2b(publicKeyBytes, undefined, 5).reverse()
		const encoded = this.encodeNanoBase32(publicKeyBytes)
		const encodedChecksum = this.encodeNanoBase32(checksum)

		return this.prefix + encoded + encodedChecksum
	}

	encodeNanoBase32 = (publicKey: Uint8Array): string => {
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

	decodeNanoBase32 = (input: string): Uint8Array => {
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

	readChar(char: string): number {
		const idx = this.alphabet.indexOf(char)

		if (idx === -1) {
			throw `Invalid character found: ${char}`
		}

		return idx
	}

}
