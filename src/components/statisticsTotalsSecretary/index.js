import React, {Component} from 'react';
import locales_es from "../../locales/es";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import AuthService from "../../modules/authService";
import ConfigService from "../../modules/configService";
import Raphael from "raphael";
import Spinner from "../spinner";

export default class StatisticsTotalsSecretary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            nextAppointments: null,
            consultingRoomOptions: []
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.dateTimeService = new DateTimeService();
        this.auth = new AuthService();
        this.configService = new ConfigService();

        window.Raphael = Raphael;
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.loadTotals();
    }

    loadTotals() {
        this.configService.getLocalClinicData().then(clinic => {
            this.api.getTotals({clinic_id: clinic.id}).then(res => {
                this.setState({
                    totals: res.data
                })
            }).catch(err => {
                alert(locales_es.errorModal.title + ': ' + this.helpers.getErrorMsg(err));
            })
        }).catch(err => {
            alert(locales_es.errorModal.title + ': ' + this.helpers.getErrorMsg(err));
        });
    }

    render() {

        const {totals} = this.state;

        return (
            <>
                <div className="kt-portlet kt-widget-14" id="kt_portlet">
                    <div className="kt-portlet__head kt-portlet__head--lg ">
                        <div className="kt-portlet__head-label">
												<span className="kt-portlet__head-icon">
													<i className="flaticon-calendar"/>
												</span>
                            <h3 className="kt-portlet__head-title">
                                {locales_es.totals}
                            </h3>
                        </div>
                    </div>
                    <div className="kt-widget-14__body p-3 justify-content-center">
                        {!totals ? <Spinner/>
                            :
                            <div className="kt-widget-14__data">
                                <div className="kt-widget-14__info">
                                    <div className="kt-widget-14__info-title">{totals.medics}</div>
                                    <div className="kt-widget-14__desc">{locales_es.medics}</div>
                                </div>
                                <div className="kt-widget-14__info">
                                    <div className="kt-widget-14__info-title">{totals.patients}</div>
                                    <div className="kt-widget-14__desc">{locales_es.patients}</div>
                                </div>
                                <div className="kt-widget-14__info">
                                    <div className="kt-widget-14__info-title kt-font-brand">{totals.appointments}</div>
                                    <div className="kt-widget-14__desc">{locales_es.appointments}</div>
                                </div>
                                <div className="kt-widget-14__data">
                                    <div className="kt-widget-14__info">
                                        <div className="kt-widget-14__info-title">{totals.appointments_average}</div>
                                        <div className="kt-widget-14__desc">{locales_es.appointments_average}</div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </>
        )
    }
}
