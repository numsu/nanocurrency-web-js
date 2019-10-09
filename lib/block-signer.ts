import BigNumber from 'bignumber.js'
import { Ed25519 } from './ed25519'
import { NanoAddress } from './nano-address'
import NanoConverter from './nano-converter'
import { Convert } from './util/convert'

const blake = require('blakejs')

export default class BlockSigner {

	nanoAddress = new NanoAddress()
	ed25519 = new Ed25519()

	preamble = 0x6.toString().padStart(64, '0')

	send(data: SendBlock, privateKey: string) {
		const balance = NanoConverter.convert(data.walletBalanceRaw, 'RAW', 'NANO')
		const newBalance = new BigNumber(balance).minus(new BigNumber(data.amount))
		const rawBalance = NanoConverter.convert(newBalance, 'NANO', 'RAW')
		const hexBalance = Convert.dec2hex(rawBalance, 16).toUpperCase()
		const account = this.nanoAddressToHexString(data.fromAddress)
		const link = this.nanoAddressToHexString(data.toAddress)
		const representative = this.nanoAddressToHexString(data.representativeAddress)

		const signatureBytes = this.ed25519.sign(
			this.generateHash(this.preamble, account, data.frontier, representative, hexBalance, link),
			Convert.hex2ab(privateKey))

		return {
			type: 'state',
			account: data.fromAddress,
			previous: data.frontier,
			representative: data.representativeAddress,
			balance: rawBalance,
			link,
			signature: Convert.ab2hex(signatureBytes),
			work: data.work,
		}
	}

	receive(data: ReceiveBlock, privateKey: string) {
		let balance = '0'
		if (data.walletBalanceRaw != '0') {
			balance = NanoConverter.convert(data.walletBalanceRaw, 'RAW', 'NANO')
		}

		const amountNano = NanoConverter.convert(data.amount, 'RAW', 'NANO')
		const newBalance = new BigNumber(balance).plus(new BigNumber(amountNano))
		const rawBalance = NanoConverter.convert(newBalance, 'NANO', 'RAW')
		const hexBalance = Convert.dec2hex(rawBalance, 16).toUpperCase()
		const account = this.nanoAddressToHexString(data.walletAddress)
		const representative = this.nanoAddressToHexString(data.representativeAddress)
		const link = data.hash

		const signatureBytes = this.ed25519.sign(
			this.generateHash(this.preamble, account, data.frontier, representative, hexBalance, link),
			Convert.hex2ab(privateKey))

		return {
			type: 'state',
			account: data.walletAddress,
			previous: data.frontier,
			representative: data.representativeAddress,
			balance: rawBalance,
			link,
			signature: Convert.ab2hex(signatureBytes),
			work: data.work,
		}
	}

	private generateHash(preamble: string, account: string, previous: string, representative: string, balance: string, link: string) {
		const ctx = blake.blake2bInit(32, undefined)
		blake.blake2bUpdate(ctx, Convert.hex2ab(preamble))
		blake.blake2bUpdate(ctx, Convert.hex2ab(account))
		blake.blake2bUpdate(ctx, Convert.hex2ab(previous))
		blake.blake2bUpdate(ctx, Convert.hex2ab(representative))
		blake.blake2bUpdate(ctx, Convert.hex2ab(balance))
		blake.blake2bUpdate(ctx, Convert.hex2ab(link))
		return blake.blake2bFinal(ctx)
	}

	private nanoAddressToHexString(addr: string): string {
		addr = addr.slice(-60)
		const isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(addr)
		if (isValid) {
			const keyBytes = this.nanoAddress.decodeNanoBase32(addr.substring(0, 52))
			const hashBytes = this.nanoAddress.decodeNanoBase32(addr.substring(52, 60))
			const blakeHash = blake.blake2b(keyBytes, undefined, 5).reverse()
			if (Convert.ab2hex(hashBytes) == Convert.ab2hex(blakeHash)) {
				const key = Convert.ab2hex(keyBytes).toUpperCase()
				return key
			}
			throw 'Checksum mismatch'
		} else {
			throw 'Illegal characters'
		}
	}

}

export interface SendBlock {
	walletBalanceRaw: string
	fromAddress: string
	toAddress: string
	representativeAddress: string
	frontier: string
	amount: string
	work: string
}

export interface ReceiveBlock {
	walletBalanceRaw: string
	walletAddress: string
	representativeAddress: string
	frontier: string
	hash: string
	amount: string
	work: string
}
