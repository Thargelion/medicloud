import React, {Component} from "react";
import locales_es from "../../locales/es";
import DateTimeService from "../../modules/DateTimeService";
import Rodal from "rodal";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import {
    APPOINTMENT_MIXED_TYPE,
    APPOINTMENT_VIRTUAL_TYPE,
} from "../../models/constants";
import ConfigService from "../../modules/configService";

export default class TimetablesTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            selectedTimetableId: null,
        };

        this.dateTimeService = new DateTimeService();
        this.api = new APIService();
        this.helpers = new Helpers();
        this.configService = new ConfigService();
    }

    /* MODAL Functions */
    showModal(id) {
        this.setState({
            selectedTimetableId: id
        }, () => {
            this.show();
        })
    }

    show() {
        this.setState({modalVisible: true});
    }

    hide() {
        this.setState({modalVisible: false});
    }

    //

    cancelAppointment() {
        this.hide();
        this.api.deleteTimetables(this.state.selectedTimetableId).then(res => {
            this.props.showMainModal(locales_es.successModal.title, res.message);
            this.props.refresh();
        }).catch(err => {
            this.hide();
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    getTimezoneLabel(timezoneOptions, time_zone) {
        const filtered = timezoneOptions.filter(tz => tz.value === time_zone);

        if (filtered && filtered.length) {
            const label = filtered[0].label.split(')')[0];
            return (label + ')');
            // return filtered[0].label
        }
        return '';
    }

    render() {

        const {timetables, showDelete, timezoneOptions} = this.props;

        return (
            <div className="table-responsive">
                <table className="table">
                    <thead>
                    <tr>
                        <th>{locales_es.date}</th>
                        <th className="d-none d-sm-table-cell">{locales_es.appointmentDuration}</th>
                        <th className="d-none d-sm-table-cell">{locales_es.appointmentType}</th>
                        {/*<th className="d-none d-sm-table-cell">{locales_es.attentionAddress}</th>*/}
                        {(showDelete) && <th scope="col">{locales_es.actions}</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {timetables.map((timetable, index) => {
                        return (
                            <tr key={'timetable-' + index} data-row="0" className="kt-datatable__row">
                                <td className="kt-datatable__cell align-middle" data-hj-allow>
                                    <span data-hj-allow dangerouslySetInnerHTML={
                                        {
                                            __html: this.dateTimeService.parseEventDate(timetable.start_date, false)
                                        }
                                    }/>&nbsp;
                                    {timetable.start}&nbsp;-&nbsp;{timetable.end}
                                    <div></div>
                                    {(timetable.type_id === APPOINTMENT_VIRTUAL_TYPE || timetable.type_id === APPOINTMENT_MIXED_TYPE)
                                        ? <span>{timezoneOptions && timezoneOptions.length ? this.getTimezoneLabel(timezoneOptions, timetable.time_zone) : ''}</span>
                                        : null
                                    }
                                </td>
                                <td className="kt-datatable__cell align-middle d-none d-sm-table-cell">
                                    {timetable.duration} {locales_es.min}.
                                </td>
                                <td className="kt-datatable__cell align-middle d-none d-sm-table-cell">
                                    <strong>{locales_es.appointmentTypeName[timetable.type_id]}</strong>
                                </td>
                                {showDelete && <td className="kt-datatable__cell align-middle">
                                        <button onClick={() => this.showModal(timetable.id)} type="button"
                                                className="btn btn-danger btn-elevate btn-circle btn-icon m-1">
                                            <i className="flaticon-delete"/>
                                        </button>
                                </td>}
                            </tr>
                        )
                    })
                    }
                    </tbody>
                </table>

                <Rodal width={window.screen && window.screen.availWidth ? window.screen.availWidth * 0.75 : '300'}
                       visible={this.state.modalVisible} onClose={() => this.hide()}>
                    <h4 className="rodal-title">{locales_es.cancelTimetableModal.title}</h4>
                    <div className="rodal-body alert alert-warning justify-content-center">
                        {locales_es.cancelTimetableModal.subtitle}. {locales_es.cancelTimetableModal.advice}
                    </div>
                    <div className="rodal-footer">
                        <button className="btn btn-danger" type="button"
                                onClick={() => this.cancelAppointment()}>{locales_es.accept}
                        </button>
                        <button className="btn btn-success" type="button"
                                onClick={() => this.hide()}>{locales_es.cancel}
                        </button>
                    </div>
                </Rodal>
            </div>
        )
    }
}
