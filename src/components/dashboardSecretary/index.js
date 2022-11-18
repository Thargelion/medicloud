import React, {Component} from "react";
import Subheader from "../subheader";
import locales_es from "../../locales/es";
import {
    APPOINTMENT_STATUS_OCCUPIED,
    HREF_PAGE_DASHBOARD, HREF_PAGE_HOME,
} from "../../models/constants";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import AuthService from "../../modules/authService";
import Spinner from "../spinner";
import Announcements from "../announcements";

import Raphael from 'raphael';
import 'morris.js/morris.css';
import 'morris.js/morris.js';
import StatisticsTotalsSecretary from "../statisticsTotalsSecretary";
import ConfigService from "../../modules/configService";

export default class DashboardSecretary extends Component {

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
        if (!this.auth.isLoggedUser()) {
            this.redirect();
            return;
        }
        this.setState({
            medic: this.auth.getUserData().user
        }, () => {
            this.getConsultingRoomOptions();
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
            });
        }).catch(err => {
            console.log(err);
        });
    }

    getNextAppointments() {
        this.configService.getLocalClinicData().then(clinic => {
            const objData = {
                // medic_id: this.state.medic.id,
                clinic_id: clinic.id,
                status: APPOINTMENT_STATUS_OCCUPIED,
                quantity: 12,
            };
            this.api.getNextAppointments(objData).then(res => {
                this.setState({
                    nextAppointments: res.data,
                });
            }).catch(err => {
                this.setState({
                    nextAppointments: []
                });
                console.log(err);
                // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, err);
        });
    }

    render() {

        const {nextAppointments} = this.state;
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
                                                        <i className="fa fa-angle-left"></i>
                                                    </a>
                                                    <a className="kt-slider__nav-next carousel-control-next"
                                                       href="#next-appointments" role="button" data-slide="next">
                                                        <i className="fa fa-angle-right"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="carousel-inner">
                                                {nextAppointments === null ? <Spinner/> :
                                                    nextAppointments.length ?
                                                        nextAppointments.map((appointment, index) => {
                                                            return (
                                                                <div
                                                                    key={`appointment-${index}`}
                                                                    className={`carousel-item kt-slider__body ${index === 0 ? 'active' : ''}`}
                                                                    data-wrap="false">
                                                                    <div className="kt-widget-13">
                                                                        <div className="kt-widget-13__body">
                                                                            <span>
                                                                                <i className="fa fa-hospital-user kt-label-font-color-2" /> {appointment.medic ? (appointment.medic.name + ' ' + appointment.medic.lastname)  : ''}
                                                                            </span>
                                                                            <span className="kt-widget-13__title">
                                                                                {appointment.patient ? (appointment.patient.name + ' ' + appointment.patient.lastname) : ''}
                                                                                {appointment.owner_str &&
                                                                                <span>&nbsp; - {appointment.owner_str}</span>
                                                                                }
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
                                                                                    this.state.consultingRoomOptions.filter(room => room.id == appointment.consulting_room_id) &&
                                                                                    this.state.consultingRoomOptions.filter(room => room.id == appointment.consulting_room_id).length
                                                                                        ? this.state.consultingRoomOptions.filter(room => room.id == appointment.consulting_room_id)[0].name
                                                                                        : null
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
                                    <div className="col-lg-6 col-xl-6 order-lg-1 order-xl-1">
                                        <StatisticsTotalsSecretary/>
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
