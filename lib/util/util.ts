export default class Util {

	/**
	 * Time constant comparison of two arrays
	 *
	 * @param {Uint8Array} lh First array of bytes
	 * @param {Uint8Array} rh Second array of bytes
	 * @return {Boolean} True if the arrays are equal (length and content), false otherwise
	 */
	static compare(lh: Uint8Array, rh: Uint8Array): boolean {
		if (lh.length !== rh.length) {
			return false
		}

		let i
		let d = 0
		const len = lh.length

		for (i = 0; i < len; i++) {
			d |= lh[i] ^ rh[i]
		}

		return d === 0
	}

	static normalizeUTF8 = (str: string): string => {
		return str ? str.normalize('NFKD') : ''
	}

}
