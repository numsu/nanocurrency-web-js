import Util from './util'

export default class Curve25519 {

	gf0: Int32Array
	gf1: Int32Array
	D: Int32Array
	D2: Int32Array
	I: Int32Array
	_9: Uint8Array
	_121665: Int32Array

	constructor() {
		this.gf0 = this.gf()
		this.gf1 = this.gf([1])
		this._9 = new Uint8Array(32)
		this._9[0] = 9
		this._121665 = this.gf([0xdb41, 1])
		this.D = this.gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203])
		this.D2 = this.gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406])
		this.I = this.gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83])
	}

	gf(init?: number[]): Int32Array {
		const r = new Int32Array(16)
		if (init) {
			for (let i = 0; i < init.length; i++) {
				r[i] = init[i]
			}
		}

		return r
	}

	A(o: Int32Array, a: Int32Array, b: Int32Array): void {
		for (let i = 0; i < 16; i++) {
			o[i] = a[i] + b[i]
		}
	}

	Z(o: Int32Array, a: Int32Array, b: Int32Array): void {
		for (let i = 0; i < 16; i++) {
			o[i] = a[i] - b[i]
		}
	}

	// Avoid loops for better performance
	M(o: Int32Array, a: Int32Array, b: Int32Array): void {
		let v, c,
			t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0,
			t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
			t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
			t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0
		const b0 = b[0],
			b1 = b[1],
			b2 = b[2],
			b3 = b[3],
			b4 = b[4],
			b5 = b[5],
			b6 = b[6],
			b7 = b[7],
			b8 = b[8],
			b9 = b[9],
			b10 = b[10],
			b11 = b[11],
			b12 = b[12],
			b13 = b[13],
			b14 = b[14],
			b15 = b[15]

		v = a[0]
		t0 += v * b0
		t1 += v * b1
		t2 += v * b2
		t3 += v * b3
		t4 += v * b4
		t5 += v * b5
		t6 += v * b6
		t7 += v * b7
		t8 += v * b8
		t9 += v * b9
		t10 += v * b10
		t11 += v * b11
		t12 += v * b12
		t13 += v * b13
		t14 += v * b14
		t15 += v * b15
		v = a[1]
		t1 += v * b0
		t2 += v * b1
		t3 += v * b2
		t4 += v * b3
		t5 += v * b4
		t6 += v * b5
		t7 += v * b6
		t8 += v * b7
		t9 += v * b8
		t10 += v * b9
		t11 += v * b10
		t12 += v * b11
		t13 += v * b12
		t14 += v * b13
		t15 += v * b14
		t16 += v * b15
		v = a[2]
		t2 += v * b0
		t3 += v * b1
		t4 += v * b2
		t5 += v * b3
		t6 += v * b4
		t7 += v * b5
		t8 += v * b6
		t9 += v * b7
		t10 += v * b8
		t11 += v * b9
		t12 += v * b10
		t13 += v * b11
		t14 += v * b12
		t15 += v * b13
		t16 += v * b14
		t17 += v * b15
		v = a[3]
		t3 += v * b0
		t4 += v * b1
		t5 += v * b2
		t6 += v * b3
		t7 += v * b4
		t8 += v * b5
		t9 += v * b6
		t10 += v * b7
		t11 += v * b8
		t12 += v * b9
		t13 += v * b10
		t14 += v * b11
		t15 += v * b12
		t16 += v * b13
		t17 += v * b14
		t18 += v * b15
		v = a[4]
		t4 += v * b0
		t5 += v * b1
		t6 += v * b2
		t7 += v * b3
		t8 += v * b4
		t9 += v * b5
		t10 += v * b6
		t11 += v * b7
		t12 += v * b8
		t13 += v * b9
		t14 += v * b10
		t15 += v * b11
		t16 += v * b12
		t17 += v * b13
		t18 += v * b14
		t19 += v * b15
		v = a[5]
		t5 += v * b0
		t6 += v * b1
		t7 += v * b2
		t8 += v * b3
		t9 += v * b4
		t10 += v * b5
		t11 += v * b6
		t12 += v * b7
		t13 += v * b8
		t14 += v * b9
		t15 += v * b10
		t16 += v * b11
		t17 += v * b12
		t18 += v * b13
		t19 += v * b14
		t20 += v * b15
		v = a[6]
		t6 += v * b0
		t7 += v * b1
		t8 += v * b2
		t9 += v * b3
		t10 += v * b4
		t11 += v * b5
		t12 += v * b6
		t13 += v * b7
		t14 += v * b8
		t15 += v * b9
		t16 += v * b10
		t17 += v * b11
		t18 += v * b12
		t19 += v * b13
		t20 += v * b14
		t21 += v * b15
		v = a[7]
		t7 += v * b0
		t8 += v * b1
		t9 += v * b2
		t10 += v * b3
		t11 += v * b4
		t12 += v * b5
		t13 += v * b6
		t14 += v * b7
		t15 += v * b8
		t16 += v * b9
		t17 += v * b10
		t18 += v * b11
		t19 += v * b12
		t20 += v * b13
		t21 += v * b14
		t22 += v * b15
		v = a[8]
		t8 += v * b0
		t9 += v * b1
		t10 += v * b2
		t11 += v * b3
		t12 += v * b4
		t13 += v * b5
		t14 += v * b6
		t15 += v * b7
		t16 += v * b8
		t17 += v * b9
		t18 += v * b10
		t19 += v * b11
		t20 += v * b12
		t21 += v * b13
		t22 += v * b14
		t23 += v * b15
		v = a[9]
		t9 += v * b0
		t10 += v * b1
		t11 += v * b2
		t12 += v * b3
		t13 += v * b4
		t14 += v * b5
		t15 += v * b6
		t16 += v * b7
		t17 += v * b8
		t18 += v * b9
		t19 += v * b10
		t20 += v * b11
		t21 += v * b12
		t22 += v * b13
		t23 += v * b14
		t24 += v * b15
		v = a[10]
		t10 += v * b0
		t11 += v * b1
		t12 += v * b2
		t13 += v * b3
		t14 += v * b4
		t15 += v * b5
		t16 += v * b6
		t17 += v * b7
		t18 += v * b8
		t19 += v * b9
		t20 += v * b10
		t21 += v * b11
		t22 += v * b12
		t23 += v * b13
		t24 += v * b14
		t25 += v * b15
		v = a[11]
		t11 += v * b0
		t12 += v * b1
		t13 += v * b2
		t14 += v * b3
		t15 += v * b4
		t16 += v * b5
		t17 += v * b6
		t18 += v * b7
		t19 += v * b8
		t20 += v * b9
		t21 += v * b10
		t22 += v * b11
		t23 += v * b12
		t24 += v * b13
		t25 += v * b14
		t26 += v * b15
		v = a[12]
		t12 += v * b0
		t13 += v * b1
		t14 += v * b2
		t15 += v * b3
		t16 += v * b4
		t17 += v * b5
		t18 += v * b6
		t19 += v * b7
		t20 += v * b8
		t21 += v * b9
		t22 += v * b10
		t23 += v * b11
		t24 += v * b12
		t25 += v * b13
		t26 += v * b14
		t27 += v * b15
		v = a[13]
		t13 += v * b0
		t14 += v * b1
		t15 += v * b2
		t16 += v * b3
		t17 += v * b4
		t18 += v * b5
		t19 += v * b6
		t20 += v * b7
		t21 += v * b8
		t22 += v * b9
		t23 += v * b10
		t24 += v * b11
		t25 += v * b12
		t26 += v * b13
		t27 += v * b14
		t28 += v * b15
		v = a[14]
		t14 += v * b0
		t15 += v * b1
		t16 += v * b2
		t17 += v * b3
		t18 += v * b4
		t19 += v * b5
		t20 += v * b6
		t21 += v * b7
		t22 += v * b8
		t23 += v * b9
		t24 += v * b10
		t25 += v * b11
		t26 += v * b12
		t27 += v * b13
		t28 += v * b14
		t29 += v * b15
		v = a[15]
		t15 += v * b0
		t16 += v * b1
		t17 += v * b2
		t18 += v * b3
		t19 += v * b4
		t20 += v * b5
		t21 += v * b6
		t22 += v * b7
		t23 += v * b8
		t24 += v * b9
		t25 += v * b10
		t26 += v * b11
		t27 += v * b12
		t28 += v * b13
		t29 += v * b14
		t30 += v * b15

		t0 += 38 * t16
		t1 += 38 * t17
		t2 += 38 * t18
		t3 += 38 * t19
		t4 += 38 * t20
		t5 += 38 * t21
		t6 += 38 * t22
		t7 += 38 * t23
		t8 += 38 * t24
		t9 += 38 * t25
		t10 += 38 * t26
		t11 += 38 * t27
		t12 += 38 * t28
		t13 += 38 * t29
		t14 += 38 * t30

		c = 1
		v = t0 + c + 65535; c = Math.floor(v / 65536); t0 = v - c * 65536
		v = t1 + c + 65535; c = Math.floor(v / 65536); t1 = v - c * 65536
		v = t2 + c + 65535; c = Math.floor(v / 65536); t2 = v - c * 65536
		v = t3 + c + 65535; c = Math.floor(v / 65536); t3 = v - c * 65536
		v = t4 + c + 65535; c = Math.floor(v / 65536); t4 = v - c * 65536
		v = t5 + c + 65535; c = Math.floor(v / 65536); t5 = v - c * 65536
		v = t6 + c + 65535; c = Math.floor(v / 65536); t6 = v - c * 65536
		v = t7 + c + 65535; c = Math.floor(v / 65536); t7 = v - c * 65536
		v = t8 + c + 65535; c = Math.floor(v / 65536); t8 = v - c * 65536
		v = t9 + c + 65535; c = Math.floor(v / 65536); t9 = v - c * 65536
		v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536
		v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536
		v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536
		v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536
		v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536
		v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536
		t0 += c - 1 + 37 * (c - 1)

		c = 1
		v = t0 + c + 65535; c = Math.floor(v / 65536); t0 = v - c * 65536
		v = t1 + c + 65535; c = Math.floor(v / 65536); t1 = v - c * 65536
		v = t2 + c + 65535; c = Math.floor(v / 65536); t2 = v - c * 65536
		v = t3 + c + 65535; c = Math.floor(v / 65536); t3 = v - c * 65536
		v = t4 + c + 65535; c = Math.floor(v / 65536); t4 = v - c * 65536
		v = t5 + c + 65535; c = Math.floor(v / 65536); t5 = v - c * 65536
		v = t6 + c + 65535; c = Math.floor(v / 65536); t6 = v - c * 65536
		v = t7 + c + 65535; c = Math.floor(v / 65536); t7 = v - c * 65536
		v = t8 + c + 65535; c = Math.floor(v / 65536); t8 = v - c * 65536
		v = t9 + c + 65535; c = Math.floor(v / 65536); t9 = v - c * 65536
		v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536
		v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536
		v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536
		v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536
		v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536
		v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536
		t0 += c - 1 + 37 * (c - 1)

		o[0] = t0
		o[1] = t1
		o[2] = t2
		o[3] = t3
		o[4] = t4
		o[5] = t5
		o[6] = t6
		o[7] = t7
		o[8] = t8
		o[9] = t9
		o[10] = t10
		o[11] = t11
		o[12] = t12
		o[13] = t13
		o[14] = t14
		o[15] = t15
	}

	S(o: Int32Array, a: Int32Array): void {
		this.M(o, a, a)
	}

	add(p: Int32Array[], q: Int32Array[]): void {
		const a = this.gf(), b = this.gf(), c = this.gf(),
			d = this.gf(), e = this.gf(), f = this.gf(),
			g = this.gf(), h = this.gf(), t = this.gf()

		this.Z(a, p[1], p[0])
		this.Z(t, q[1], q[0])
		this.M(a, a, t)
		this.A(b, p[0], p[1])
		this.A(t, q[0], q[1])
		this.M(b, b, t)
		this.M(c, p[3], q[3])
		this.M(c, c, this.D2)
		this.M(d, p[2], q[2])
		this.A(d, d, d)
		this.Z(e, b, a)
		this.Z(f, d, c)
		this.A(g, d, c)
		this.A(h, b, a)
		this.M(p[0], e, f)
		this.M(p[1], h, g)
		this.M(p[2], g, f)
		this.M(p[3], e, h)
	}

	set25519(r: Int32Array, a: Int32Array): void {
		for (let i = 0; i < 16; i++) {
			r[i] = a[i]
		}
	}

	car25519(o: Int32Array): void {
		let i, v, c = 1
		for (i = 0; i < 16; i++) {
			v = o[i] + c + 65535
			c = Math.floor(v / 65536)
			o[i] = v - c * 65536
		}

		o[0] += c - 1 + 37 * (c - 1)
	}

	// b is 0 or 1
	sel25519(p: Int32Array, q: Int32Array, b: number): void {
		let i, t
		const c = ~(b - 1)
		for (i = 0; i < 16; i++) {
			t = c & (p[i] ^ q[i])
			p[i] ^= t
			q[i] ^= t
		}
	}

	inv25519(o: Int32Array, i: Int32Array): void {
		let a
		const c = this.gf()
		for (a = 0; a < 16; a++) {
			c[a] = i[a]
		}

		for (a = 253; a >= 0; a--) {
			this.S(c, c)
			if (a !== 2 && a !== 4) {
				this.M(c, c, i)
			}
		}

		for (a = 0; a < 16; a++) {
			o[a] = c[a]
		}
	}

	neq25519(a: Int32Array, b: Int32Array): boolean {
		const c = new Uint8Array(32), d = new Uint8Array(32)
		this.pack25519(c, a)
		this.pack25519(d, b)
		return !Util.compare(c, d)
	}

	par25519(a: Int32Array): number {
		const d = new Uint8Array(32)
		this.pack25519(d, a)
		return d[0] & 1
	}

	pow2523(o: Int32Array, i: Int32Array): void {
		let a
		const c = this.gf()
		for (a = 0; a < 16; a++) {
			c[a] = i[a]
		}

		for (a = 250; a >= 0; a--) {
			this.S(c, c)
			if (a !== 1) this.M(c, c, i)
		}

		for (a = 0; a < 16; a++) {
			o[a] = c[a]
		}
	}

	cswap(p: Int32Array[], q: Int32Array[], b: number): void {
		for (let i = 0; i < 4; i++) {
			this.sel25519(p[i], q[i], b)
		}
	}

	pack25519(o: Uint8Array, n: Int32Array): void {
		let i
		const m = this.gf()
		const t = this.gf()
		for (i = 0; i < 16; i++) {
			t[i] = n[i]
		}

		this.car25519(t)
		this.car25519(t)
		this.car25519(t)
		for (let j = 0; j < 2; j++) {
			m[0] = t[0] - 0xffed
			for (i = 1; i < 15; i++) {
				m[i] = t[i] - 0xffff - ((m[i - 1] >>> 16) & 1)
				m[i - 1] &= 0xffff
			}

			m[15] = t[15] - 0x7fff - ((m[14] >>> 16) & 1)
			const b = (m[15] >>> 16) & 1
			m[14] &= 0xffff
			this.sel25519(t, m, 1 - b)
		}

		for (i = 0; i < 16; i++) {
			o[2 * i] = t[i] & 0xff
			o[2 * i + 1] = t[i] >>> 8
		}
	}

	unpack25519(o: Int32Array, n: Uint8Array): void {
		for (let i = 0; i < 16; i++) {
			o[i] = n[2 * i] + (n[2 * i + 1] << 8)
		}

		o[15] &= 0x7fff
	}

	unpackNeg(r: Int32Array[], p: Uint8Array): number {
		const t = this.gf(),
			chk = this.gf(),
			num = this.gf(),
			den = this.gf(),
			den2 = this.gf(),
			den4 = this.gf(),
			den6 = this.gf()

		this.set25519(r[2], this.gf1)
		this.unpack25519(r[1], p)
		this.S(num, r[1])
		this.M(den, num, this.D)
		this.Z(num, num, r[2])
		this.A(den, r[2], den)

		this.S(den2, den)
		this.S(den4, den2)
		this.M(den6, den4, den2)
		this.M(t, den6, num)
		this.M(t, t, den)

		this.pow2523(t, t)
		this.M(t, t, num)
		this.M(t, t, den)
		this.M(t, t, den)
		this.M(r[0], t, den)

		this.S(chk, r[0])
		this.M(chk, chk, den)
		if (this.neq25519(chk, num)) {
			this.M(r[0], r[0], this.I)
		}

		this.S(chk, r[0])
		this.M(chk, chk, den)
		if (this.neq25519(chk, num)) {
			return -1
		}

		if (this.par25519(r[0]) === (p[31] >>> 7)) {
			this.Z(r[0], this.gf0, r[0])
		}

		this.M(r[3], r[0], r[1])

		return 0
	}

	/**
	 * Internal scalar mult function
	 * @param {Uint8Array} q Result
	 * @param {Uint8Array} s Secret key
	 * @param {Uint8Array} p Public key
	 */
	cryptoScalarmult(q: Uint8Array, s: Uint8Array, p: Uint8Array): void {
		const x = new Int32Array(80)
		let r, i
		const a = this.gf(), b = this.gf(), c = this.gf(),
			d = this.gf(), e = this.gf(), f = this.gf()

		this.unpack25519(x, p)
		for (i = 0; i < 16; i++) {
			b[i] = x[i]
			d[i] = a[i] = c[i] = 0
		}

		a[0] = d[0] = 1
		for (i = 254; i >= 0; --i) {
			r = (s[i >>> 3] >>> (i & 7)) & 1
			this.sel25519(a, b, r)
			this.sel25519(c, d, r)
			this.A(e, a, c)
			this.Z(a, a, c)
			this.A(c, b, d)
			this.Z(b, b, d)
			this.S(d, e)
			this.S(f, a)
			this.M(a, c, a)
			this.M(c, b, e)
			this.A(e, a, c)
			this.Z(a, a, c)
			this.S(b, a)
			this.Z(c, d, f)
			this.M(a, c, this._121665)
			this.A(a, a, d)
			this.M(c, c, a)
			this.M(a, d, f)
			this.M(d, b, x)
			this.S(b, e)
			this.sel25519(a, b, r)
			this.sel25519(c, d, r)
		}

		for (i = 0; i < 16; i++) {
			x[i + 16] = a[i]
			x[i + 32] = c[i]
			x[i + 48] = b[i]
			x[i + 64] = d[i]
		}

		const x32 = x.subarray(32)
		const x16 = x.subarray(16)
		this.inv25519(x32, x32)
		this.M(x16, x16, x32)
		this.pack25519(q, x16)
	}

	/**
	 * Generate the common key as the produkt of sk1 * pk2
	 * @param {Uint8Array} sk A 32 byte secret key of pair 1
	 * @param {Uint8Array} pk A 32 byte public key of pair 2
	 * @return {Uint8Array} sk * pk
	 */
	scalarMult(sk: Uint8Array, pk: Uint8Array) {
		const q = new Uint8Array(32)
		this.cryptoScalarmult(q, sk, pk)

		return q
	}

	/**
	 * Generate a curve 25519 keypair
	 * @param {Uint8Array} seed A 32 byte cryptographic secure random array. This is basically the secret key
	 * @param {Object} Returns sk (Secret key) and pk (Public key) as 32 byte typed arrays
	 */
	generateKeys(seed: Uint8Array): { sk: Uint8Array, pk: Uint8Array } {
		const sk = seed.slice()
		const pk = new Uint8Array(32)
		if (sk.length !== 32) {
			throw new Error('Invalid secret key size, expected 32 bytes')
		}

		sk[0] &= 0xf8
		sk[31] &= 0x7f
		sk[31] |= 0x40

		this.cryptoScalarmult(pk, sk, this._9)

		return {
			sk,
			pk,
		}
	}

}
