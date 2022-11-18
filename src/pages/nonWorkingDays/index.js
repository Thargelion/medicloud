import React, {Component} from 'react';
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Subheader from "../../components/subheader";
import locales_es, {langCode, MONTHS, WEEKDAYS_LONG, WEEKDAYS_SHORT} from "../../locales/es";
import {
    HREF_PAGE_HOME,
    HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS, USER_TYPE_SECRETARY,
} from "../../models/constants";
import Loading from "../../components/loading";
import MedicProfileHeader from "../../components/medicProfileHeader";
import AuthService from "../../modules/authService";

import DayPicker, {DateUtils} from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import DateTimeService from "../../modules/DateTimeService";
import Spinner from "../../components/spinner";
import Rodal from "rodal";

Date.prototype.setAPIId = function (id) {
    this.id = id;
};
Date.prototype.getAPIId = function () {
    return this.id;
};

const numberOfMonths = 12;

const startDate = new Date(new Date().getFullYear(), 0, 1);
const endDate = new Date(new Date().getFullYear(), 11, 31);

export default class NonWorkingDaysPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            medicId: Number(props.match.params.id),
            medic: null,
            userType: null,
            selectedDays: [],
            modifiers: {},
            collisions: null,
            modalVisible: false
        };

        this.handleDayClick = this.handleDayClick.bind(this);

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.dateTimeService = new DateTimeService();

        this.allDates = {
            start: this.dateTimeService.parseDateToAPIString(startDate),
            end: this.dateTimeService.parseDateToAPIString(endDate),
            medic_id: this.state.medicId
        }
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.api.getMedicById(this.state.medicId).then(res => {
            this.setState({
                medic: res.data
            });
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });

        this.setLocalUserType();
        this.getNonWorkingDays();
        this.checkCollisions();
    }

    setLocalUserType() {
        const localUser = this.auth.getUserData();
        if (localUser && localUser.user) {

            if (localUser.user.user_type !== USER_TYPE_SECRETARY && Number(localUser.user.id) !== Number(this.state.medicId)) {
                this.redirect();
                return;
            }

            this.setState({
                userType: localUser.user.user_type,
                userId: localUser.user.id
            });
        } else {
            this.redirect();
        }
    }

    redirect() {
        window.location.href = HREF_PAGE_HOME;
    }

    getNonWorkingDays(allDates) {
        this.api.getNonWorkingDays(allDates || this.allDates).then(res => {
            this.setState({
                selectedDays: res.data.map(day => {
                    const date = this.dateTimeService.parseAPIStringToDate(day.date);
                    date.setAPIId(day.id); // custom extended Date method
                    return date;
                })
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    handleOnMonthChange(fromMonth) {
        const _allDates = JSON.parse(JSON.stringify(this.allDates));
        const startDate = new Date(new Date().getFullYear(), fromMonth.getMonth(), 1);
        _allDates.start = this.dateTimeService.parseDateToAPIString(startDate);
        const endDate = new Date(startDate.setMonth(startDate.getMonth() + numberOfMonths));
        _allDates.end = this.dateTimeService.parseDateToAPIString(endDate);
        this.getNonWorkingDays(_allDates);
    }

    /*
        day: date() clicked
        selected: Boolean true || false (si se pintó el día, o se "despintó")
     */
    handleDayClick(day, {selected}) {
        const {selectedDays} = this.state;
        // const selectedDays = JSON.parse(JSON.stringify(this.state.selectedDays));
        if (selected) {
            const selectedIndex = selectedDays.findIndex(selectedDay =>
                DateUtils.isSameDay(selectedDay, day)
            );
            const dayId = selectedDays[selectedIndex].getAPIId();
            this.api.deleteNonWorkingDays(dayId).then(() => {
                selectedDays.splice(selectedIndex, 1);
                // this.props.showMainModal(locales_es.successModal.title, res.message);
                this.setState({selectedDays});
                this.checkCollisions();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        } else {
            const objData = {
                medic_id: this.state.medicId,
                date: this.dateTimeService.parseDateToAPIString(day)
            };
            this.api.postNonWorkingDays(objData).then(res => {
                day.setAPIId(res.data.id); // custom extended Date method
                selectedDays.push(day);
                // this.props.showMainModal(locales_es.successModal.title, res.message);
                this.setState({selectedDays});
                this.checkCollisions();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        }
    }

    checkCollisions() {
        this.setState({collisions: null});
        const objData = {
            medic_id: this.state.medicId
        };
        this.api.getNonWorkingDaysCollisions(objData).then(res => {
            this.setState({
                collisions: res.data
            });
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    onGetTimetablesCallback(timetables) {
        const daysOfWeek = [];
        timetables.map(tt => {
            daysOfWeek.push(tt.day)
        });
        this.setState({
            modifiers: {
                weekends: {
                    daysOfWeek: daysOfWeek
                }
            }
        })
    }
    /* MODAL Functions */
    showModal(id) {
        this.setState({
            selectedAppointmentId: id
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
        this.api.cancelAppointment(this.state.selectedAppointmentId).then(res => {
            this.props.showMainModal(locales_es.successModal.title, res.message);
            this.checkCollisions();
            this.hide();
        }).catch(err => {
            this.hide();
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    render() {
        const {medic, collisions} = this.state;

        return (
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.editNonWorkingDays,
                        href: HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS
                    }
                ]}/>
                <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                        {
                            medic == null ? <Loading/>
                                : medic ?
                                <MedicProfileHeader
                                    onGetTimetablesCallback={(timetables) => this.onGetTimetablesCallback(timetables)}
                                    showMainModal={this.props.showMainModal} medic={medic}/>
                                :
                                <div className="tcenter"> {locales_es.noMedicsAvailable} <br/><br/></div>
                        }
                    </div>


                    <div className="tab-content">
                        <div className="tab-pane fade show active" id="kt_tabs_1_1" role="tabpanel">

                            <div className="row">
                                <div className="col">

                                    <div className="kt-portlet kt-portlet--height-fluid">
                                        <div className="kt-portlet__head">
                                            <div className="kt-portlet__head-label">
                                                <h3 className="kt-portlet__head-title">{locales_es.editNonWorkingDays}</h3>
                                            </div>

                                        </div>
                                        <div className="kt-portlet__head">
                                            <div className="kt-portlet__head-label">
                                                <div className="mr-1 DayPicker-Day DayPicker-Day--weekends"
                                                     style={{display: 'inline-block'}}
                                                     tabIndex="-1"
                                                     role="gridcell" aria-label="Sun Mar 21 2021"
                                                     aria-disabled="false" aria-selected="false">XX
                                                </div>
                                                {locales_es.attentionSchedules}
                                                <div
                                                    className="mr-1 ml-md-3 DayPicker-Day DayPicker-Day--weekends DayPicker-Day--selected"
                                                    style={{display: 'inline-block'}}
                                                    tabIndex="-1"
                                                    role="gridcell" aria-label="Sun Mar 21 2021"
                                                    aria-disabled="false" aria-selected="false">XX
                                                </div>
                                                {locales_es.nonWorkingDays}
                                            </div>
                                            {/*<strong className="kt-portlet__head-label">{locales_es.editNonWorkingDaysDisclaimer}</strong>*/}
                                        </div>
                                        <div
                                            className="kt-portlet__body kt-portlet__body--fluid kt-portlet__body--fit">
                                            <div className="kt-widget-2">
                                                <div className="row">
                                                    <div className="col-12 order-1 col-md-9 order-md-0">
                                                        {medic &&
                                                        <div className="kt-widget-2__content kt-portlet__space-x">
                                                            <DayPicker numberOfMonths={numberOfMonths}
                                                                       // canChangeMonth={false}
                                                                       locale={langCode}
                                                                       months={MONTHS}
                                                                       weekdaysLong={WEEKDAYS_LONG}
                                                                       weekdaysShort={WEEKDAYS_SHORT}
                                                                       firstDayOfWeek={1}
                                                                       month={startDate}
                                                                       selectedDays={this.state.selectedDays}
                                                                       onDayClick={this.handleDayClick}
                                                                       onMonthChange={(fromMonth) => {
                                                                           this.handleOnMonthChange(fromMonth);
                                                                       }}
                                                                // navbarElement={() =><></>} // to remove toolbar
                                                                       modifiers={this.state.modifiers}
                                                            />
                                                        </div>
                                                        }
                                                    </div>
                                                    <div className="col-12 order-0 col-md-3 order-md-1 p-3">
                                                        <div className="kt-widget-2__content kt-portlet__space-x">
                                                            <div className="text-center pb-3">
                                                                {locales_es.appointmentsInConflict}
                                                            </div>
                                                            {collisions === null ?
                                                                <div className="text-center">
                                                                    <Spinner/><br/>
                                                                    <div>{locales_es.appointmentsInConflictExplaining}</div>
                                                                </div>
                                                                : collisions && collisions.length ?
                                                                    <>
                                                                        <div className="text-center mb-3">
                                                                            <strong>{locales_es.rescheduleAppointmentsInConflict}</strong>
                                                                        </div>
                                                                        {
                                                                            collisions.map(collision => {
                                                                                return (
                                                                                    <button onClick={() => this.showModal(collision.id)}
                                                                                            type="button"
                                                                                            className="btn btn-outline-info m-1">
                                                                                        <span data-hj-allow
                                                                                              dangerouslySetInnerHTML={
                                                                                                  {
                                                                                                      __html: this.dateTimeService.parseEventDate(collision.start, true)
                                                                                                  }
                                                                                              }/>&nbsp;
                                                                                        <span data-hj-allow
                                                                                              dangerouslySetInnerHTML={
                                                                                                  {
                                                                                                      __html: this.dateTimeService.parseEventTime(collision.start)
                                                                                                  }
                                                                                              }/>&nbsp;
                                                                                        {collision.patient ? (collision.patient.name + ' ' + collision.patient.lastname) : locales_es.blockedAppointment} {collision.owner_str || ''}
                                                                                        <button
                                                                                            onClick={() => this.showModal(collision.id)}
                                                                                            type="button"
                                                                                            className="btn btn-danger btn-elevate btn-circle btn-icon mr-2 float-right m-3">
                                                                                            <i className="flaticon-delete"/>
                                                                                        </button>
                                                                                    </button>
                                                                                )
                                                                            })
                                                                        }
                                                                    </>
                                                                    :
                                                                    <div className="text-center">
                                                                        <strong
                                                                            className="mb-1">{locales_es.noAppointmentsInConflict}</strong>
                                                                        <div>{locales_es.appointmentsInConflictExplaining}</div>
                                                                    </div>
                                                            }

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>


                </div>


                <Rodal width={window.screen && window.screen.availWidth ? window.screen.availWidth * 0.75 : '300'}
                       visible={this.state.modalVisible} onClose={() => this.hide()}>
                    <h4 className="rodal-title">{locales_es.cancelAppointmentModal.title}</h4>
                    <div className="rodal-body alert alert-warning">
                        {locales_es.cancelAppointmentModal.subtitle}. {locales_es.cancelAppointmentModal.adviceMedicSecretary}.
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
            </>
        )
    }
}
