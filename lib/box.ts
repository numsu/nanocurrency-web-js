import * as base64 from 'byte-base64'

import Ed25519 from './ed25519'
import NanoAddress from './nano-address'
import Convert from './util/convert'
import Curve25519 from './util/curve25519'
import { randomBytes } from './util/secure-random'

export default class Box {

	static readonly NONCE_LENGTH = 24

	static encrypt(message: string, address: string, privateKey: string, nonce?: string) {
		if (!message) {
			throw new Error('No message to encrypt')
		}

		if (nonce) {
			if (nonce.length !== this.NONCE_LENGTH * 2) {
				throw new Error('Invalid nonce length, must be a 48 character hexadecimal string (24 bytes)')
			}
			if (!/^[0-9a-fA-F]+$/i.test(nonce)) {
				throw new Error('Nonce is not a valid hexadecimal string')
			}
		}

		const publicKey = NanoAddress.addressToPublicKey(address)
		const { privateKey: convertedPrivateKey, publicKey: convertedPublicKey } = new Ed25519().convertKeys({
			privateKey,
			publicKey,
		})

		const nonceBytes = nonce ? Convert.hex2ab(nonce) : randomBytes(this.NONCE_LENGTH)
		const encrypted = new Curve25519().box(
			Convert.decodeUTF8(message),
			nonceBytes,
			Convert.hex2ab(convertedPublicKey),
			Convert.hex2ab(convertedPrivateKey),
		)

		const full = new Uint8Array(nonceBytes.length + encrypted.length)
		full.set(nonceBytes)
		full.set(encrypted, nonceBytes.length)

		return base64.bytesToBase64(full)
	}

	static decrypt(encrypted: string, address: string, privateKey: string) {
		if (!encrypted) {
			throw new Error('No message to decrypt')
		}

		const publicKey = NanoAddress.addressToPublicKey(address)
		const { privateKey: convertedPrivateKey, publicKey: convertedPublicKey } = new Ed25519().convertKeys({
			privateKey,
			publicKey,
		})

		const decodedEncryptedMessageBytes = base64.base64ToBytes(encrypted)
		const nonce = decodedEncryptedMessageBytes.slice(0, this.NONCE_LENGTH)
		const encryptedMessage = decodedEncryptedMessageBytes.slice(this.NONCE_LENGTH, encrypted.length)

		const decrypted = new Curve25519().boxOpen(
			encryptedMessage,
			nonce,
			Convert.hex2ab(convertedPublicKey),
			Convert.hex2ab(convertedPrivateKey),
		)

		if (!decrypted) {
			throw new Error('Could not decrypt message')
		}

		return Convert.encodeUTF8(decrypted)
	}

}
