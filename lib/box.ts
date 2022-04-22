import * as base64 from 'byte-base64'
//@ts-ignore
import { lib } from 'crypto-js'

import Ed25519 from './ed25519'
import NanoAddress from './nano-address'
import Convert from './util/convert'
import Curve25519 from './util/curve25519'

export default class Box {

	static readonly NONCE_LENGTH = 24

	static encrypt(message: string, address: string, privateKey: string) {
		if (!message) {
			throw new Error('No message to encrypt')
		}

		const publicKey = NanoAddress.addressToPublicKey(address)
		const { privateKey: convertedPrivateKey, publicKey: convertedPublicKey } = new Ed25519().convertKeys({
			privateKey,
			publicKey,
		})

		const nonce = Convert.hex2ab(lib.WordArray.random(this.NONCE_LENGTH).toString())
		const encrypted = new Curve25519().box(
			Convert.str2bin(message),
			nonce,
			Convert.hex2ab(convertedPublicKey),
			Convert.hex2ab(convertedPrivateKey),
		)

		const full = new Uint8Array(nonce.length + encrypted.length)
		full.set(nonce)
		full.set(encrypted, nonce.length)

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

		return Convert.bin2str(decrypted)
	}

}
