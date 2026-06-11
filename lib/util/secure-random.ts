import Convert from './convert'

interface CryptoWithGetRandomValues {
	getRandomValues<T extends Uint8Array>(array: T): T
}

const getCrypto = (): CryptoWithGetRandomValues | undefined => {
	const runtimeCrypto = typeof globalThis !== 'undefined' ? (globalThis as { crypto?: CryptoWithGetRandomValues }).crypto : undefined
	if (runtimeCrypto && typeof runtimeCrypto.getRandomValues === 'function') {
		return runtimeCrypto
	}

	if (typeof process !== 'undefined' && process.versions && process.versions.node) {
		try {
			const nodeCrypto = eval('require')('crypto') as {
				webcrypto?: CryptoWithGetRandomValues,
				randomBytes?: (size: number) => Uint8Array,
			}
			if (nodeCrypto.webcrypto && typeof nodeCrypto.webcrypto.getRandomValues === 'function') {
				return nodeCrypto.webcrypto
			}
			if (nodeCrypto.randomBytes) {
				return {
					getRandomValues<T extends Uint8Array>(array: T): T {
						array.set(nodeCrypto.randomBytes(array.length))
						return array
					},
				}
			}
		} catch (error) {
			return undefined
		}
	}

	return undefined
}

export const randomBytes = (length: number): Uint8Array => {
	const crypto = getCrypto()
	if (!crypto) {
		throw new Error('Secure random bytes are not available in this environment. Please provide entropy through the existing wallet generation interface.')
	}

	return crypto.getRandomValues(new Uint8Array(length))
}

export const randomHex = (length: number): string => {
	try {
		return Convert.ab2hex(randomBytes(length).buffer)
	} catch (error) {
		throw new Error('Secure random entropy is not available in this environment. Please provide entropy through the existing wallet generation interface.')
	}
}
