import React, {Component} from "react";
import Subheader from "../subheader";
import locales_es from "../../locales/es";
import {
    APPOINTMENT_STATUS_OCCUPIED,
    HREF_PAGE_DASHBOARD,
    HREF_PAGE_HOME,
} from "../../models/constants";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import AuthService from "../../modules/authService";
import AppointmentsCalendar from "../appointmentsCalendar";
import Spinner from "../spinner";
import MedicAgenda from "../medicAgenda";
import Announcements from "../../components/announcements";
import ConfigService from "../../modules/configService";

export default class DashboardMedic extends Component {

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
    }

    componentDidMount() {
        if (!this.auth.isLoggedUser()) {
            this.redirect();
            return;
        }
        this.api.getMedicById(this.auth.getUserData().user.id).then(res => {
            this.setState({
                medic: res.data
            }, () => {
                this.getConsultingRoomOptions();
            });
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
    }

    redirect() {
        window.location.href = HREF_PAGE_HOME;
    }

    getConsultingRoomOptions() {
        this.configService.getLocalClinicData().then(clinic => {
            this.api.getConsultingRooms({clinic_id: clinic.id}).then(res => {
                this.setState({
                    consultingRoomOptions: res.data
                }, () => this.getNextAppointments());
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                this.getNextAppointments();
            })
        }).catch(err => {
           console.log(err);
        });
    }

    getNextAppointments() {
        const objData = {
            medic_id: this.state.medic.id,
            status: APPOINTMENT_STATUS_OCCUPIED,
            quantity: 14,
        };
        this.api.getNextAppointments(objData).then(res => {
            this.setState({
                nextAppointments: res.data
            });
        }).catch(() => {
            // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            this.setState({
                nextAppointments: []
            })
        })
    }

    getConsultingRoom(appointment) {
        const filtered = this.state.consultingRoomOptions.filter(room => room.id == appointment.consulting_room_id);
        return filtered.length ? filtered[0].name : null;
    }

    render() {

        const {nextAppointments, medic} = this.state;
        return (
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.dashboard,
                        href: HREF_PAGE_DASHBOARD
                    }
                ]}/>
                <div className="tab-content">
                    <div className="tab-pane fade show active" id="kt_tabs_1_1" role="tabpanel">

                        <div className="row">
                            <div className="col-12 col-md-8">

                                <div className="kt-portlet kt-portlet--height-fluid">
                                    <div className="kt-portlet__head">
                                        <div className="kt-portlet__head-label">
                                            <h3 className="kt-portlet__head-title">{locales_es.announcements}</h3>
                                        </div>
                                    </div>
                                    <div className="kt-portlet__body kt-portlet__body--fluid kt-portlet__body--fit">
                                        <div className="kt-portlet__body">
                                            <div className="kt-widget-2">
                                                <Announcements showMainModal={this.props.showMainModal} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="col-12 col-md-4">

                                <div className="kt-portlet kt-portlet--height-fluid">
                                    <div className="kt-portlet__head">
                                        <div className="kt-portlet__head-label">
                                            <h3 className="kt-portlet__head-title">{locales_es.appointments}</h3>
                                        </div>
                                    </div>
                                    <div className="kt-portlet__body">
                                        <div id="next-appointments" className="kt-slider carousel slide"
                                             data-ride="carousel" data-interval="12000">
                                            <div className="kt-slider__head">
                                                <div className="kt-slider__label">{locales_es.nextAppointments}</div>
                                                <div className="kt-slider__nav">
                                                    <a className="kt-slider__nav-prev carousel-control-prev"
                                                       href="#next-appointments" role="button" data-slide="prev">
                                                        <i className="fa fa-angle-left" />
                                                    </a>
                                                    <a className="kt-slider__nav-next carousel-control-next"
                                                       href="#next-appointments" role="button" data-slide="next">
                                                        <i className="fa fa-angle-right" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="carousel-inner">
                                                {nextAppointments === null ? <Spinner/> :
                                                    nextAppointments.length ?
                                                        nextAppointments.map((appointment, index) => {
                                                            return (
                                                                <div
                                                                    key={`next-appointment-${index}`}
                                                                    className={`carousel-item kt-slider__body ${index === 0 ? 'active' : ''}`}
                                                                    data-wrap="false">
                                                                    <div className="kt-widget-13">
                                                                        <div className="kt-widget-13__body">
                                                                            <span className="kt-widget-13__title">
                                                                                {appointment.patient ? (appointment.patient.name + ' ' + appointment.patient.lastname) : locales_es.blockedAppointment}
                                                                                {appointment.owner_str && <span>&nbsp; - {appointment.owner_str}</span>}
                                                                                {appointment.patient_email && <div><i className="flaticon2-send kt-font-success"/> <a href={`mailto:${appointment.patient_email}`}>{appointment.patient_email}</a></div>}
                                                                                {appointment.patient_cellphone && <div><i className="fa fa-phone-square"/> <a href={`tel:${appointment.patient_cellphone}`}>{appointment.patient_cellphone}</a></div>}
                                                                            </span>
                                                                            <div
                                                                                className="kt-widget-13__desc kt-widget-13__desc--xl kt-font-brand">
                                                                                <span dangerouslySetInnerHTML={
                                                                                    {
                                                                                        __html: this.dateTimeService.parseEventDate(appointment.start, true)
                                                                                    }
                                                                                }/>
                                                                                <span className="kt-label-font-color-2">
                                                                                    <span dangerouslySetInnerHTML={
                                                                                        {
                                                                                            __html: this.dateTimeService.parseEventTime(appointment.start)
                                                                                        }
                                                                                    }/>&nbsp;-&nbsp;
                                                                                    <span dangerouslySetInnerHTML={
                                                                                        {
                                                                                            __html: this.dateTimeService.parseEventTime(appointment.end)
                                                                                        }
                                                                                    }/>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="kt-widget-13__foot">
                                                                            <div className="kt-widget-13__label">
                                                                                <i className="fa fa-door-open kt-label-font-color-2"></i>
                                                                                {
                                                                                    this.getConsultingRoom(appointment)
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                        :
                                                        <div className="carousel-item kt-slider__body active">
                                                            <div className="kt-widget-13">
                                                                <div className="kt-widget-13__body">
                                                                    <a className="kt-widget-13__title">{locales_es.noFutureAppointments}</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>


                        <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                            <div className="kt-grid__item kt-grid__item--fluid">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="kt-portlet" id="kt_portlet">
                                            <div className="kt-portlet__head kt-portlet__head--lg">
                                                <div className="kt-portlet__head-label">
                                                    <span className="kt-portlet__head-icon">
                                                      <i className="flaticon-calendar"/>
                                                    </span>
                                                    <h3 className="kt-portlet__head-title">
                                                        {locales_es.appointments}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="kt-portlet__body">
                                                {this.state.medic &&
                                                <AppointmentsCalendar location={this.props.location}
                                                                      medic={this.state.medic}
                                                                      showMainModal={this.props.showMainModal}/>
                                                }
                                                {medic &&
                                                <MedicAgenda medic={medic}
                                                             userType={medic.user_type}
                                                />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
