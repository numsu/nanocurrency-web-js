import BigNumber from 'bignumber.js'

export default class NanoConverter {

	/**
	 * Converts the input value to the wanted unit
	 *
	 * @param input {BigNumber} value
	 * @param inputUnit {Unit} the unit to convert from
	 * @param outputUnit {Unit} the unit to convert to
	 */
	static convert(input: BigNumber, inputUnit: string, outputUnit: string): string {
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
				throw `Unkown input unit ${inputUnit}, expected one of the following: RAW, NANO, MRAI, KRAI, RAI`
		}

		switch (outputUnit) {
			case 'RAW':
				return value.toFixed(0)
			case 'NANO':
			case 'MRAI':
				return value.shiftedBy(-30).toFixed(15, 1)
			case 'KRAI':
				return value.shiftedBy(-27).toFixed(12, 1)
			case 'RAI':
				return value.shiftedBy(-24).toFixed(9, 1)
			default:
				throw `Unknown output unit ${outputUnit}, expected one of the following: RAW, NANO, MRAI, KRAI, RAI`
		}
	}

}
