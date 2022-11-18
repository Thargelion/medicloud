import locales_es from "../locales/es";
import {USER_TYPE_PATIENT} from "../models/constants";

class ViewHelpers {

	// mode: 'patient' (USER_TYPE_PATIENT)
	getTimetablePricesText(timetable, mode) {
		let prices = '';

		if(timetable.prices && timetable.prices.length) {
			timetable.prices.map((p, i) => {
				prices += `${locales_es.currency_sign}${p.price}`;
				if ((i + 1) < timetable.prices.length) {
					prices += ' - ';
				}
			})
		} else if (mode === USER_TYPE_PATIENT) {
			prices += `${locales_es.consult}`;
		} else {
			prices += `${locales_es.currency_sign}${locales_es.notDefined}`;
		}
		return prices
	}

}

export default ViewHelpers;
