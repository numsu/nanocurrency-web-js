import BigNumber from 'bignumber.js'

export type Unit = 'RAW' | 'NANO'

export default class NanoConverter {

	/**
	 * Converts the input value to the wanted unit
	 *
	 * @param input {string | BigNumber} value
	 * @param inputUnit {Unit} the unit to convert from
	 * @param outputUnit {Unit} the unit to convert to
	 */
	static convert = (input: string | BigNumber, inputUnit: Unit, outputUnit: Unit): string => {
		let value = new BigNumber(input.toString())

		switch (inputUnit) {
			case 'RAW':
				break
			case 'NANO':
				value = value.shiftedBy(30)
				break
			default:
				throw new Error(`Unkown input unit ${inputUnit}, expected one of the following: RAW, NANO`)
		}

		switch (outputUnit) {
			case 'RAW':
				return value.toFixed(0)
			case 'NANO':
				return value.shiftedBy(-30).toFixed(30, 1)
			default:
				throw new Error(`Unknown output unit ${outputUnit}, expected one of the following: RAW, NANO`)
		}
	}

}
