//@ts-ignore
import { blake2b, blake2bFinal, blake2bInit, blake2bUpdate } from 'blakejs'

import Convert from './util/convert'
import Curve25519 from './util/curve25519'
import Util from './util/util'

export default class Ed25519 {

	curve: Curve25519
	X: Int32Array
	Y: Int32Array
	L: Uint8Array

	constructor() {
		this.curve = new Curve25519()
		this.X = this.curve.gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169])
		this.Y = this.curve.gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666])
		this.L = new Uint8Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10])
	}

	pack(r: Uint8Array, p: Int32Array[]): void {
		const CURVE = this.curve
		const tx = CURVE.gf(),
			ty = CURVE.gf(),
			zi = CURVE.gf()
		CURVE.inv25519(zi, p[2])
		CURVE.M(tx, p[0], zi)
		CURVE.M(ty, p[1], zi)
		CURVE.pack25519(r, ty)
		r[31] ^= CURVE.par25519(tx) << 7
	}

	modL(r: Uint8Array, x: Uint32Array | Float64Array): void {
		let carry, i, j, k
		for (i = 63; i >= 32; --i) {
			carry = 0
			for (j = i - 32, k = i - 12; j < k; ++j) {
				x[j] += carry - 16 * x[i] * this.L[j - (i - 32)]
				carry = (x[j] + 128) >> 8
				x[j] -= carry * 256
			}
			x[j] += carry
			x[i] = 0
		}

		carry = 0
		for (j = 0; j < 32; j++) {
			x[j] += carry - (x[31] >> 4) * this.L[j]
			carry = x[j] >> 8
			x[j] &= 255
		}

		for (j = 0; j < 32; j++) {
			x[j] -= carry * this.L[j]
		}

		for (i = 0; i < 32; i++) {
			x[i + 1] += x[i] >>> 8
			r[i] = x[i] & 0xff
		}
	}

	reduce(r: Uint8Array): void {
		const x = new Uint32Array(64)
		for (let i = 0; i < 64; i++) {
			x[i] = r[i]
		}

		this.modL(r, x)
	}

	scalarmult(p: Int32Array[], q: Int32Array[], s: Uint8Array): void {
		const CURVE = this.curve
		CURVE.set25519(p[0], CURVE.gf0)
		CURVE.set25519(p[1], CURVE.gf1)
		CURVE.set25519(p[2], CURVE.gf1)
		CURVE.set25519(p[3], CURVE.gf0)
		for (let i = 255; i >= 0; --i) {
			const b = (s[(i / 8) | 0] >>> (i & 7)) & 1
			CURVE.cswap(p, q, b)
			CURVE.add(q, p)
			CURVE.add(p, p)
			CURVE.cswap(p, q, b)
		}
	}

	scalarbase(p: Int32Array[], s: Uint8Array): void {
		const CURVE = this.curve
		const q = [CURVE.gf(), CURVE.gf(), CURVE.gf(), CURVE.gf()]
		CURVE.set25519(q[0], this.X)
		CURVE.set25519(q[1], this.Y)
		CURVE.set25519(q[2], CURVE.gf1)
		CURVE.M(q[3], this.X, this.Y)
		this.scalarmult(p, q, s)
	}

	/**
	 * Generate an ed25519 keypair
	 * @param {String} seed A 32 byte cryptographic secure random hexadecimal string. This is basically the secret key
	 * @param {Object} Returns sk (Secret key) and pk (Public key) as 32 byte hexadecimal strings
	 */
	generateKeys(seed: string): KeyPair {
		const pk = new Uint8Array(32)
		const p = [this.curve.gf(), this.curve.gf(), this.curve.gf(), this.curve.gf()]
		const h = blake2b(Convert.hex2ab(seed), undefined, 64).slice(0, 32)

		h[0] &= 0xf8
		h[31] &= 0x7f
		h[31] |= 0x40

		this.scalarbase(p, h)
		this.pack(pk, p)

		return {
			privateKey: seed,
			publicKey: Convert.ab2hex(pk),
		}
	}

	/**
	 * Generate a message signature
	 * @param {Uint8Array} msg Message to be signed as byte array
	 * @param {Uint8Array} privateKey Secret key as byte array
	 * @param {Uint8Array} Returns the signature as 64 byte typed array
	 */
	sign(msg: Uint8Array, privateKey: Uint8Array): Uint8Array {
		const signedMsg = this.naclSign(msg, privateKey)
		const sig = new Uint8Array(64)

		for (let i = 0; i < sig.length; i++) {
			sig[i] = signedMsg[i]
		}

		return sig
	}

	/**
	 * Verify a message signature
	 * @param {Uint8Array} msg Message to be signed as byte array
	 * @param {Uint8Array} publicKey Public key as byte array
	 * @param {Uint8Array} signature Signature as byte array
	 * @param {Uint8Array} Returns the signature as 64 byte typed array
	 */
	verify(msg: Uint8Array, publicKey: Uint8Array, signature: Uint8Array): boolean {
		const CURVE = this.curve;
		const p = [CURVE.gf(), CURVE.gf(), CURVE.gf(), CURVE.gf()]
		const q = [CURVE.gf(), CURVE.gf(), CURVE.gf(), CURVE.gf()]

		if (signature.length !== 64) {
			return false
		}
		if (publicKey.length !== 32) {
			return false
		}
		if (CURVE.unpackNeg(q, publicKey)) {
			return false
		}

		const ctx = blake2bInit(64, undefined)
		blake2bUpdate(ctx, signature.subarray(0, 32))
		blake2bUpdate(ctx, publicKey)
		blake2bUpdate(ctx, msg)
		let k = blake2bFinal(ctx)
		this.reduce(k)
		this.scalarmult(p, q, k)

		let t = new Uint8Array(32)
		this.scalarbase(q, signature.subarray(32))
		CURVE.add(p, q)
		this.pack(t, p)

		return Util.compare(signature.subarray(0, 32), t)
	}

	private naclSign(msg: Uint8Array, secretKey: Uint8Array): Uint8Array {
		if (secretKey.length !== 32) {
			throw new Error('bad secret key size')
		}

		const signedMsg = new Uint8Array(64 + msg.length)
		this.cryptoSign(signedMsg, msg, msg.length, secretKey)

		return signedMsg
	}

	private cryptoSign(sm: Uint8Array, m: Uint8Array, n: number, sk: Uint8Array): number {
		const CURVE = this.curve
		const d = new Uint8Array(64)
		const h = new Uint8Array(64)
		const r = new Uint8Array(64)
		const x = new Float64Array(64)
		const p = [CURVE.gf(), CURVE.gf(), CURVE.gf(), CURVE.gf()]

		let i
		let j

		const pk = Convert.hex2ab(this.generateKeys(Convert.ab2hex(sk)).publicKey)

		this.cryptoHash(d, sk, 32)
		d[0] &= 248
		d[31] &= 127
		d[31] |= 64

		const smlen = n + 64
		for (i = 0; i < n; i++) {
			sm[64 + i] = m[i]
		}

		for (i = 0; i < 32; i++) {
			sm[32 + i] = d[32 + i]
		}

		this.cryptoHash(r, sm.subarray(32), n + 32)
		this.reduce(r)
		this.scalarbase(p, r)
		this.pack(sm, p)

		for (i = 32; i < 64; i++) {
			sm[i] = pk[i - 32]
		}

		this.cryptoHash(h, sm, n + 64)
		this.reduce(h)

		for (i = 0; i < 64; i++) {
			x[i] = 0
		}

		for (i = 0; i < 32; i++) {
			x[i] = r[i]
		}

		for (i = 0; i < 32; i++) {
			for (j = 0; j < 32; j++) {
				x[i + j] += h[i] * d[j]
			}
		}

		this.modL(sm.subarray(32), x)

		return smlen
	}

	private cryptoHash(out: Uint8Array, m: Uint8Array, n: number): number {
		const input = new Uint8Array(n)
		for (let i = 0; i < n; ++i) {
			input[i] = m[i]
		}

		const hash = blake2b(input)
		for (let i = 0; i < 64; ++i) {
			out[i] = hash[i]
		}

		return 0
	}

}

export interface KeyPair {
	privateKey: string
	publicKey: string
}
