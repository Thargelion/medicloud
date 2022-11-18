import React, {Component} from 'react';
import locales_es, {fcLocale, WEEKDAYS_LONG} from "../../locales/es";
import Form from "../form";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import {
  APPOINTMENT_VIRTUAL_TYPE,
  DAYS_OF_THE_WEEK,
  DEFAULT_TIME_ZONE,
  FC_SLOT_MAX_TIME,
  FC_SLOT_MIN_TIME, HREF_PAGE_ADD_CLINIC, HREF_PAGE_MEDIC_ADD_TIMETABLE,
  HREF_PAGE_MEDIC_EDIT_TIMETABLES,
  hrefDashboard,
  USER_TYPE_MEDIC,
  USER_TYPE_SECRETARY
} from "../../models/constants";
// import TimeRangeSlider from 'react-time-range-slider';

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid';

import Loading from './../../components/loading';
import Modal from "../modal";
import TimezoneService from "../../modules/timezoneService";
import ConfigService from "../../modules/configService";
import Spinner from "../spinner";
import AuthService from "../../modules/authService";
import DateTimeService from "../../modules/DateTimeService";
import ViewHelpers from "../../modules/viewHelpers";

export default class MedicTimetables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      clinics: null,
      clinicId: null,
      time_zone: DEFAULT_TIME_ZONE, // TODO HARDCODEADO POR AHORA
      consultingRoomOptions: [{
        id: 0
      }],
      duration: 15,
      value: {
        start: FC_SLOT_MIN_TIME,
        end: FC_SLOT_MAX_TIME
      },
      enabled: true,
      modalVisible: false,
      modalDeleteClinicVisible: false,
      selectedTimetableId: 0,
      footer_email_text: '',
      interruptedAgenda: '',
      timezoneOptions: [
        {value: 0, label: locales_es.loading},
      ],
      timezone: DEFAULT_TIME_ZONE,
      appointmentTypes: [],
      appointmentTypeId: null,
      editionDisabled: false,
    };

    this.changeStartHandler = this.changeStartHandler.bind(this);
    this.timeChangeHandler = this.timeChangeHandler.bind(this);
    this.changeCompleteHandler = this.changeCompleteHandler.bind(this);

    this.api = new APIService();
    this.helpers = new Helpers();
    this.viewHelpers = new ViewHelpers();
    this.auth = new AuthService();
    this.timezoneService = new TimezoneService();
    this.configService = new ConfigService();
    this.dateTimeService = new DateTimeService();
  }

  componentDidMount() {
    if (this.props.userType === USER_TYPE_MEDIC) {
      this.loadMedicClinics();
    } else if (this.props.userType === USER_TYPE_SECRETARY) {
      this.loadSecretaryClinic();
    } else {
      window.location.href = hrefDashboard;
    }


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

  loadMedicClinics() {
    this.api.getMyClinics().then(res => {
      this.setState({
        clinics: res.data
      }, () => {
        this.setMedicDefaults();
      });
      this.getTimetables();
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  setMedicDefaults() {
    this.setState({
      clinicId: this.state.clinics && this.state.clinics.length ? this.state.clinics[0].id : null,
      consulting_room_id: this.state.consultingRoomOptions && this.state.consultingRoomOptions.length ? this.state.consultingRoomOptions[0].id : null,
      day: DAYS_OF_THE_WEEK[0].value
    });
  }

  loadSecretaryClinic() {
    this.configService.getLocalClinicData().then(clinic => {
      this.setState({
        clinicId: clinic.id
      }, () => {
        this.api.getConsultingRooms({clinic_id: this.state.clinicId}).then(res => {
          if (res && res.data && res.data.length) {
            this.setState({
              consultingRoomOptions: res.data
            }, () => {
              this.setSecretaryDefaults();
              this.getTimetables();
            });
          } else {
            this.setSecretaryDefaults();
            this.getTimetables();
          }
        }).catch(err => {
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
      });
    }).catch(err => {
      console.log(err);
    });
  }

  setSecretaryDefaults() {
    this.setState({
      consulting_room_id: this.state.consultingRoomOptions[0].id,
      day: DAYS_OF_THE_WEEK[0].value
    });
  }

  getTimetables() {
    this.setLoading(true);
    const objData = {
      medic_id: this.props.medic.id
    };

    if (this.props.userType === USER_TYPE_SECRETARY) {
      objData.clinic_id = this.state.clinicId
    }

    this.api.getTimetables(objData).then(res => {
      // let timetables = JSON.parse(JSON.stringify(res.data));
      let timetables = res.data
        // .sort((a, b) => (Number(String(a.start_date).substring(0,2)) < Number(String(b.start_date).substring(0,2))) ? 1 : -1)
        // .sort((a, b) => (a.day > b.day) ? 1 : -1)
        // .filter(tt => (tt.enabled !== 0))
      ;

      timetables.map((tt, index) => {
        if (tt.start_date && tt.end_date
          && this.dateTimeService.diffTwoDates(new Date(tt.start_date), new Date(tt.end_date)).days <= 1) {
          timetables.splice(index, 1);
        }
      });
      // timetables = timetables.filter(tt => (tt.enabled !== 0 && !tt.start_date && !tt.end_date));
      // timetables = timetables.filter(tt => (!tt.start_date && !tt.end_date));
      this.setState({
        timetables
      });
      this.parseTimetablesForFullCalendar(timetables);
      this.setLoading(false);
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      this.setLoading(false);
    })
  }

  parseTimetablesForFullCalendar(timetables) {
    const parsedTimetables = timetables.map(timetable => {
      // const consultingName = this.state.consultingRoomOptions.filter(room => room.id == timetable.consulting_room_id);
      const consultingName = this.state.consultingRoomOptions.filter(
        room =>
          Number(timetable.consulting_room_id) !== 0 && Number(room.id) === Number(timetable.consulting_room_id));
      timetable.daysOfWeek = [timetable.day];
      timetable.startTime = timetable.start;
      timetable.endTime = timetable.end;
      timetable.consultation_duration = timetable.duration;
      timetable.title = '';

      if(timetable.prices && timetable.prices.length) {
        timetable.title += `${locales_es.price}: `;

        timetable.prices.map(p => {
          timetable.title += `${locales_es.currency_sign}${p.price} - `;
        })
      } else {
        timetable.title += `${locales_es.price}: ${locales_es.notDefined} - `;
      }

      timetable.title += `${locales_es.appointmentDuration}: ${timetable.duration}`;

      if (consultingName && consultingName.length) {
        timetable.title += ` ${locales_es.consultingRoom}: ${consultingName[0].name}`;
      }
      if (timetable.comment) {
        timetable.title += ` ${timetable.comment}`;
      }

      if (Number(timetable.type_id) === Number(APPOINTMENT_VIRTUAL_TYPE)) {
        timetable.className += ` medicloud-event--videocall`;
        timetable.title += ` (Videollamada)`;
      }
      timetable.title += (timetable.enabled ? ` - [${locales_es.enabled}]` : ` - [${locales_es.disabled}]`);

      if (timetable.start_date) {
        timetable.title += ` - ${locales_es.start}: ${this.dateTimeService.parseDateToConventionalAPIString(new window.Date(timetable.start_date))} `;
      }

        if (timetable.end_date) {
            timetable.title += ` - ${locales_es.end}: ${this.dateTimeService.parseDateToConventionalAPIString(new window.Date(timetable.end_date))}`;
        }

      if (!timetable.enabled) {
        timetable.className += ` medicloud-event--disabled`;
      }

      delete timetable.duration; // BORRADO PORQUE ENTRA EN CONFLICTO CON FULLCALENDAR. RENOMBRADO COMO consultation_duration
      delete timetable.start;
      delete timetable.end;
      delete timetable.medic;
      delete timetable.medic_id;
      delete timetable.start_utc;
      delete timetable.end_utc;
      delete timetable.timezone;
      // delete timetable.consultation_price;
      delete timetable.created_at;
      delete timetable.updated_at;
      delete timetable.deleted_at;
      return timetable;
    });

    this.setState({
      events: parsedTimetables
    });
    // console.log(JSON.stringify(parsedTimetables));
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

  confirmEventRemove(timetableId) {
    if (this.state.editionDisabled) {
      this.props.showMainModal(locales_es.infoModal.title, locales_es.timetableDeleteDisabled);
      return;
    }
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

  checkEditionDisable() {
    if (this.props.userType === USER_TYPE_MEDIC) {
      this.api.getMyClinics().then(res => {
        const selectedTimetable = this.state.timetables.filter(tt => Number(tt.id) === Number(this.state.selectedTimetableId));
        let selectedClinic = [];
        if (selectedTimetable.length) {
          selectedClinic = res.data.filter(clinic => Number(clinic.id) === Number(selectedTimetable[0].clinic_id));
        }
        this.setState({
          editionDisabled: !selectedClinic.length
        })
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        this.setState({
          editionDisabled: true, // for safe reasons...
        });
      })
    }
  }

  setSelectedTimetableIdAndOpenModal(timetableId) {
    this.setState({
      selectedTimetableId: timetableId,
      modalVisible: true,
    });
    this.checkEditionDisable(timetableId);
  }

  renderSelectedTimetableInfo() {
    if (!this.state.selectedTimetableId) {
      this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.unexpectedError);
      return;
    }

    const timetables = JSON.parse(JSON.stringify(this.state.timetables));
    const selectedTimetable = timetables.filter(tt => Number(tt.id) === Number(this.state.selectedTimetableId))[0];
    const selectedTimetableEnabled = Boolean(selectedTimetable.enabled);

    return (
      <div>
        <p>{locales_es.day}: {WEEKDAYS_LONG[selectedTimetable.day]}</p>
        <p>{locales_es.from}: {selectedTimetable.startTime}</p>
        <p>{locales_es.to}: {selectedTimetable.endTime}</p>
        <p>{locales_es.price}: {this.viewHelpers.getTimetablePricesText(selectedTimetable)}</p>
        {selectedTimetable.comment &&
        <p>{locales_es.observations}: {selectedTimetable.comment}</p>
        }
        {selectedTimetable.start_date &&
        <p>{locales_es.startDate}: {this.dateTimeService.parseDateToConventionalAPIString(new window.Date(selectedTimetable.start_date))}</p>
        }
        {selectedTimetable.end_date &&
        <p>{locales_es.endDate}: {this.dateTimeService.parseDateToConventionalAPIString(new window.Date(selectedTimetable.end_date))}</p>
        }
        <strong><i className={selectedTimetableEnabled ? 'flaticon2-check-mark kt-font-success' : 'flaticon2-cross kt-font-danger'} /> {selectedTimetableEnabled ? locales_es.enabled : locales_es.disabled}</strong>
      </div>
    )
  }

  goToAddTimetable() {
    window.location.href = `${HREF_PAGE_MEDIC_ADD_TIMETABLE}/${this.props.medic.id}`;
  }

  goToEditTimetable(timetableId) {
    window.location.href = `${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${this.props.medic.id}/${timetableId}`;
  }

  goToEditClinic() {
    window.location.href = `${HREF_PAGE_ADD_CLINIC}/${this.props.medic.id}/${this.state.clinicId}`;
  }

  sendInterruptedAgenda() {
    this.api.putInterruptedAgenda(this.props.medic.id, {interrupted_agenda: this.state.interruptedAgenda}).then(res => {
      this.props.showMainModal(locales_es.successModal.title, res.message);
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });
  }

  render() {
    const interruptedAgendaInputs = [
      {
        label: locales_es.interruptedAgendaText,
        placeholder: locales_es.interruptedAgendaTextPlaceholder,
        id: 6,
        state: 'interruptedAgenda',
        value: this.state.interruptedAgenda,
        type: 'textarea',
        required: false,
        wrapperCustomClassName: 'form-group clear',
      },
    ];

    const {clinics} = this.state;

    return (
      <>
        {this.state.loading ? <Loading/> : null}
        {this.props.userType === USER_TYPE_MEDIC && clinics === null ? <Spinner/> :
          clinics && clinics.length || this.props.userType === USER_TYPE_SECRETARY ?
            <div className="kt-portlet">
              <div className="row mt-3">
                <div className="col text-center">
                  <FullCalendar
                    eventClassNames={'medicloud-remove-cursor-icon'}
                    plugins={[dayGridPlugin, timeGridPlugin]}
                    initialView="timeGridWeek" // timeGridWeek, dayGridWeek
                    headerToolbar={null}
                    slotMinTime={FC_SLOT_MIN_TIME}
                    slotMaxTime={FC_SLOT_MAX_TIME}
                    eventClick={(e) => {
                      // this.confirmEventRemove(e.event.id)
                      this.setSelectedTimetableIdAndOpenModal(e.event.id);
                    }}
                    // titleFormat={(e) => console.log(e)}
                    locale={fcLocale}
                    dayHeaderContent={(args) => args.text.substr(0, 3)}
                    allDaySlot={false}
                    events={this.state.events}
                  />
                </div>
              </div>
              <div className="row m-4">
                <div className="col text-center">
                  <button type="button"
                    onClick={() => this.goToAddTimetable()}
                    className="btn btn-brand btn-elevate btn-pill mr-3">{locales_es.addLapseTime}</button>
                </div>
              </div>
            </div>
            :
            <div className="kt-portlet p-3">
              <div className="alert alert-warning fade show mt-3" role="alert">
                <div className="alert-icon"><i className="flaticon-warning"></i></div>
                <div className="alert-text">No tienes lugares de atención. Ingresa al menos uno para configurar tus
                  turnos.
                </div>
                <div className="alert-close">
                  <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true"><i className="la la-close"></i></span>
                  </button>
                </div>
              </div>
              <div className="text-center">
                <a href={`${HREF_PAGE_ADD_CLINIC}/${this.props.medic.id}`}
                   className="btn btn-brand btn-sm btn-bold btn-upper">+ {locales_es.addClinic}</a>
              </div>
            </div>
        }

        <div className="kt-portlet">
          <div className="row mt-5 pt-3">
            <div className="col text-center">
              <h3>{locales_es.interruptedAgendaTitle}</h3>
              <p>{locales_es.interruptedAgendaTextDescription}</p>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col text-center">
              <Form
                styles="kt-form"
                inputs={interruptedAgendaInputs}
                handleChange={this.handleChange}
                wrapper={true}
              />
            </div>
          </div>
          <div className="row m-4">
            <div className="col text-center">
              <button type="button"
                      onClick={() => this.sendInterruptedAgenda()}
                      className="btn btn-warning btn-elevate btn-pill mr-3">
                <i className="flaticon-danger"/> {locales_es.interruptedAgendaSend}</button>
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

        {this.state.modalDeleteClinicVisible &&
        <Modal modalId="assignAppointment"
               title={locales_es.deleteAttentionPlace}
               visible={this.state.modalDeleteClinicVisible}
               hideCloseButton={true}
               actions={[
                 {
                   className: 'btn btn-brand btn-danger btn-pill m-3 align-self-start',
                   title: locales_es.delete,
                   onClick: () => this.confirmDeleteClinic()
                 },
                 {
                   className: 'btn btn-secondary btn-pill',
                   title: locales_es.cancel,
                   onClick: () => this.closeModal()
                 }
               ]}
        />}
      </>
    )
  }
}
