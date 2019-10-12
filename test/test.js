'use strict'

const expect = require('chai').expect
const { wallet, block } = require('../dist/index')

// WARNING: Do not send any funds to the test vectors below
describe('generate wallet test', () => {

	it('should generate wallet with random entropy', () => {
		const result = wallet.generate()
		expect(result).to.have.own.property('mnemonic')
		expect(result).to.have.own.property('seed')
		expect(result).to.have.own.property('accounts')
	})

	it('should generate the correct wallet with the given test vector', () => {
		const result = wallet.generate('6caf5a42bb8074314aae20295975ece663be7aad945a73613d193b0cc41c7970')
		expect(result).to.have.own.property('mnemonic')
		expect(result).to.have.own.property('seed')
		expect(result).to.have.own.property('accounts')
		expect(result.mnemonic).to.equal('hole kiss mouse jacket also board click series citizen slight kite smoke desk diary rent mercy inflict antique edge invite slush athlete total brain')
		expect(result.seed).to.equal('1accdd4c25e06e47310d0c62c290ec166071d024352e003e5366e8ba6ba523f2a0cb34116ac55a238a886778880a9b2a547112fd7cffade81d8d8d084ccb7d36')
		expect(result.accounts[0].privateKey).to.equal('eb18b748bcc48f824cf8a1fe92f7fc93bfc6f2a1eb9c1d40fa26d335d8a0c30f')
		expect(result.accounts[0].publicKey).to.equal('a9ef7bbc004813cf75c5fc5c582066182d5c9cffd42eb7eb81cefea8e78c47c5')
		expect(result.accounts[0].address).to.equal('nano_3chhhgy11k1msxtwdz4wd1i8e83fdkghzo3gpzor5mqyo5mrrjy79zpw1g34')
	})

	it('should generate the correct wallet with the given test vector and a seed password', () => {
		// Using the same entropy as before, but a different password
		const result = wallet.generate('6caf5a42bb8074314aae20295975ece663be7aad945a73613d193b0cc41c7970', 'some password')
		expect(result).to.have.own.property('mnemonic')
		expect(result).to.have.own.property('seed')
		expect(result).to.have.own.property('accounts')

		// Should result in the same mnemonic, but different seed and account
		expect(result.mnemonic).to.equal('hole kiss mouse jacket also board click series citizen slight kite smoke desk diary rent mercy inflict antique edge invite slush athlete total brain')
		expect(result.seed).to.not.equal('1accdd4c25e06e47310d0c62c290ec166071d024352e003e5366e8ba6ba523f2a0cb34116ac55a238a886778880a9b2a547112fd7cffade81d8d8d084ccb7d36')
		expect(result.accounts[0].privateKey).to.not.equal('eb18b748bcc48f824cf8a1fe92f7fc93bfc6f2a1eb9c1d40fa26d335d8a0c30f')
		expect(result.accounts[0].publicKey).to.not.equal('a9ef7bbc004813cf75c5fc5c582066182d5c9cffd42eb7eb81cefea8e78c47c5')
		expect(result.accounts[0].address).to.not.equal('nano_3chhhgy11k1msxtwdz4wd1i8e83fdkghzo3gpzor5mqyo5mrrjy79zpw1g34')

		expect(result.seed).to.equal('146e3e2a0530848c9174d45ecec8c3f74a7be3f1ee832f92eb6227284121eb2e48a6b8fc469403984cd5e8f0d1ed05777c78f458d0e98c911841590e5d645dc3')
		expect(result.accounts[0].privateKey).to.equal('2d5851bd5a89b8c943078be6ad5bbee8aeab77d6a4744c20d1b87d78e3286b93')
		expect(result.accounts[0].publicKey).to.equal('923b6c7e281c1c5529fd2dc848117781216a1753cfd487fc34009f3591e636d7')
		expect(result.accounts[0].address).to.equal('nano_36jufjz4i91wcnnztdgab1aqh1b3fado9mynizy5a16z8payefpqo81zsshc')
	})

	it('should throw when given an entropy with an invalid length', () => {
		expect(() => wallet.generate('6caf5a42bb8074314aae20295975ece663be7aad945a73613d193b0cc41c797')).to.throw(Error)
		expect(() => wallet.generate('6caf5a42bb8074314aae20295975ece663be7aad945a73613d193b0cc41c79701')).to.throw(Error)
	})

	it('should throw when given an entropy containing non-hex characters', () => {
		expect(() => wallet.generate('6gaf5a42bb8074314aae20295975ece663be7aad945a73613d193b0cc41c7970')).to.throw(Error)
	})

})

