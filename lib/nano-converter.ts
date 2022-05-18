import BigNumber from 'bignumber.js'

export type Unit = 'raw' | 'nano'

export default class NanoConverter {

	/**
	 * Converts the input value to the wanted unit
	 *
	 * @param input {string | BigNumber} value
	 * @param inputUnit {string} the unit to convert from
	 * @param outputUnit {string} the unit to convert to
	 */
	static convert = (input: string | BigNumber, inputUnit: Unit, outputUnit: Unit): string => {
		let value = new BigNumber(input.toString())

		switch (inputUnit) {
			case 'raw':
				value = value
				break
			case 'nano':
				value = value.shiftedBy(30)
				break
			default:
				throw new Error(`Unkown input unit ${inputUnit}, expected one of the following: raw, nano`)
		}

		switch (outputUnit) {
			case 'raw':
				return value.toFixed(0)
			case 'nano':
				return value.shiftedBy(-30).toFixed(30, 1)
			default:
				throw new Error(`Unknown output unit ${outputUnit}, expected one of the following: raw, nano`)
		}
	}

}
