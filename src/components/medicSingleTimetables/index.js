import React, {Component} from 'react';
import locales_es, {WEEKDAYS_LONG} from "../../locales/es";
import Form from "../form";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import {
    DAYS_OF_THE_WEEK,
    DEFAULT_TIME_ZONE,
    HREF_PAGE_MEDIC_EDIT_TIMETABLES
} from "../../models/constants";
import TimeRangeSlider from 'react-time-range-slider';

import Loading from './../../components/loading';
import Modal from "../modal";
import TimezoneService from "../../modules/timezoneService";
import Spinner from "../spinner";
import DateTimeService from "../../modules/DateTimeService";
import TimetablesTable from "../timetablesTable";
import ConfigService from "../../modules/configService";

export default class MedicSingleTimetables extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            clinic_id: null, // TODO Se levanta desde el env
            time_zone: DEFAULT_TIME_ZONE, // TODO HARDCODEADO POR AHORA
            consultingRoomOptions: [{
                id: 0
            }],
            singleDate: '',
            duration: 15,
            value: {
                start: "00:00",
                end: "23:00"
            },
            enabled: true,
            modalVisible: false,
            selectedTimetableId: 0,
            footer_email_text: '',
            timezoneOptions: [
                { value: 0, label: locales_es.loading },
            ],
            timezone: DEFAULT_TIME_ZONE,
            appointmentTypes: [],
            appointmentTypeId: null,
            timetables: null,
        };

        this.changeStartHandler = this.changeStartHandler.bind(this);
        this.timeChangeHandler = this.timeChangeHandler.bind(this);
        this.changeCompleteHandler = this.changeCompleteHandler.bind(this);

        this.api = new APIService();
        this.helpers = new Helpers();
        this.timezoneService = new TimezoneService();
        this.dateTimeService = new DateTimeService();
        this.configService = new ConfigService();
    }

    componentDidMount() {
        this.configService.getLocalClinicData().then(clinic => {
            this.setState({
                clinic_id: clinic.id
            }, () => {
                this.api.getConsultingRooms({clinic_id: this.state.clinic_id}).then(res => {
                    if (res && res.data && res.data.length) {
                        this.setState({
                            consultingRoomOptions: res.data
                        }, () => {
                            this.setDefaults();
                            this.getTimetables();
                        });
                    }
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
            });
        }).catch(err => {
            console.log(err);
        });

        this.timezoneService.getRemoteParsedTimezones().then(res => {
            this.setState({
                timezoneOptions: res,
                timezone: res.filter(tz => tz.value === DEFAULT_TIME_ZONE)[0]
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });

        this.api.getAppointmentsTypes().then(res => {
            this.setState({
                appointmentTypes: res.data,
                appointmentTypeId: res.data[0].id
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    setDefaults() {
        this.setState({
            consulting_room_id: this.state.consultingRoomOptions[0].id,
            day: DAYS_OF_THE_WEEK[0].value
        });
    }

    getTimetables() {
        this.setLoading(true);
        this.api.getTimetables({medic_id: this.props.medic.id}).then(res => {
            this.setState({
                // timetables: res.data.filter(tt => tt.start_date && tt.end_date)
                timetables: res.data.filter(tt => (tt.start_date && tt.end_date && this.dateTimeService.diffTwoDates(new Date(tt.start_date), new Date(tt.end_date)).days <= 1))
            });
            this.setLoading(false);
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            this.setLoading(false);
        })
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        });
    }

    handleChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    handleReactSelectChange = state => value => {
        this.setState({[state]: value});
    };

    handleDateChange = state => value => {
        this.setState({[state]: value}, () => {
            this.setDayOfSingleDate()
        });
    };

    setDayOfSingleDate() {
        this.setState({
            day: this.state.singleDate.getDay()
        })
    }

    changeStartHandler(time) {
        console.log("Start Handler Called", time);
    }

    timeChangeHandler(time) {
        this.setState({
            value: time
        });
    }

    changeCompleteHandler(time) {
        console.log("Complete Handler Called", time);
    }

    send() {

        if (!this.state.consultation_price) {
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.setPrice);
            return;
        }

        if (!this.state.timezone) {
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.checkTimeonze);
            return;
        }

        if (!this.state.singleDate) {
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.checkTimeonze);
            return;
        }

        const startDate = this.dateTimeService.getDateStartOfDay(new Date(this.state.singleDate));
        const endDate = this.dateTimeService.getDateEndOfDay(new Date(this.state.singleDate));

        const objData = {
            "medic_id": this.props.medic.id,
            "day": this.state.day,
            "start": this.state.value.start,
            "end": this.state.value.end,
            "start_date": startDate.toISOString(),
            "end_date": endDate.toISOString(),
            "clinic_id": this.state.clinic_id,
            "consulting_room_id": this.state.consulting_room_id,
            "duration": this.state.duration,
            "consultation_price": this.state.consultation_price,
            "comment": this.state.comment,
            "enabled": Number(this.state.enabled),
            "type_id": this.state.appointmentTypeId,
            "time_zone": this.state.timezone.value,
            "footer_email_text": this.state.footer_email_text,
        };
        this.setLoading(true);
        this.api.postTimetables(objData).then(res => {
            this.props.showMainModal(locales_es.successModal.title, res.message);
            this.getTimetables();
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            this.getTimetables();
        })
    }

    confirmEventRemove(timetableId) {
        const confirm = window.confirm(locales_es.confirmLapseTimeRemoval);
        if (confirm) {
            this.api.deleteTimetables(timetableId).then(res => {
                this.props.showMainModal(locales_es.successModal.title, res.message);
                this.setState({
                    timetableId: 0,
                    modalVisible: 0,
                }, () => this.getTimetables());
            }).catch(err => {
                this.props.showMainModal(locales_es.infoModal.title, this.helpers.getErrorMsg(err));
                this.setState({
                    timetableId: 0,
                    modalVisible: 0,
                }, () => this.getTimetables());
            });
        }
    }

    toggleEnable() {
        this.setState({
            enabled: !this.state.enabled
        })
    }

    setSelectedTimetableIdAndOpenModal(timetableId) {
        this.setState({
            selectedTimetableId: timetableId,
            modalVisible: true,
        });
    }

    renderSelectedTimetableInfo() {
        if(!this.state.selectedTimetableId) {
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.unexpectedError);
            return;
        }

        const timetables = JSON.parse(JSON.stringify(this.state.timetables));
        const selectedTimetable = timetables.filter(tt => Number(tt.id) === Number(this.state.selectedTimetableId))[0];
        const selectedTimetableEnabled = Boolean(selectedTimetable.enabled);

        return(
            <div>
                <p>{locales_es.day}: {WEEKDAYS_LONG[selectedTimetable.day]}</p>
                <p>{locales_es.from}: {selectedTimetable.start}</p>
                <p>{locales_es.to}: {selectedTimetable.end}</p>
                <p>{locales_es.price}: {locales_es.currency_sign}{selectedTimetable.consultation_price}</p>
                {selectedTimetable.comment &&
                <p>{locales_es.observations}: {selectedTimetable.comment}</p>
                }
                <strong>{selectedTimetableEnabled ? locales_es.enabled : locales_es.disabled}</strong>
            </div>
        )
    }

    goToEditTimetable(timetableId) {
        window.location.href = `${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${this.props.medic.id}/${timetableId}`;
    }

    render() {
        const {timetables, timezoneOptions} = this.state;
        const inputs = [
            {
                label: locales_es.price,
                placeholder: locales_es.pricePlaceholder,
                id: 1,
                state: 'consultation_price',
                value: this.state.consultation_price,
                type: 'number',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.consultingRoom,
                placeholder: locales_es.consultingRoom,
                id: 2,
                state: 'consulting_room_id',
                value: this.state.consulting_room_id,
                type: 'select',
                required: true,
                options: this.state.consultingRoomOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
        ];

        const inputsTwo = [
            {
                label: locales_es.singleTimetable,
                placeholder: locales_es['DD/MM/YYYY'],
                id: 3,
                state: 'singleDate',
                value: this.state.singleDate,
                type: 'date',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
                minDate: new window.Date().getTime(),
            },
            {
                label: `${locales_es.appointmentDuration} (${locales_es.inMinutes})`,
                placeholder: `(${locales_es.inMinutes})`,
                id: 4,
                state: 'duration',
                value: this.state.duration,
                type: 'number',
                step: 1,
                min: 1,
                max: 60,
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.observations,
                placeholder: locales_es.observationsPlaceholder,
                id: 5,
                state: 'comment',
                value: this.state.comment,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group clear',
            },
            {
                label: locales_es.footerEmailText,
                placeholder: locales_es.footerEmailTextPlaceholder,
                id: 6,
                state: 'footer_email_text',
                value: this.state.footer_email_text,
                type: 'textarea',
                required: false,
                wrapperCustomClassName: 'form-group clear',
            },
            {
                label: locales_es.appointmentType,
                placeholder: locales_es.appointmentType,
                id: 7,
                state: 'appointmentTypeId',
                value: this.state.appointmentTypeId,
                type: 'select',
                required: true,
                options: this.state.appointmentTypes,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.timezone,
                placeholder: locales_es.timezone,
                id: 8,
                state: 'timezone',
                value: this.state.timezone,
                type: 'react-select',
                required: true,
                options: this.state.timezoneOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
        ];

        return (
            <>
                {this.state.loading ? <Loading/> : null}
                <div className="kt-portlet">
                    <Form
                        styles="kt-form"
                        inputs={inputs}
                        handleChange={this.handleChange}
                        wrapper={true}
                    >
                        <div className="kt-portlet__head">
                            <div className="kt-portlet__head-label">
                                <h3 className="kt-portlet__head-title">{locales_es.attentionAddress}</h3>
                            </div>
                        </div>
                    </Form>
                    <Form
                        styles="kt-form"
                        inputs={inputsTwo}
                        handleChange={this.handleChange}
                        handleReactSelectChange={this.handleReactSelectChange}
                        handleDateChange={this.handleDateChange}
                        wrapper={true}
                    />

                    <div className="row">
                        <div className="col">
                            <h3>{locales_es.lapseTime}</h3>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {locales_es.from}: {this.state.value.start}
                        </div>
                        <div className="col text-right">
                            {locales_es.to}: {this.state.value.end}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <TimeRangeSlider
                                disabled={false}
                                format={24}
                                maxValue={"23:59"}
                                minValue={"00:00"}
                                name={"time_range"}
                                //onChangeStart={this.changeStartHandler}
                                // onChangeComplete={this.changeCompleteHandler}
                                onChange={this.timeChangeHandler}
                                step={15}
                                value={this.state.value}/>
                        </div>
                    </div>

                    <div className="row mt-5">
                        <div className="col">
                            <label className="kt-checkbox">
                                <input type="checkbox" onChange={() => this.toggleEnable()} checked={this.state.enabled} /> {locales_es.enabledTimetable}
                                <span />
                            </label>
                        </div>
                    </div>

                    <div className="row m-4">
                        <div className="col text-center">
                            <button type="button"
                                    onClick={() => this.send()}
                                    className="btn btn-brand btn-elevate btn-pill mr-3">{locales_es.addLapseTime}</button>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col">
                            {timetables === null ? <Spinner /> :
                                timetables && timetables.length ?
                                    <TimetablesTable timetables={timetables}
                                                     timezoneOptions={timezoneOptions}
                                                     refresh={() => this.getTimetables()}
                                                     showMainModal={this.props.showMainModal}
                                                     showDelete={true}
                                    />
                                    :
                                    <div className="alert alert-light alert-elevate" role="alert">
                                        <div className="alert-icon"><i className="flaticon-warning" /></div>
                                        <div className="alert-text">{locales_es.noSingleTimetables}</div>
                                    </div>
                            }
                        </div>
                    </div>
                </div>

                {this.state.modalVisible ?
                <Modal onClose={() => this.setState({modalVisible: false})}
                       modalId="editTimetable"
                       visible={this.state.modalVisible}
                       title={locales_es.editTimetable}
                       actions={[
                           {
                               title: locales_es.deleteTimetable,
                               onClick: () => this.confirmEventRemove(this.state.selectedTimetableId),
                               className: 'btn btn-danger',
                           },
                           {
                               title: locales_es.editTimetable,
                               onClick: () => this.goToEditTimetable(this.state.selectedTimetableId),
                               className: 'btn btn-outline-info',
                           },
                           {
                               title: locales_es.cancel,
                               onClick: () => this.setState({
                                   selectedTimetableId: 0,
                                   modalVisible: false,
                               }),
                               className: 'btn btn-outline-brand',
                           }
                       ]}
                >
                    {this.renderSelectedTimetableInfo()}
                </Modal>
                : null}
            </>
        )
    }
}