// Test vectors from https://docs.nano.org/integration-guides/key-management/
describe('import wallet with official test vectors test', () => {

	it('should successfully import a wallet with the official Nano test vectors mnemonic', () => {
		const result = wallet.fromMnemonic(
			'edge defense waste choose enrich upon flee junk siren film clown finish luggage leader kid quick brick print evidence swap drill paddle truly occur',
			'some password')
		expect(result).to.have.own.property('mnemonic')
		expect(result).to.have.own.property('seed')
		expect(result).to.have.own.property('accounts')
		expect(result.mnemonic).to.equal('edge defense waste choose enrich upon flee junk siren film clown finish luggage leader kid quick brick print evidence swap drill paddle truly occur')
		expect(result.seed).to.equal('0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310c')
		expect(result.accounts[0].privateKey).to.equal('3be4fc2ef3f3b7374e6fc4fb6e7bb153f8a2998b3b3dab50853eabe128024143')
		expect(result.accounts[0].publicKey).to.equal('5b65b0e8173ee0802c2c3e6c9080d1a16b06de1176c938a924f58670904e82c4')
		expect(result.accounts[0].address).to.equal('nano_1pu7p5n3ghq1i1p4rhmek41f5add1uh34xpb94nkbxe8g4a6x1p69emk8y1d')
	})

	it('should successfully import a wallet with the official Nano test vectors seed', () => {
		const result = wallet.fromSeed('0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310c')
		expect(result).to.have.own.property('mnemonic')
		expect(result).to.have.own.property('seed')
		expect(result).to.have.own.property('accounts')
		expect(result.mnemonic).to.be.undefined
		expect(result.seed).to.equal('0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310c')
		expect(result.accounts[0].privateKey).to.equal('3be4fc2ef3f3b7374e6fc4fb6e7bb153f8a2998b3b3dab50853eabe128024143')
		expect(result.accounts[0].publicKey).to.equal('5b65b0e8173ee0802c2c3e6c9080d1a16b06de1176c938a924f58670904e82c4')
		expect(result.accounts[0].address).to.equal('nano_1pu7p5n3ghq1i1p4rhmek41f5add1uh34xpb94nkbxe8g4a6x1p69emk8y1d')
	})

	it('should throw when given a seed with an invalid length', () => {
		expect(() => wallet.generate('0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310')).to.throw(Error)
		expect(() => wallet.generate('0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310cd')).to.throw(Error)
	})

	it('should throw when given a seed containing non-hex characters', () => {
		expect(() => wallet.generate('0gc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310c')).to.throw(Error)
	})

})

describe('derive more accounts from the same seed test', () => {

	it('should derive accounts from the given seed', () => {
		const result = wallet.accounts(
			'0dc285fde768f7ff29b66ce7252d56ed92fe003b605907f7a4f683c3dc8586d34a914d3c71fc099bb38ee4a59e5b081a3497b7a323e90cc68f67b5837690310c',
			0, 14)
		expect(result.length).to.equal(15)
		expect(result[0].privateKey).to.equal('3be4fc2ef3f3b7374e6fc4fb6e7bb153f8a2998b3b3dab50853eabe128024143')
		expect(result[0].publicKey).to.equal('5b65b0e8173ee0802c2c3e6c9080d1a16b06de1176c938a924f58670904e82c4')
		expect(result[0].address).to.equal('nano_1pu7p5n3ghq1i1p4rhmek41f5add1uh34xpb94nkbxe8g4a6x1p69emk8y1d')
		expect(result[14].privateKey).to.equal('5f12e37c64daf2501c6a6a20614fd8d977fed65b5b5f0b045ec997f2ed2f53ca')
		expect(result[14].publicKey).to.equal('f93a61018e07825a095e8cf7bdce9242e9c12c5c41a55de597a2be93fa41306b')
		expect(result[14].address).to.equal('nano_3ybte61rw3w4da6ox59qqq9b6iqbr6p7rif7dqkshaoykhx64e5dbp4o1ua1')
	})

})

// Test vectors from https://docs.nano.org/integration-guides/key-management/
describe('block signing tests using official test vectors', () => {

	it('should create a valid signature for a receive block', () => {
		const result = block.sign({
			walletBalanceRaw: '18618869000000000000000000000000',
			fromAddress: 'nano_1e5aqegc1jb7qe964u4adzmcezyo6o146zb8hm6dft8tkp79za3sxwjym5rx',
			toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			amountRaw: '7000000000000000000000000000000',
			work: 'c5cf86de24b24419',
		}, '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3')
		expect(result.signature.toUpperCase()).to.equal('EEFFE1EFCCC8F2F6F2F1B79B80ABE855939DD9D6341323186494ADEE775DAADB3B6A6A07A85511F2185F6E739C4A54F1454436E22255A542ED879FD04FEED001')
	})

	it('should create a valid signature for a send block', () => {
		const result = block.sign({
			walletBalanceRaw: '5618869000000000000000000000000',
			fromAddress: 'nano_1e5aqegc1jb7qe964u4adzmcezyo6o146zb8hm6dft8tkp79za3sxwjym5rx',
			toAddress: 'nano_1q3hqecaw15cjt7thbtxu3pbzr1eihtzzpzxguoc37bj1wc5ffoh7w74gi6p',
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			amountRaw: '2000000000000000000000000000000',
			work: 'fbffed7c73b61367',
		}, '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3')
		expect(result.signature.toUpperCase()).to.equal('79240D56231EF1885F354473733AF158DC6DA50E53836179565A20C0BE89D473ED3FF8CD11545FF0ED162A0B2C4626FD6BF84518568F8BB965A4884C7C32C205')
	})

	it('should create a valid signature for a change rep block', () => {
		const result = block.representative({
			walletBalanceRaw: '3000000000000000000000000000000',
			address: 'nano_3igf8hd4sjshoibbbkeitmgkp1o6ug4xads43j6e4gqkj5xk5o83j8ja9php',
			representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs',
			frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',
			work: '0000000000000000',
		}, '781186FB9EF17DB6E3D1056550D9FAE5D5BBADA6A6BC370E4CBB938B1DC71DA3') // Did not find a private key at nano docs for this address
		expect(result.signature.toUpperCase()).to.equal('A3C3C66D6519CBC0A198E56855942DEACC6EF741021A1B11279269ADC587DE1DA53CD478B8A47553231104CF24D742E1BB852B0546B87038C19BAE20F9082B0D')
	})

})
