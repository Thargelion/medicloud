class Helpers {

	validateEmail(email) {
		// eslint-disable-next-line
		let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/;
		return reg.test(email);
	}

	/*
	* Takes an Integer and returns a String as a "24hs." format.
	* */
	getTwentyFourFormatAsString(int) {
		return String(int < 10 ? "0" + int : int);
	}

	/*
	* TIME HTML PARSING
	* Takes a event date and returns it as a parsed custom html format output
	* */
	parseEventTime(eventDate, isAmPm, hasToAddStrings, utcOn) {
		const date = new Date(eventDate);

		let result = '';

		const hours = this.getTwentyFourFormatAsString(utcOn ? date.getUTCHours() : date.getHours());
		const minutes = this.getTwentyFourFormatAsString(utcOn ? date.getUTCMinutes() : date.getMinutes());

		const parsedTime = this.parseTime(hours + ':' + minutes, isAmPm, hasToAddStrings);

		result += parsedTime.hours + '';
		result += ':' + parsedTime.minutes;

		return result;
	}

	/*
	* Takes a time string and returns it as a JSON object
	* */
	parseTime(timeToParse, isAmPm, hasToAddStrings) {

		if (!timeToParse) {
			return {};
		}

		// Ejemplo de un string de tiempo: "09:00:00"
		const hours = timeToParse.substr(0, 2); // 09
		const minutes = timeToParse.substr(3, 2); // 00
		if (isAmPm) {
			const ampm = hasToAddStrings ? hours > 11 ? ' PM' : ' AM' : '';
			return {
				'hours': (hours % 12 || 12), // converts to correct hours am/pm,
				'minutes': minutes + ampm
			};
		} else {
			const hs = hasToAddStrings ? 'hs.' : '';
			return {
				'hours': hours,
				'minutes': minutes + hs
			};
		}

	}

	/*
	*
	* Utility to get ErrorMessages from ApiService responses
	 */
	getErrorMsg(err) {
		if(err.response && err.response.status && err.response.status === 500) {
			return 'Contáctate con el administrador por favor para que podamos ayudarte.'
		}
		return err.response && err.response.data && err.response.data.message
			? err.response.data.message : err.message;
	}

	goBack() {
		window.history.back();
	}

	/*
	*
	* Method to detect mobile devices
	 */
	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
}

//unregister();

export default Helpers;
