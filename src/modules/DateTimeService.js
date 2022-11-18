/*
* DateTime utilities for common use across the app
* */
import {DEFAULT_TIME_ZONE} from "../models/constants";

export default class DateTimeService {

    /*
    * Method to find out if the user agent is an Apple Device
    * */
    isAppleDevice() {
        return (navigator.userAgent.match(/(iPhone|iPod|iPad|Safari)/) != null);
    }

    /*
    * Takes an Integer and returns a String as a "24hs." format.
    * */
    getTwentyFourFormatAsString(int) {
        return String(int < 10 ? "0" + int : int);
    }

    /*
    * Method to convert a date object and prevent a Safari bug
    * */
    safariConvertionDateFormat(date) {
        return date; // deshabilito esto porque no sé bien qué fixeaba y ahora está rompiendo :)
        // Creo que era cuando usábamos fechas en string. Ahora ya no deberían suceder estas cosas
        /*
        if (!date || date instanceof Date) return;
        const dateParts = date.substring(0,10).split('-');
        const timePart = date.substr(11);
        date = dateParts[1] + '/' + dateParts[2] + '/' + dateParts[0] + ' ' + timePart;
        return date;
        */
    }

    /*
    * Method to find out if the user agent is an Apple Device
    * */
    convertDate(date) {
        if(date && this.isAppleDevice()){
            date = this.safariConvertionDateFormat(date);
        }
        return new Date(date);
    }

    /*
    * Method to convert a date to a specified Timezone
    * */
    _convertTZ(date, tzString) {
        /*const parsedDate = (typeof date === "string" ? new Date(date) : date);
        parsedDate.toLocaleString("en-US", {timeZone: tzString});
        return parsedDate;*/
        const parsedDate = (typeof date === "string" ? new Date(date) : date);

        // https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone
        // suppose the date is 12:00 UTC
        const invdate = new Date(parsedDate.toLocaleString('en-US', {
            timeZone: tzString
        }));

        // then invdate will be 07:00 in Toronto
        // and the diff is 5 hours
        const diff = parsedDate.getTime() - invdate.getTime();

        // so 12:00 in Toronto is 17:00 UTC
        return new Date(parsedDate.getTime() - diff); // needs to substract
    }

    /*
    * Method to convert a date to a specified Timezone
    * */
    convertTZ(eventDate, tzString) {
        if(this.isAppleDevice()){
            eventDate = this.safariConvertionDateFormat(eventDate);
        }

        // const date = new Date(eventDate);
        // const date = this._convertTZ(new Date(eventDate), DEFAULT_TIME_ZONE);
        const date = this._convertTZ(eventDate, tzString);
        return date;
    }

    /*
    * Method to get a date object of the start of the given day
    * */
    getDateStartOfDay(date, utcOn) {
        // console.log('getDateEndOfDay');
        if(utcOn) {
            date.setUTCHours(0);
            date.setUTCMinutes(0);
            date.setUTCSeconds(0);
        } else {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
        }
        return date;
    }

    /*
    * Method to get a date object of the end of the given day
    * */
    getDateEndOfDay(date, utcOn) {
        // console.log('getDateEndOfDay');
        if(utcOn) {
            date.setUTCHours(23);
            date.setUTCMinutes(59);
            date.setUTCSeconds(59);
        } else {
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
        }
        return date;
    }

    /*
    * TIME HTML PARSING
    * Takes a event date and returns it as a parsed custom html format output
    * * only:string ['full-string']
    * */
    parseEventTime(eventDate, /*string*/only) {
        if(this.isAppleDevice()){
            eventDate = this.safariConvertionDateFormat(eventDate);
        }

        // const date = new Date(eventDate);
        // const date = this._convertTZ(new Date(eventDate), DEFAULT_TIME_ZONE);
        const date = this._convertTZ(eventDate, DEFAULT_TIME_ZONE);

        let htmlResult = '';

        const hours = this.getTwentyFourFormatAsString(date.getHours());
        const minutes = this.getTwentyFourFormatAsString(date.getMinutes());

        const parsedTime = this.parseTime(hours + ':' + minutes, false, true);

        if(only === 'full-string') {
            return parsedTime.hours + ':' + parsedTime.minutes;
        }

        htmlResult += '<span class="hours">' + parsedTime.hours + '</span>';
        htmlResult += '<span class="minutes">:' + parsedTime.minutes + '</span>';

        return htmlResult;
    }

