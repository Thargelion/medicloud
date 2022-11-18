import React, {Component} from 'react';
import APIService from "../../modules/apiService";
import AuthService from "../../modules/authService";
import Helpers from "../../modules/helpers";
import Spinner from "../spinner";
import locales_es from "../../locales/es";
import {HREF_PAGE_MY_PROFILE} from "../../models/constants";
import DateTimeService from "../../modules/DateTimeService";
import AppointmentsList from "../appointmentsList";
import TimezoneService from "../../modules/timezoneService";
import ModalAppointmentCancel from "../modalAppointmentCancel";

export default class DashboardPatient extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appointmentsPast: null,
      appointmentsFuture: null,
      selectedAppointmentId: null,
      timezoneOptions: [
        {value: 0, label: locales_es.loading},
      ],
      cancelAppointmentId: this.props.location && this.props.location.search && window.URLSearchParams
        ? new window.URLSearchParams(this.props.location.search).get("cancelAppointment") : null,
    };

    this.api = new APIService();
    this.auth = new AuthService();
    this.helpers = new Helpers();
    this.dateTimeService = new DateTimeService();
    this.timezoneService = new TimezoneService();
  }

  componentDidMount() {
    this.getMyFutureAppointments();
    this.getMyPastAppointments();

    this.timezoneService.getRemoteParsedTimezones().then(res => {
      this.setState({
        timezoneOptions: res,
        // timezone: res.filter(tz => tz.value === DEFAULT_TIME_ZONE)[0]
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });

    this.auth.getRemoteUserData().then(res => {
      if (res && res.data && res.data.user) {
        this.setState({
          isValidated: Boolean(Number(res.data.user.is_cellphone_validated))
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }

  getMyFutureAppointments() {
    const now = new Date();
    now.setHours(now.getHours() - 1);
    this.api.getMyAppointments({start: now.toISOString()}).then(res => {
      this.setState({
        appointmentsFuture: res.data
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });
  }

  getMyPastAppointments() {
    const now = new Date();
    now.setHours(now.getHours() - 1);
    this.api.getMyAppointments({end: now.toISOString()}).then(res => {
      this.setState({
        appointmentsPast: res.data
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });
  }
  onConfirmAppointmentCancel() {
      this.setState({
          cancelAppointmentId: null
      })
  }

  confirmAppointmentCancel() {
      this.api.cancelAppointment(this.state.cancelAppointmentId).then(res => {
          this.props.showMainModal(locales_es.successModal.title, res.message);
          this.onConfirmAppointmentCancel();
          this.getMyFutureAppointments();
      }).catch(err => {
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
  }

  render() {
        const {appointmentsPast, appointmentsFuture, timezoneOptions, isValidated, cancelAppointmentId} = this.state;

    return (
      <div className="container">
        {isValidated === false &&
        <div className="row">
          <div className="col">
            <div className="alert alert-success fade show" role="alert">
              <div className="alert-icon"><i className="flaticon-whatsapp"/></div>
              <a onClick={() => this.props.history.push(`${HREF_PAGE_MY_PROFILE}?redirect=${window.location.pathname}`)}
                 className="alert-text cursor-pointer">
                {locales_es.telephoneNotYetValidated} {locales_es.doItNow}
              </a>
              <div className="alert-close">
                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true"><i className="la la-close"/></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        }
        <div className="row">
          <div className="col">
            <div className="kt-portlet kt-portlet--tabs kt-portlet--height-fluid">
              <div className="kt-portlet__head">
                <div className="kt-portlet__head-label">
                  <h3 className="kt-portlet__head-title">
                    {locales_es.myAppointments}
                  </h3>
                </div>
                <div className="kt-portlet__head-toolbar">
                  <ul className="nav nav-tabs nav-tabs-line nav-tabs-line-brand nav-tabs-bold"
                      role="tablist">
                    <li className="nav-item">
                      <a className="nav-link active" data-toggle="tab"
                         href="#next" role="tab" aria-selected="false">
                        {locales_es.appointmentsFuture}
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" data-toggle="tab"
                         href="#previous" role="tab" aria-selected="true">
                        {locales_es.appointmentsPast}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="kt-portlet__body">
                <div className="tab-content">
                  <div className="tab-pane fade active show" id="next" role="tabpanel">
                    <div
                      className="kt_datatable kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--error kt-datatable--loaded"
                      id="ajax_data">
                      {
                        appointmentsFuture === null ?
                          <Spinner/>
                          : appointmentsFuture.length
                          ? <AppointmentsList appointments={appointmentsFuture}
                                              timezoneOptions={timezoneOptions}
                                              refresh={() => this.getMyFutureAppointments()}
                                              showMainModal={this.props.showMainModal}
                                              showDelete={true}
                                              showVideocall={true}
                                              showAddress={true}
                                              showInfo={true}
                                              showPaymentOptions={true}
                          />
                          : <span
                            className="kt-datatable--error">
                                                        {locales_es.noFutureAppointments}
                                                </span>
                      }
                    </div>
                    {/*<div className="kt-margin-t-30 kt-align-center">
                      <a href={HREF_PAGE_HOME}
                         className="btn btn-brand btn-upper btn-bold kt-align-center">{locales_es.requestAppointment}</a>
                    </div>*/}
                  </div>
                  <div className="tab-pane fade" id="previous"
                       role="tabpanel">
                    <div
                      className="kt_datatable kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--error kt-datatable--loaded"
                      id="ajax_data">
                      {
                        appointmentsPast === null ?
                          <Spinner/>
                          : appointmentsPast.length
                          ? <AppointmentsList appointments={appointmentsPast}
                                              timezoneOptions={timezoneOptions}
                                              refresh={() => this.getMyPastAppointments()}
                                              showMainModal={this.props.showMainModal}/>
                          : <span
                            className="kt-datatable--error">
                                                        {locales_es.noFutureAppointments}
                                                </span>
                      }
                    </div>
                    {/*<div className="kt-margin-t-30 kt-align-center">
                      <a href={HREF_PAGE_HOME}
                         className="btn btn-brand btn-upper btn-bold kt-align-center">{locales_es.requestNewAppointment}</a>
                    </div>*/}
                  </div>
                </div>
              </div>

                {cancelAppointmentId && <ModalAppointmentCancel
                  appointmentId={cancelAppointmentId}
                  showMainModal={this.props.showMainModal}
                  onConfirm={() => this.confirmAppointmentCancel()}
                  onAbort={() => this.onConfirmAppointmentCancel()} />}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
