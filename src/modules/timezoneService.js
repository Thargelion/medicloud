import APIService from "./apiService";

export default class TimezoneService {

    constructor(){
        this.api = new APIService();
    }

    async getRemoteParsedTimezones() {
        return new Promise((resolve, reject) => {
            this.api.getTimezones().then(res => {
                const result = Object.keys(res.data).map((key) => {
                    return (
                        {
                            'value': key,
                            'label': key + ' ' + res.data[key],
                        }
                    )
                });
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
}
