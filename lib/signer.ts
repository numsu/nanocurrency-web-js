//@ts-ignore

import { blake2bFinal, blake2bInit, blake2bUpdate } from 'blakejs'

import Ed25519 from './ed25519'
import Convert from './util/convert'

export default class Signer {

	/**
	 * Signs any data using the ed25519 signature system
	 *
	 * @param privateKey Private key to sign the data with
	 * @param data Data to sign
	 */
	static sign = (privateKey: string, ...data: string[]): string => {
		const signature = new Ed25519().sign(
			this.generateHash(data),
			Convert.hex2ab(privateKey))
		return Convert.ab2hex(signature)
	}

	/**
	 * Verify the signature with a public key
	 *
	 * @param publicKey Public key to verify the data with
	 * @param signature Signature to verify
	 * @param data Data to verify
	 */
	static verify = (publicKey: string, signature: string, ...data: string[]): boolean => {
		return new Ed25519().verify(
				this.generateHash(data),
				Convert.hex2ab(publicKey),
				Convert.hex2ab(signature))
	}

	/**
	 * Creates a blake2b hash of the input data
	 *
	 * @param data Data to hash
	 */
	static generateHash = (data: string[]): Uint8Array => {
		const ctx = blake2bInit(32, undefined)
		data.forEach(str => blake2bUpdate(ctx, Convert.hex2ab(str)))
		return blake2bFinal(ctx)
	}

}