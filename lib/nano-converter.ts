import BigNumber from 'bignumber.js'

export default class NanoConverter {

	/**
	 * Converts the input value to the wanted unit
	 *
	 * @param input {string | BigNumber} value
	 * @param inputUnit {string} the unit to convert from
	 * @param outputUnit {string} the unit to convert to
	 */
	static convert = (input: string | BigNumber, inputUnit: string, outputUnit: string): string => {
		let value = new BigNumber(input.toString())

		switch (inputUnit) {
			case 'RAW':
				value = value
				break
			case 'NANO':
			case 'MRAI':
				value = value.shiftedBy(30)
				break
			case 'KRAI':
				value = value.shiftedBy(27)
				break
			case 'RAI':
				value = value.shiftedBy(24)
				break
			default:
				throw new Error(`Unkown input unit ${inputUnit}, expected one of the following: RAW, NANO, MRAI, KRAI, RAI`)
		}

		switch (outputUnit) {
			case 'RAW':
				return value.toFixed(0)
			case 'NANO':
			case 'MRAI':
				return value.shiftedBy(-30).toFixed(30, 1)
			case 'KRAI':
				return value.shiftedBy(-27).toFixed(27, 1)
			case 'RAI':
				return value.shiftedBy(-24).toFixed(24, 1)
			default:
				throw new Error(`Unknown output unit ${outputUnit}, expected one of the following: RAW, NANO, MRAI, KRAI, RAI`)
		}
	}

}