    /*
    * DATE HTML PARSING
    * Takes a event date and returns it as a parsed custom html format output
    * only:string ['day','month','year','full-string']
    * */
    parseEventDate(eventDate, shortMode, /*string*/only) {

        if(!eventDate) {
            return;
        }

        if(this.isAppleDevice()){
            eventDate = this.safariConvertionDateFormat(eventDate);
        }

        // const date = new Date(eventDate);
        // const date = this._convertTZ(new Date(eventDate), DEFAULT_TIME_ZONE);
        const date = this._convertTZ(eventDate, DEFAULT_TIME_ZONE);

        let htmlResult = '';

        let monthMatch = {};

        if(shortMode){
            monthMatch = {
                'Ene' : 0,
                'Feb' : 1,
                'Mar' : 2,
                'Abr' : 3,
                'May' : 4,
                'Jun' : 5,
                'Jul' : 6,
                'Ago' : 7,
                'Sep' : 8,
                'Oct' : 9,
                'Nov' : 10,
                'Dic' : 11
            };
        } else {
            monthMatch = {
                'Enero' : 0,
                'Febrero' : 1,
                'Marzo' : 2,
                'Abril' : 3,
                'Mayo' : 4,
                'Junio' : 5,
                'Julio' : 6,
                'Agosto' : 7,
                'Septiembre' : 8,
                'Octubre' : 9,
                'Noviembre' : 10,
                'Diciembre' : 11
            };
        }

        let month = date.getMonth();

        Object.keys(monthMatch).map((key) => {
           if(month === monthMatch[key]) {
               month = key;
           }
           return key;
        });

        const day = date.getDate();
        const year = date.getFullYear();

        var days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        var dayName = days[date.getDay()];

        // oNLY
        if(only){
            switch (only) {
                case 'day':
                    return day;
                case 'month':
                    return month;
                case 'year':
                    return year;
                case 'simple-string':
                    return day + '/' + month + '/' + year;
                case 'full-string':
                    return dayName + ' ' + day + ' de ' + month + ' de ' + year;
                default :
                    return new Error('Unexpected ');
            }
        }
        // Only


        if(typeof month === 'string' && shortMode){
            htmlResult += '<span class="month">' + month + '</span>';
        }

        htmlResult += '<span class="dayName">';
        htmlResult += dayName;
        htmlResult += '</span>';

        htmlResult += '<span class="day">';
        //htmlResult += getTwentyFourFormatAsString(date.getDate()); // Este metodo, y mismo el forEach para definir el mes, deberia estar en un helper
        htmlResult += day; // Este metodo, y mismo el forEach para definir el mes, deberia estar en un helper
        htmlResult += '</span>';

        if(typeof month === 'string' && !shortMode){
            htmlResult += '<span class="month">de ' + month + '</span>';
        }

        htmlResult += '<span class="year">';
        htmlResult += year;
        htmlResult += '</span>';

        return '<div class="medicloud-datetime-container">' + htmlResult + '</div>';

    }

