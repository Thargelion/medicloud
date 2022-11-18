import React, {Component} from "react";
import locales_es from "../../locales/es";
import DateTimeService from "../../modules/DateTimeService";
import Rodal from "rodal";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import {
  APPOINTMENT_VIRTUAL_TYPE,
  HREF_PAGE_MEDIC,
  HREF_PAGE_VIDEOCALL,
  PAYMENT_STATUS_PENDING
} from "../../models/constants";
import ConfigService from "../../modules/configService";
import './styles.css';
import PaymentOptionsModal from "../paymentOptionsModal";
import Loading from "../loading";

export default class AppointmentsList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      selectedAppointmentId: null,
    };

    this.dateTimeService = new DateTimeService();
    this.api = new APIService();
    this.helpers = new Helpers();
    this.configService = new ConfigService();
  }

  componentDidMount() {
    /*this.configService.getLocalClinicData().then(res => {
      this.setState({
        clinicAddress: res.address,
        // clinicWebUrl: res.web_url,
      })
    }).catch(err => {
      console.error(err);
    })*/
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

  cancelAppointment() {
    this.hide();
    this.api.cancelAppointment(this.state.selectedAppointmentId).then(res => {
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
      const text = filtered[0].label;
      return '(' + text.split('(')[1]; // TODO REVIEW LATER
    }
    return '';
  }

  showAppointmentInfo(appointment) {
    if (appointment && appointment.timetable_id) {
      const objData = {
        medic_id: appointment.medic_id
      };
      this.api.getTimetables(objData).then(res => {
        const regex = /\n/gm;
        const customStyles = {
          width: '90%',
          height: '70%',
          overflow: 'scroll',
          maxWidth: 'initial',
        };
        if (res && res.data) {
          const info = res.data.filter(d => Number(d.id) === Number(appointment.timetable_id))[0];
          const message = info.footer_email_text ? info.footer_email_text.replace(regex, "<br>") : locales_es.noAdditionalInfoToShow;
          this.props.showMainModal(locales_es.infoModal.title, message, message.length > 300 || regex.test(info.footer_email_text) ? customStyles : null);
        }
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
    }
  }

  showPaymentOptions(medicId) {
    this.setState({
      showPaymentModalForMedic: medicId
    })
  }

  setEvent(event) {
    this.setState({
      event: event
    })
  }

  getClinicAddress(clinicId) {
    this.setLoading(true);
    this.api.getClinicById(clinicId).then(res => {
      if (res && res.data && res.data.address) {
        window.open(`https://google.com/maps/place/${res.data.address}`);
      } else {
        this.props.showMainModal(locales_es.infoModal.title, 'No se ingresaron detalles del lugar de atención');
      }
      this.setLoading(false);
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      this.setLoading(false);
    });
  }

  setLoading(bool) {
    this.setState({
      loading: bool
    })
  }

  render() {

    const {appointments, showDelete, showVideocall, showAddress, showInfo, timezoneOptions, showPaymentOptions} = this.props;
    const {loading, showPaymentModalForMedic, event} = this.state;
    return (
      <>
        {loading && <Loading />}
        <div className="table-responsive d-none d-md-block">
          <table className="table">
            <thead>
            <tr>
              <th className="d-none d-sm-table-cell">#</th>
              <th>{locales_es.date}</th>
              <th>{locales_es.medic}</th>
              <th className="d-none d-sm-table-cell">{locales_es.appointmentType}</th>
              {/*<th className="d-none d-sm-table-cell">{locales_es.attentionAddress}</th>*/}
              {(showDelete || showVideocall) && <th scope="col">{locales_es.actions}</th>}
            </tr>
            </thead>
            <tbody>
            {appointments.map((appointment, index) => {
              return (
                <tr key={'appointment-' + index} data-row="0" className="kt-datatable__row">
                  <td
                    className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check d-none d-sm-table-cell"
                    data-hj-allow>
                    {appointment.id}
                  </td>
                  <td className="kt-datatable__cell" data-hj-allow>
                    <span data-hj-allow dangerouslySetInnerHTML={
                      {
                        __html: this.dateTimeService.parseEventDate(appointment.start, false)
                      }
                    }/>&nbsp;
                    <span data-hj-allow dangerouslySetInnerHTML={
                      {
                        __html: this.dateTimeService.parseEventTime(appointment.start)
                      }
                    }/>
                    <div></div>
                    {appointment.type_id === APPOINTMENT_VIRTUAL_TYPE
                      ?
                      <span>{timezoneOptions && timezoneOptions.length ? this.getTimezoneLabel(timezoneOptions, appointment.time_zone) : ''}</span>
                      : null
                    }
                  </td>
                  <td className="kt-datatable__cell">
                    <a
                      href={`${HREF_PAGE_MEDIC}/${appointment.medic.id}`}>{appointment.medic.prefix_name} {appointment.medic.name} {appointment.medic.lastname}</a>
                  </td>
                  <td className="kt-datatable__cell d-none d-sm-table-cell">
                    <strong>{locales_es.appointmentTypeName[appointment.type_id]}</strong>
                  </td>
                  {(showDelete || showVideocall || showAddress || showInfo) &&
                    <td className="kt-datatable__cell">
                      {showVideocall && appointment.type_id === APPOINTMENT_VIRTUAL_TYPE ?
                          <a href={`${HREF_PAGE_VIDEOCALL}/${appointment.videocall_hash}`}
                             type="button"
                             target="_blank"
                             title={locales_es.videocallLink}
                             className="btn btn-sm btn-focus btn-elevate btn-pill btn-primary m-1">
                              <i className="flaticon-laptop"/> {locales_es.videocallLink}
                          </a>
                          :
                          <a target="_blank"
                             rel="noreferrer"
                             className="btn btn-sm btn-elevate btn-pill btn-outline-info m-1"
                             title={locales_es.seeLocation}
                             href="#"
                             onClick={(e) => {
                                 e.preventDefault();
                                 this.getClinicAddress(appointment.clinic_id)
                             }}>
                              <i className="flaticon2-map"/> {locales_es.seeLocation}
                          </a>}
                      {showInfo ?
                          <button onClick={() => this.showAppointmentInfo(appointment)} type="button"
                                  className="btn btn-sm btn-outline-brand btn-elevate btn-pill m-1">
                              <i className="flaticon-information"/> {locales_es.appointmentInformation}
                          </button>
                          : null}
                      {showDelete ?
                          <button onClick={() => this.showModal(appointment.id)} type="button"
                                  className="btn btn-sm btn-focus btn-elevate btn-pill btn-danger m-1">
                              <i className="flaticon-delete"/> {locales_es.cancelAppointment}
                          </button>
                          : null}
                      {showPaymentOptions ?
                        appointment.payment_status && appointment.payment_status === PAYMENT_STATUS_PENDING &&
                        <button onClick={() => {
                          this.showPaymentOptions(appointment.medic_id);
                          this.setEvent(appointment);
                        }} type="button"
                                className="btn btn-sm btn-focus btn-elevate btn-pill m-1">
                          {locales_es.currency_sign} {locales_es.pay}
                        </button>
                        : null}
                  </td>}
                </tr>
              )
            })
            }
            </tbody>
          </table>

        </div>

        <div className="col-sm-12 mb-30 d-md-none">
          {appointments.map((appointment, index) => {
            return (
              <div key={'appointment-' + index} data-row="0" className="row mb-3 p-3 woopi-mobile-card">
                <div className="woopi-mobile-card-header">
                  {/*<div className="col-12"
                                        data-hj-allow>
                                        #{appointment.id}
                                    </div>*/}
                  <div className="col-12 kt-widget-15">
                    <div className="kt-widget-15__body">
                      <div className="kt-widget-15__author">
                        <div className="kt-widget-15__photo">
                          <img src={appointment.medic.full_profile_image}/>
                        </div>
                        <div className="kt-widget-15__detail">
                          <a
                            href={`${HREF_PAGE_MEDIC}/${appointment.medic.id}`}>{appointment.medic.prefix_name} {appointment.medic.name} {appointment.medic.lastname}</a>
                          <div className="kt-widget-15__desc">
                            {appointment.medic.specialty_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12" data-hj-allow>
                          <span data-hj-allow dangerouslySetInnerHTML={
                            {
                              __html: this.dateTimeService.parseEventDate(appointment.start, false)
                            }
                          }/>
                          <span data-hj-allow dangerouslySetInnerHTML={
                            {
                              __html: this.dateTimeService.parseEventTime(appointment.start)
                            }
                          }/>
                          <div></div>
                          {appointment.type_id === APPOINTMENT_VIRTUAL_TYPE
                              ?
                              <span>{timezoneOptions && timezoneOptions.length ? this.getTimezoneLabel(timezoneOptions, appointment.time_zone) : ''}</span>
                              : null
                          }
                      </div>
                  </div>
                  <div className="col-12">
                    <strong>{locales_es.appointmentTypeName[appointment.type_id]}</strong>
                  </div>
                  {(showDelete || showVideocall || showAddress) &&
                  <div className="col-12 text-center mt-3">
                    {showVideocall && appointment.type_id === APPOINTMENT_VIRTUAL_TYPE ?
                      <a href={`${HREF_PAGE_VIDEOCALL}/${appointment.videocall_hash}`}
                         type="button"
                         target="_blank"
                         title={locales_es.videocallLink}
                         className="btn btn-focus btn-elevate btn-pill btn-primary m-1">
                        {locales_es.videocallLink}
                      </a>
                      :
                      <a target="_blank"
                         rel="noreferrer"
                         className="btn btn-elevate btn-pill btn-outline-info m-1"
                         href="#"
                         onClick={(e) => {
                           e.preventDefault();
                           this.getClinicAddress(appointment.clinic_id)
                         }}>
                        {locales_es.seeLocation}
                      </a>}
                    {showInfo ?
                      <button onClick={() => this.showAppointmentInfo(appointment)} type="button"
                              className="btn btn-outline-brand btn-elevate btn-pill m-1">
                        {locales_es.appointmentInformation}
                      </button>
                      : null}
                    {showDelete ?
                      <button onClick={() => this.showModal(appointment.id)} type="button"
                              className="btn btn-focus btn-elevate btn-pill btn-danger m-1">
                        {locales_es.cancelAppointment}
                      </button>
                      : null}
                    {showPaymentOptions ?
                      appointment.payment_status && appointment.payment_status === PAYMENT_STATUS_PENDING &&
                      <button onClick={() => {
                        this.showPaymentOptions(appointment.medic_id);
                        this.setEvent(appointment);
                      }} type="button"
                              className="btn btn-sm btn-focus btn-elevate btn-pill m-1">
                        {locales_es.currency_sign} {locales_es.pay}
                      </button>
                      : null}
                  </div>}
                </div>
              )
            })
          }
        </div>


        {showPaymentModalForMedic &&
        <PaymentOptionsModal medicId={showPaymentModalForMedic} event={event} showMainModal={this.props.showMainModal}
                             acceptAction={() => this.showPaymentOptions(false)}/>}

        <Rodal width={window.screen && window.screen.availWidth ? window.screen.availWidth * 0.75 : '300'}
               visible={this.state.modalVisible} onClose={() => this.hide()}>
          <h4 className="rodal-title">{locales_es.cancelAppointmentModal.title}</h4>
          <div className="rodal-body alert alert-warning">
            {locales_es.cancelAppointmentModal.subtitle}. {locales_es.cancelAppointmentModal.advice}
          </div>
          <div className="rodal-footer">
            <button className="btn btn-success" type="button"
                    onClick={() => this.cancelAppointment()}>{locales_es.yesCancelAppointment}
            </button>
          </div>
        </Rodal>

      </>
    )
  }
}
