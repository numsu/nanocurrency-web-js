//@ts-ignore
import { enc, algo } from 'crypto-js'
import Convert from './util/convert'

const ED25519_CURVE = 'ed25519 seed'
const HARDENED_OFFSET = 0x80000000

export default class Bip32KeyDerivation {

	path: string
	seed: string

	constructor(path: string, seed: string) {
		this.path = path
		this.seed = seed
	}

	derivePath = (): Chain => {
		const { key, chainCode } = this.getKeyFromSeed()
		const segments = this.path
			.split('/')
			.map(v => v.replace('\'', ''))
			.map(el => parseInt(el, 10))
		return segments.reduce(
			(parentKeys, segment) =>
				this.CKDPriv(parentKeys, segment + HARDENED_OFFSET),
			{ key, chainCode }
		)
	}

	private getKeyFromSeed = (): Chain => {
		return this.derive(
			enc.Hex.parse(this.seed),
			enc.Utf8.parse(ED25519_CURVE))
	}

	private CKDPriv = ({ key, chainCode }: Chain, index: number) => {
		const ib = []
		ib.push((index >> 24) & 0xff)
		ib.push((index >> 16) & 0xff)
		ib.push((index >> 8) & 0xff)
		ib.push(index & 0xff)
		const data = '00' + key + Convert.ab2hex(new Uint8Array(ib).buffer)

		return this.derive(
			enc.Hex.parse(data),
			enc.Hex.parse(chainCode))
	}

	private derive = (data: string, base: string): Chain => {
		const hmac = algo.HMAC.create(algo.SHA512, base)
		const I = hmac.update(data).finalize().toString()
		const IL = I.slice(0, I.length / 2)
		const IR = I.slice(I.length / 2)

		return {
			key: IL,
			chainCode: IR,
		}
	}

}

export interface Chain {
	key: string
	chainCode: string
}