    /*
    * Utility to get time remaining of a given event date
    * Takes a event date and returns it as a JSON object
    * */
    getTimeRemaining(endDate, asNumber){

        if(this.isAppleDevice()){
            endDate = this.safariConvertionDateFormat(endDate);
        }

        const t = Date.parse(endDate) - Date.parse(new Date());
        const seconds = Math.floor( (t/1000) % 60 );
        const minutes = Math.floor( (t/1000/60) % 60 );
        const hours = Math.floor( (t/(1000*60*60)) % 24 );
        const days = Math.floor( t/(1000*60*60*24) );
        return {
            'total': t,
            'days': asNumber ? days : String(days),
            'hours': asNumber ? hours : this.getTwentyFourFormatAsString(hours),
            'minutes': asNumber ? minutes : this.getTwentyFourFormatAsString(minutes),
            'seconds': asNumber ? seconds : this.getTwentyFourFormatAsString(seconds)
        };
    }

    /*
    * Takes a time string and returns it as a JSON object
    * */
    parseTime(timeToParse, isAmPm, hasToAddStrings){

        if(!timeToParse) { return {}; }

        // Ejemplo de un string de tiempo: "09:00:00"
        const hours = timeToParse.substr(0,2); // 09
        const minutes = timeToParse.substr(3,2); // 00
        if(isAmPm){
            const ampm = hasToAddStrings ? hours > 11 ? ' PM' : ' AM' : '';
            return {
                'hours' : (hours % 12 || 12), // converts to correct hours am/pm,
                'minutes' : minutes + ampm
            };
        } else {
            const hs = hasToAddStrings ? 'hs.' : '';
            return {
                'hours' : hours,
                'minutes' : minutes + hs
            };
        }

    }

    /*
    * Number.toFixed custom dynamic implementation
    * */
    toFixed(number, decimalPlaces){
        return number.toFixed(decimalPlaces);
    }

    /*
    * To convert 'dd-mm-yyyy' to Date()
    * */
    parseStringDateToAPIStringDate(str){
        if(!str) {
            return;
        }
        const strCopy = str.slice(); // method to "clone"
        const strParts = strCopy.split('/');
        const parsedDate = strParts[2] + '-' + strParts[1] + '-' + strParts[0] + 'T12:00:00.000Z';
        return parsedDate;
    }

    /*
    * To convert 'dd-mm-yyyy' to Date()
    * */
    parseAPIStringDateToBootstrapCalendarStr(str){
        if(!str) {
            return;
        }
        const strCopy = str.slice(); // method to "clone"
        const strParts = strCopy.split('-');
        const parsedDate = strParts[2] + '/' + strParts[1] + '/' + strParts[0];
        return parsedDate;
    }

    /*
    * To convert Date() to 'dd/mm/yyyy'
    * */
    parseDateToConventionalAPIString(date){
        if(!date) {
            return;
        }
        const parsedDate = this.getTwentyFourFormatAsString(date.getDate()) + '/'
            + this.getTwentyFourFormatAsString(Number(date.getMonth() + 1))
            + '/' + date.getFullYear();
        return parsedDate;
    }

    /*
    * To convert Date() to 'yyyy-mm-dd'
    * */
    parseDateToAPIString(date){
        if(!date) {
            return;
        }
        const parsedDate = date.getFullYear() + '-'
            + this.getTwentyFourFormatAsString(Number(date.getMonth() + 1))
            + '-' + this.getTwentyFourFormatAsString(date.getDate());
        return parsedDate;
    }

    /*
    * To convert 'yyyy-mm-dd' to Date()
    * */
    parseAPIStringToDate(str){
        if(!str) {
            return;
        }
        const parsedDate = new Date();
        const strCopy = str.slice(); // method to "clone"
        const strParts = strCopy.split('-');
        parsedDate.setUTCFullYear(Number(strParts[0]));
        parsedDate.setUTCMonth(Number(strParts[1]) - 1);
        parsedDate.setUTCDate(Number(strParts[2]));
        parsedDate.setUTCHours(12);
        parsedDate.setUTCMinutes(0);
        parsedDate.setUTCSeconds(0);
        return parsedDate;
    }

    /*
    * To get the difference between two given dates (Date, Date)
    * */
    diffTwoDates(date1, date2) {
        const diffTime = Math.abs(date2 - date1);
        return {
            time: diffTime,
            days: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
        }
    }
}
