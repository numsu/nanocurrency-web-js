import Convert from './util/convert'
import Ed25519 from './ed25519'

//@ts-ignore
import { blake2bInit, blake2bUpdate, blake2bFinal } from 'blakejs'

export default class Signer {
	
	ed25519 = new Ed25519()

	/**
	 * Signs any data using the ed25519 signature system
	 * 
	 * @param privateKey Private key to sign the data with
	 * @param data Data to sign
	 */
	sign(privateKey: string, ...data: string[]): string {
		const signature = this.ed25519.sign(
			this.generateHash(data),
			Convert.hex2ab(privateKey))
		return Convert.ab2hex(signature)
	}

	/**
	 * Creates a blake2b hash of the input data
	 * 
	 * @param data Data to hash
	 */
	generateHash(data: string[]): Uint8Array {
		const ctx = blake2bInit(32, undefined)
		data.forEach(str => blake2bUpdate(ctx, Convert.hex2ab(str)))
		return blake2bFinal(ctx)
	}

}