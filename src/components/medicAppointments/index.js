import React, {Component} from 'react'
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import {
  APPOINTMENT_PRESENTIAL_TYPE,
  APPOINTMENT_STATUS_FREE, APPOINTMENT_VIRTUAL_TYPE,
  DEFAULT_TIME_ZONE, HREF_PAGE_MEDIC,
  hrefDashboard, hrefLogin,
  HREF_REGISTER_PATIENT, APPOINTMENT_PAYMENT_STATUS_NOT_APPLY
} from "../../models/constants";
import locales_es from "../../locales/es";
import './index.css';
import Spinner from "../spinner";
import AuthService from "../../modules/authService";
import ConfigService from "../../modules/configService";
import Form from "../../components/form";
import AppointmentSuccess from "../appointmentSuccess";
import moment from "moment-timezone";
import AppointmentScheduled from "../appointmentScheduled";
import BankTransferData from "../bankTransferData";
import MercadoPagoData from "../mercadoPagoData";
import Loading from "../loading";
import PostAppoinmentPriceSelection from "../postAppoinmentPriceSelection";

export default class MedicAppointments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      availableAppointments: null,
      selectedDate: null,
      selectedAppointment: null,
      success: false,
      patient: 'me',
      owner_str: '',
      disableNextAppointment: false,
      clinics: null,
      clinicName: null,
      clinicAddress: null,
      clinicWebUrl: null,
      interruptedAgenda: false,
      notConfiguredAgenda: false,
      appointmentTypes: [],
      appointmentTypeId: null,
      timetables: [],
      prices: null,
      event: null,
      paymentMethods: null, // false === enable_before_payment = false
      bankTransferData: null,
      mercadoPagoData: null,
    };

    this.api = new APIService();
    this.helpers = new Helpers();
    this.dateTimeService = new DateTimeService();
    this.auth = new AuthService();
    this.configService = new ConfigService();
  }

  componentDidMount() {
    if (this.props.medic && this.props.medic.interrupted_agenda) {
      this.setState({
        interruptedAgenda: true
      });
    } else {
      this.load();
    }
  }

  load() {
    this.getClinicsAndContinue();
  }

  getClinicsAndContinue() {
    this.api.getClinicsByUser(this.props.medic.id).then(res => {
      this.setState({
        clinics: res.data
      }, () => {
        this.getTimetables();
        this.loadPaymentInfo();
        this.getAppointmentTypesAndContinue();
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  getAppointmentTypesAndContinue() {
    this.api.getMedicAppointmentsTypes(this.props.medic.id).then(res => {
      this.setState({
        appointmentTypes: res.data,
        appointmentTypeId: res.data && res.data.length ? res.data[0].id : ''
      }, () => {
        this.getNextAvailableAppointment();
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });
  }

  setClinic(clinic) {
    this.setState({
      clinicName: clinic.name,
      clinicAddress: clinic.address,
      clinicWebUrl: clinic.web_url,
      clinicVideocallBaseUrl: clinic.videocall_base_url,
    });
  }

  getTimetables() {
    this.api.getTimetables({medic_id: this.props.medic.id}).then(res => {
      this.setState({
        timetables: res.data
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  setAvailableAppointmentsLoading() {
    this.setState({
      availableAppointments: null
    })
  }

  getNextAvailableAppointment(retry) {
    this.setAvailableAppointmentsLoading();
    const objData = {
      medic_id: this.props.medic.id,
      status: APPOINTMENT_STATUS_FREE,
      type_id: this.state.appointmentTypeId,
    };

    if (retry) {
      objData.start = retry && new Date(this.state.selectedDate).toISOString();
    }
    this.api.getNextAppointment(objData, true).then(res => {
      if (res && res.data) {
        const nextAppointmentDate = res.data.start;
        /*const nextAppointmentDate = this.dateTimeService.convertTZ(res.data.start, DEFAULT_TIME_ZONE);
        console.log('nextAppointmentDate:');
        console.log(nextAppointmentDate.toString());*/

        if (!this.state.firstDayAppointmentAvailable) {
          this.setState({
            firstDayAppointmentAvailable: nextAppointmentDate,
          })
        }

        this.setState({
          nextDayAppointmentAvailable: nextAppointmentDate,
          selectedDate: nextAppointmentDate
        }, () => this.getAvailableAppointments());
      }
    }).catch(err => {
      this.setState({
        selectedDate: new Date().toISOString(),
        availableAppointments: [],
        notConfiguredAgenda: true,
      });
      // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      console.log(err);
    })
  }


  getAvailableAppointments(/* bool */ retry = false) {
    this.setAvailableAppointmentsLoading();
    const objData = {
      medic_id: this.props.medic.id,
      status: APPOINTMENT_STATUS_FREE,
      start: this.dateTimeService.getDateStartOfDay(this.dateTimeService.convertTZ(this.state.selectedDate, DEFAULT_TIME_ZONE), false).toISOString(),
      end: this.dateTimeService.getDateEndOfDay(this.dateTimeService.convertTZ(this.state.selectedDate, DEFAULT_TIME_ZONE), false).toISOString(),
      type_id: this.state.appointmentTypeId,
    };
    this.api.getAppointments(objData, true).then(res => {
      this.setState({
        availableAppointments: res.data,
      }, () => {
        if (retry && !this.state.availableAppointments.length) {
          this.getNextAvailableAppointment(true);
          // this.setClinic({});
        } else {
          let clinicSelected = [];
          if (this.state.availableAppointments.length) {
            clinicSelected =
              this.state.clinics.filter(
                clinic => Number(clinic.id) === Number(this.state.availableAppointments[0].clinic_id));
          }
          this.setClinic(clinicSelected && clinicSelected.length ? clinicSelected[0] : {});
        }
        this.setDisableNextAppointment(false);
      });
    }).catch(err => {
      this.props.showMainModal(locales_es.infoModal.title, this.helpers.getErrorMsg(err));
      console.log(err);
    })
  }

  setDisableNextAppointment(bool) {
    this.setState({
      disableNextAppointment: bool
    })
  }

  changeDateAppointment(days) {
    this.cleanSelectedAppointment();
    if (days < 0 && this.isDisablePreviousDate) {
      return;
    }
    const beforeDate = new Date(this.state.nextDayAppointmentAvailable);
    const currentDate = new Date(this.state.selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    this.setState({
      selectedDate: currentDate.toISOString(),
    }, () => {
      const isCurrentDateADateAfter = beforeDate.getTime() < currentDate.getTime();
      this.getAvailableAppointments(isCurrentDateADateAfter);
    });
  }

  get isDisablePreviousDate() {
    return this.state.selectedDate &&
      (new Date(this.state.selectedDate).getTime() <=
        new Date(this.state.firstDayAppointmentAvailable).getTime())
      || (new Date(this.state.selectedDate).getTime() < new Date().getTime())
  }

  handleSelectAppointment(appointment) {
    this.setState({
      selectedAppointment: appointment
    });
  }

  renderSelectedDate() {
    return (
      <>
                <span dangerouslySetInnerHTML={
                  {
                    __html: this.dateTimeService.parseEventDate(this.state.selectedDate, false)
                  }
                }/>
        {/*<span dangerouslySetInnerHTML={
                    {
                        __html: this.dateTimeService.parseEventTime(this.state.selectedDate, false)
                    }
                }/>*/}
      </>
    )
  }

  cleanSelectedAppointment() {
    this.setState({
      selectedAppointment: null
    })
  }

  setSendButtonDisable(bool) {
    this.setState({
      sendButtonDisable: bool
    })
  }

  goToPricesReview() {
    if (this.state.selectedAppointment) {
      const appointmentTimetableId = this.state.selectedAppointment.timetable_id;
      const prices = this.state.timetables.filter(tt => Number(tt.id) === Number(appointmentTimetableId))[0].prices;

      if (prices.length) {
        if (prices.length > 1) {
          // hay que elegir un price
          this.setState({
            prices,
          })
        } else {
          this.postAppointment(prices[0].id);
        }
      } else {
        // no tiene price, es "A Consultar"
        // this.goToAppointmentReview();
        this.postAppointment();
      }
    } else {
      this.props.showMainModal(locales_es.errorModal.title, locales_es.selectAnAppointment)
    }
  }

  goToAppointmentReview() {
    if (!this.auth.isLoggedUser()) {
      this.props.showMainModal(locales_es.infoModal.title, locales_es.youNeedToBeLoggedInToRequestAnAppointment);
      return;
    }
    this.goToPricesReview();
    /*this.state.selectedAppointment ?
      this.postAppointment()
      : this.props.showMainModal(locales_es.errorModal.title, locales_es.selectAnAppointment)*/
  }

  postAppointment(priceId) {
    const objData = JSON.parse(JSON.stringify(this.state.selectedAppointment));
    objData.timetable_slot_id = objData.id;
    objData.type_id = this.state.appointmentTypeId;
    if (this.state.owner_str) {
      objData.owner_str = this.state.owner_str
    }

    if (priceId) {
      objData.timetable_price_id = priceId;
    }
    this.setSendButtonDisable(true);
    this.api.postAppointment(objData).then(res => {


      const appointment = JSON.parse(JSON.stringify(this.state.selectedAppointment));

      const startDatetime = moment(new Date(appointment.start));
      const endDatetime = moment(new Date(appointment.end));
      const duration = moment.duration(endDatetime.diff(startDatetime)).asHours();

      this.setState({
        event: {
          description: `Turno con ${this.props.medic.name} ${this.props.medic.lastname}`,
          duration,
          endDatetime: endDatetime.format('YYYYMMDDTHHmmssZ'),
          location: Number(objData.type_id) === Number(APPOINTMENT_VIRTUAL_TYPE)
            ? `${this.state.clinicVideocallBaseUrl}${res.data.videocall_hash}`
            : Number(objData.type_id) === Number(APPOINTMENT_PRESENTIAL_TYPE) ?
              `https://google.com/maps/place/${this.state.clinicAddress}`
              : '',
          startDatetime: startDatetime.format('YYYYMMDDTHHmmssZ'),
          title: locales_es.medicalAppointment,
          timezone: appointment.time_zone,
          payment_url: res.data.payment_url,
          before_payment_amount: res.data.before_payment_amount,
          payment_status: res.data.payment_status,
        }
      }, () => this.setSendButtonDisable(false));
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      this.setSendButtonDisable(false);
    })
  }

  onValueChange(event) {
    this.setState({
      owner_str: '',
      patient: event.target.value
    });
  }

  handleChange(ev) {
    this.setState({owner_str: ev.target.value});
  }

  handleFormChange = state => ev => {
    this.setState({[state]: ev.target.value}, () => {
      this.getNextAvailableAppointment();
      this.setState({
        notConfiguredAgenda: false
      })
    });
  };

  acceptAction() {
    /*this.setState({
        event: null
    })*/

    const objData = JSON.parse(JSON.stringify(this.state.selectedAppointment));
    objData.timetable_slot_id = objData.id;
    objData.type_id = this.state.appointmentTypeId;
    if (this.state.owner_str) {
      objData.owner_str = this.state.owner_str
    }
    const timetables = JSON.parse(JSON.stringify(this.state.timetables));
    const selectedTimetable = timetables.filter(tt => tt.id === objData.timetable_id)[0];

    const regex = /\n/gm;
    const customStyles = {
      width: '90%',
      height: '70%',
      overflow: 'scroll',
      maxWidth: 'initial',
    };

    const message = selectedTimetable && selectedTimetable.footer_email_text
      ? selectedTimetable.footer_email_text.replace(regex, "<br>") : null;
    if (message) {
      this.props.showMainModal(locales_es.infoModal.title, message, message.length > 300 || regex.test(selectedTimetable.footer_email_text) ? customStyles : null);
    }
    this.props.history.push(hrefDashboard);
  }

  loadPaymentInfo() {
    if (this.props.medic && this.props.medic.enable_before_payment) {
      this.api.getPaymentMethods(this.props.medic.id).then(res => {
        this.setState({
          paymentMethods: res.data
        })
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
    } else {
      this.setState({
        paymentMethods: false
      })
    }
  }

  onPriceSelection(priceId) {
    this.setState({
      prices: null
    }, () => {
      this.postAppointment(priceId);
    })
  }

  render() {

    const {
      loading,
      availableAppointments,
      selectedDate,
      disableNextAppointment,
      clinicName,
      clinicAddress,
      clinicWebUrl,
      interruptedAgenda,
      notConfiguredAgenda,
      appointmentTypeId,
      event,
      paymentMethods,
      bankTransferData,
      mercadoPagoData,
      sendButtonDisable,
      prices,
    } = this.state;

    const {
      medic,
    } = this.props;

    const inputs = [
      {
        label: locales_es.appointmentType,
        placeholder: locales_es.appointmentType,
        id: 1,
        state: 'appointmentTypeId',
        value: this.state.appointmentTypeId,
        type: 'select',
        required: true,
        options: this.state.appointmentTypes,
        wrapperCustomClassName: 'form-group col-md-6',
      },
    ];

    const onBankTransferClick = () => {
      this.setState({
        bankTransferData: true
      }, () => {
        this.api.getBankTransfer(this.props.medic.id).then(res => {
          this.setState({
            bankTransferData: res.data
          })
        }).catch(err => {
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
      })
    };

    const onBankTransferClickCancel = () => {
      this.setState({
        bankTransferData: false,
      })
    };

    const onMercadoPagoClick = () => {
      this.setState({
        mercadoPagoData: true
      }, () => {
        this.api.getBankTransfer(this.props.medic.id).then(res => {
          this.setState({
            mercadoPagoData: res.data
          })
        }).catch(err => {
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
      })
    };

    const onMercadoPagoClickCancel = () => {
      this.setState({
        mercadoPagoData: false,
      })
    };

    const onAcceptMercadoPago = () => {
      window.location.href = this.state.event.payment_url;
      // window.initMPCheckout(this.state.event.payment_url.split('?pref_id=')[1]);
    };

    return (
      interruptedAgenda ?
        <div className="kt-section mt-3">
          <div className="kt-section__desc">
            <div className="alert alert-secondary" role="alert">
              <div className="alert-icon"><i className="flaticon2-information"/></div>
              <div className="alert-text">{this.props.medic && this.props.medic.interrupted_agenda
                ? this.props.medic.interrupted_agenda
                : locales_es.interruptedAgendaProfileMedicDefaultText}</div>
            </div>
          </div>
        </div>
        :
        <div className="kt-section mt-3">
          {loading ? <Loading/> : null}
          <div className="kt-section__desc">
            {this.state.appointmentTypes.length ?
              <Form
                styles="kt-form"
                inputs={inputs}
                handleChange={this.handleFormChange}
              />
              : null
            }
          </div>
          {notConfiguredAgenda ? null
            : appointmentTypeId === null ? <div className="kt-section__desc"><Spinner/></div>
              : Number(appointmentTypeId) === Number(APPOINTMENT_VIRTUAL_TYPE) ?
                <>
                  <div className="kt-section__desc">
                    <strong>{locales_es.virtualAppointment} - {locales_es.availableAppointments}</strong>
                  </div>
                  <div className="kt-section__desc">
                    <i className="flaticon-information"/> {locales_es.virtualAppointmentDescription}
                  </div>
                </>
                :
                <>
                  <div className="kt-section__desc">
                    <strong>{locales_es.consultingAppointment} - {locales_es.availableAppointments}</strong>
                  </div>
                  <div className="kt-section__desc">
                    {locales_es.attentionAddress}:&nbsp;
                    <a href={clinicWebUrl} target="_blank" rel="noreferrer">{clinicName}</a>
                  </div>
                  <div className="kt-demo-icon">
                    <div className="kt-demo-icon__preview">
                      <i className="fa fa-map-marker-alt"/>
                    </div>
                    <div className="kt-demo-icon__class">
                      <a href={`https://google.com/maps/place/${clinicAddress}`}
                         target="_blank"
                         rel="noreferrer">
                        {clinicAddress}
                      </a>
                    </div>
                  </div>
                </>
          }

          {notConfiguredAgenda ?
            <div className="kt-section__content">
              <div className="row medicloud-calendar-week mt-15">
                <div className="col text-center">
                  <div className="alert alert-warning fade show" role="alert">
                    <div className="alert-icon"><i className="flaticon-warning"/></div>
                    <div className="alert-text">
                      {locales_es.medicAgendaNotAvailable}
                      {this.state.appointmentTypes.length
                        ? `. ${locales_es.medicAppointmentTypeNotAvailable} ${this.state.appointmentTypes.filter(appointment => Number(appointment.id) === Number(appointmentTypeId))[0].name}`
                        : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            :
            <div className="kt-section__content">

              <div className="row medicloud-calendar-week mt-15">
                <div
                  onClick={() => this.changeDateAppointment(-1)}
                  className={'col-3 ' +
                    (this.isDisablePreviousDate
                        ? 'invisible'
                        : 'visible'
                    )
                  }
                >
                  <i className="fa fa-chevron-circle-left"/>
                </div>
                <div className="col-6 text-center">
                  <h6>
                    <span>
                      {selectedDate ?
                        this.renderSelectedDate()
                        : null}
                    </span>
                  </h6>
                </div>
                <div
                  className={disableNextAppointment ? 'col-3 text-right disabled' : 'col-3 text-right'}
                  onClick={() => {
                    if (!disableNextAppointment) {
                      this.setState({
                        disableNextAppointment: true
                      }, () => {
                        this.changeDateAppointment(1)
                      })
                    }
                  }}
                >
                  <i className="fa fa-chevron-circle-right"/>
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-xs-12">
                  <div className="medicloud-calendar">
                    <div className="slots justify-content-center">
                      <>
                        {availableAppointments === null ?
                          <Spinner/>
                          :
                          availableAppointments.length
                            ?
                            <>{this.state.availableAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className={
                                  'slot' +
                                  (appointment === this.state.selectedAppointment
                                      ? ' selected'
                                      : ''
                                  )
                                }
                                onClick={() => {
                                  this.handleSelectAppointment(appointment)
                                }}
                              >
                                                                    <span>
                                                                        {
                                                                          this.dateTimeService.parseEventTime(appointment.start, 'full-string')
                                                                        }
                                                                    </span>
                              </div>
                            ))}
                            </>
                            :
                            <div className="text-center">
                              {locales_es.thereIsNoAvailableAppointmentsForTheSelectedDate}
                            </div>
                        }
                      </>
                    </div>
                  </div>
                </div>
              </div>

              <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>

              <div className="form-group row">
                <label className="col-3 col-form-label">{locales_es.whoIsTheAppointmentPatient}</label>
                <div className="col-9">
                  <div className="kt-radio-list">
                    <label className="kt-radio">
                      <input type="radio" name="radio3" value="me"
                             onChange={(e) => this.onValueChange(e)}
                             checked={this.state.patient === 'me'}/> {locales_es.theAppointmentPatientIsMe}
                      <span/>
                    </label>
                    <label className="kt-radio">
                      <input type="radio" name="radio3" value="someone"
                             onChange={(e) => this.onValueChange(e)}
                             checked={this.state.patient === 'someone'}/> {locales_es.theAppointmentPatientIsSomeoneelse}
                      <span/>
                    </label>
                    {this.state.patient === 'someone' &&
                      <input className="form-control" type="text" value={this.state.owner_str}
                             onChange={(ev) => this.handleChange(ev)}
                             placeholder={locales_es.patientFullName}
                             disabled={this.state.patient === 'me'}/>
                    }
                  </div>
                </div>
              </div>

              {this.auth.isLoggedUser() ? null :
                <div className="alert alert-warning fade show" role="alert">
                  <div className="alert-icon"><i className="flaticon-warning"/></div>
                  <div
                    className="alert-text">{locales_es.youNeedToBeLoggedInToRequestAnAppointment}.&nbsp;
                    <a
                      href={`${HREF_REGISTER_PATIENT}?redirect=${HREF_PAGE_MEDIC}/${this.props.medic.id}`}>{locales_es.registerYourself}</a>&nbsp;{locales_es.or}&nbsp;
                    <a
                      href={`${hrefLogin}?redirect=${HREF_PAGE_MEDIC}/${this.props.medic.id}`}>{locales_es.loginYourself}</a>
                  </div>
                </div>
              }
              <div className="text-right p-3 pt-0">
                <button onClick={() => this.goToAppointmentReview()} type="button"
                        className="btn btn-outline-brand btn-bold btn-font-sm btn-upper" disabled={sendButtonDisable}>
                  {sendButtonDisable ? <div className="spinner-border text-success" role="status">
                    <span className="sr-only">Loading...</span>
                  </div> : locales_es.requestAppointment}
                </button>
              </div>
            </div>
          }

          {event && !bankTransferData && !mercadoPagoData ?
            medic.enable_before_payment && paymentMethods && paymentMethods.length
            && event.payment_status !== APPOINTMENT_PAYMENT_STATUS_NOT_APPLY ?
              <AppointmentScheduled
                paymentMethods={paymentMethods}
                onContinue={() => this.acceptAction()}
                medic={this.props.medic}
                showMainModal={this.props.showMainModal}
                onBankTransferClick={onBankTransferClick}
                onMercadoPagoClick={onMercadoPagoClick}
              />
              :
              <AppointmentSuccess
                acceptAction={() => this.acceptAction()}
                event={event}
              />
            : null
          }

          {prices &&
            <PostAppoinmentPriceSelection
              onCancel={() => this.setState({prices: null})}
              onPress={(priceId) => this.onPriceSelection(priceId)}
              prices={prices}/>}

          {bankTransferData &&
            <BankTransferData bankTransferData={bankTransferData} onClickCancel={onBankTransferClickCancel}
                              medic={medic}
                              event={event}
                              onClickAcceptAction={() => this.acceptAction()}/>}

          {mercadoPagoData &&
            <MercadoPagoData mercadoPagoData={mercadoPagoData} onClickCancel={onMercadoPagoClickCancel}
                             medic={medic}
                             event={event}
                             onClickAcceptAction={onAcceptMercadoPago}/>}
        </div>
    )
  }
}
