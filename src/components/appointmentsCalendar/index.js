import React, {Component} from 'react';
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid';
import locales_es, {fcLocale} from "../../locales/es";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Loading from "./../../components/loading"
import {
    APPOINTMENT_MIXED_TYPE, APPOINTMENT_PRESENTIAL_TYPE,
    APPOINTMENT_STATUS_OCCUPIED, APPOINTMENT_VIRTUAL_TYPE,
    DEFAULT_TIME_ZONE,
    FC_SLOT_MAX_TIME,
    FC_SLOT_MIN_TIME, HREF_PAGE_ADD_PATIENT, HREF_PAGE_VIDEOCALL, STATUS_COLORS,
} from "../../models/constants";
import DateTimeService from "../../modules/DateTimeService";
import Modal from "../modal";
import Spinner from "../../components/spinner";
import VideoCallIcon from '../../images/video-call-16.png';
import Form from "../form";
import Schedules from "../schedules";
import StatusDropdown from "../statusDropdown";

import "./index.css";
import PaymentStatusDropdown from "../paymentStatusDropdown";
import ConfigService from "../../modules/configService";

export default class AppointmentsCalendar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            appointmentId: window.URLSearchParams
                ? JSON.parse(new window.URLSearchParams(this.props.location.search).get("appointmentId")) : null,
            slot: window.URLSearchParams
                ? JSON.parse(new window.URLSearchParams(this.props.location.search).get("slot")) : null,
            patientDestination: 'me',
            owner_str: '',
            initialView: 'timeGridWeek', // timeGridWeek, dayGridWeek, dayGridMonth
            appointmentTypes: [{
                id: APPOINTMENT_PRESENTIAL_TYPE
            }],
            appointmentTypeId: null,
            externalVideocallUrl: null,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.dateTimeService = new DateTimeService();
        this.calendarComponentRef = React.createRef();
        this.configService = new ConfigService();
    }

    componentDidMount() {
        this.getConsultingRoomOptions();
        this.getMyPatients();
        if (this.props.medic && this.props.medic.id) {
            this.api.getMedicAppointmentsTypes(this.props.medic.id).then(res => {
                this.setState({
                    appointmentTypes: res.data,
                    // appointmentTypeId: res.data && res.data.length ? res.data[0].id : ''
                })
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });

            this.getAppointmentId();
        }
    }

    getAppointmentId() {
        if (this.state.appointmentId) {
            this.api.getAppointment(this.state.appointmentId).then(res => {
                if (res && res.data) {
                    const obj = res.data;
                    obj.appointment_id = res.data.id;
                    obj.startStr = res.data.start;
                    obj.endStr = res.data.end;
                    this.onEventClick(obj);
                }
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        }
    }

    getConsultingRoomOptions() {
        this.configService.getLocalClinicData().then(clinic => {
            this.api.getConsultingRooms({clinic_id: clinic.id}).then(res => {
                this.setState({
                    clinicId: clinic.id,
                    consultingRoomOptions: res.data
                }, () => this.setLoading(false));
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                this.setLoading(false);
            });
        }).catch(err => {
            console.log(err);
        });
    }

    getMyPatients() {
        this.api.getIdentificationTypes().then(res => {
            this.setState({
                identificationOptions: res.data
            }, () => {
                this.api.getMyPatients().then(res => {
                    this.setState({
                        // patients: res.data,
                        apiPatients: res.data,
                    });
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    }

    parseEventsForFullCalendar(events) {
        events.map(event => {
            // Id del slot
            event.timetable_slot_id = event.id;
            // const consultingName = this.state.consultingRoomOptions.filter(room => room.id == event.consulting_room_id)[0].name
            event.className = ['medicloud-fc-event'];

            // Copiamos el start para el modal de asignación de turno
            event.startStr = event.start;
            event.endStr = event.end;

            // Timezone definido para turnos físicos // Esto hay que apagarlo en videollamadas
            event.start = this.dateTimeService.convertTZ(event.start, DEFAULT_TIME_ZONE);
            event.end = this.dateTimeService.convertTZ(event.end, DEFAULT_TIME_ZONE);

            if (event.patient_id) {
                event.title = `${event.patient.name} ${event.patient.lastname}`;
                event.className.push('medicloud-remove-cursor-icon');
            } else {
                event.title = `${locales_es.freeAppointment}`;
                event.className.push('medicloud-fc-event-pointer');
            }

            if (event.status) {
                event.className.push(`fc-dot ${STATUS_COLORS.calendarDot[event.status]}`);
            }

            if (event.owner_str) {
                event.title += ` - ${event.owner_str}`
            }
            if (event.slot_status === APPOINTMENT_STATUS_OCCUPIED) {
                event.className.push('medicloud-fc-event--occupied');

                if (!event.patient_id) {
                    event.title = locales_es.blockedAppointment;
                    event.className.push('medicloud-fc-event--blocked');
                }
            }

            if (Number(event.type_id) === Number(APPOINTMENT_VIRTUAL_TYPE)) {
                event.className.push('medicloud-event--videocall');
                event.title += ` (Videollamada)`;
            }

            if (Number(event.type_id) === Number(APPOINTMENT_MIXED_TYPE)) {
                event.className.push('medicloud-event--mixed');
                event.title += ` (MIXTO) +Info`;
            }

            delete event.duration; // BORRADO PORQUE ENTRA EN CONFLICTO CON FULLCALENDAR. RENOMBRADO COMO consultation_duration
            delete event.created_at;
            delete event.updated_at;
            delete event.deleted_at;
            return event;
        });

        // console.log(events);
        return events;
    }

    parseNonWorkingEvent(events) {
        return events.map(event => {
            // const consultingName = this.state.consultingRoomOptions.filter(room => room.id == event.consulting_room_id)[0].name
            event.className = ['medicloud-fc-event'];

            // Timezone definido para turnos físicos // Esto hay que apagarlo en videollamadas
            event.start = this.dateTimeService.getDateStartOfDay(new Date(event.date), true);
            event.end = this.dateTimeService.getDateEndOfDay(new Date(event.date), true);

            event.title = locales_es.nonWorkingDays;
            event.type = 'non-working';
            event.display = 'background';
            delete event.duration; // BORRADO PORQUE ENTRA EN CONFLICTO CON FULLCALENDAR. RENOMBRADO COMO consultation_duration
            delete event.created_at;
            delete event.updated_at;
            delete event.deleted_at;
            return event;
        });
    }

    getCalendarData(fetchInfo, successCallback) {
        try {
            const objData = {
                medic_id: this.props.medic.id,
                clinic_id: this.state.clinicId,
                start: new Date(fetchInfo.start).toISOString(),
                end: new Date(fetchInfo.end).toISOString(),
            };
            this.api.getNonWorkingDays(objData).then(nonWorkingRes => {

                const parsedNonWorkingRes = this.parseNonWorkingEvent(nonWorkingRes.data);

                this.api.getAppointments(objData).then(res => {

                    successCallback(
                        this.parseEventsForFullCalendar(res.data).concat(parsedNonWorkingRes)
                    );

                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });

            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        } catch (error) {
            console.log(error);
        }
    }

    onEventClick(event) {
        // console.log(event);
        if (event.type === "non-working") {
            return;
        }
        if (event.slot_status === APPOINTMENT_STATUS_OCCUPIED && !event.patient_id) {
            const confirm = window.confirm(locales_es.confirmAppointmentUnlock);
            if (confirm) {
                this.api.cancelAppointment(event.appointment_id).then(res => {
                    this.props.showMainModal(locales_es.successModal.title, res.message);
                    this.componentDidMount();
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                })
            }
            return;
        }
        this.setState({
            appointmentTypeId: Number(event.type_id) === APPOINTMENT_MIXED_TYPE ? this.state.appointmentTypes[0].id : event.type_id
        }, () => {
            if (event.appointment_id) {
                const clonedEvent = JSON.parse(JSON.stringify(event));
                clonedEvent.info = true;
                this.api.getAppointment(event.appointment_id).then(res => {

                    const mergedEvent = Object.assign(clonedEvent, res.data);

                    this.setState({
                        slot: mergedEvent,
                        patient: mergedEvent.patient,
                        appointmentTypeId: res.data.type_id,
                        externalVideocallUrl: res.data.external_videocall_url,
                        initialDate: this.calendarComponentRef.current._calendarApi.getDate(),
                        initialView: this.calendarComponentRef.current._calendarApi.currentDataManager.state.currentViewType,
                    });
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
                /*
                this.setState({
                    slot: clonedEvent,
                    patient: clonedEvent.patient,
                    initialDate: this.calendarComponentRef.current._calendarApi.getDate(),
                    initialView: this.calendarComponentRef.current._calendarApi.currentDataManager.state.currentViewType,
                });
                */
            } else {
                this.api.getTimetablePrices(event.timetable_id).then(res => {
                    const prices = res.data.map(p => {
                        p.name = `${locales_es.currency_sign}${p.price} - ${p.title}`;
                        return p;
                    });
                    this.setState({
                        slot: event,
                        priceId: prices.length ? prices[0].id : null,
                        prices,
                        initialDate: this.calendarComponentRef.current._calendarApi.getDate(),
                        initialView: this.calendarComponentRef.current._calendarApi.currentDataManager.state.currentViewType,
                    })
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
            }
        });
    }

    deleteAppointment() {
        const confirm = window.confirm(locales_es.confirmAppointmentRemoval);
        if (confirm) {
            this.api.cancelAppointment(this.state.slot.appointment_id).then(res => {
                this.props.showMainModal(locales_es.successModal.title, res.message);
                this.componentDidMount();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            })
        }
        this.closeModal();
    }

    onSearchSubmit(ev) {
        if (ev && ev.preventDefault) {
            ev.preventDefault();
        }
        const form = document.getElementById('searchForm');
        const query = form.children[0].value;

        this.setState({
            patients: this.state.apiPatients
        }, () => {
            if (!query) {
                return;
            }
            const regex = new RegExp(query, 'i'); // add 'i' modifier that means "ignore case"

            let patients = JSON.parse(JSON.stringify(this.state.patients));
            patients = patients.filter(patient => {
                if (regex.test(patient.name) || regex.test(patient.lastname) || regex.test(patient.email)) {
                    return patient;
                }
            });
            this.setState({
                patients
            });
        })
    }

    validateForm() {
        if (!this.state.patient) {
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.selectAPatient);
            return false;
        }

        if (!this.state.appointmentTypeId || this.state.appointmentTypeId === APPOINTMENT_MIXED_TYPE) {
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.selectAnAppointmentType);
            return false;
        }

        return true;
    }

    postAppointment() {
        if (this.validateForm()) {
            const objData = JSON.parse(JSON.stringify(this.state.slot));
            objData.patient_id = this.state.patient.id;
            objData.start = this.state.slot.startStr;
            objData.end = this.state.slot.endStr;
            objData.type_id = this.state.appointmentTypeId;
            objData.external_videocall_url = this.state.externalVideocallUrl;
            if (this.state.owner_str) {
                objData.owner_str = this.state.owner_str
            }
            if (this.state.priceId) {
                objData.timetable_price_id = this.state.priceId
            }
            objData.timetable_slot_id = this.state.slot.timetable_slot_id;
            // console.log(objData);
            this.api.postAppointment(objData).then(res => {
                this.props.showMainModal(locales_es.successModal.title, res.message);
                this.removePatient();
                this.setState({
                    slot: null
                })
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        }
    }

    blockAppointment() {
        const objData = JSON.parse(JSON.stringify(this.state.slot));
        objData.start = this.state.slot.startStr;
        objData.end = this.state.slot.endStr;
        objData.timetable_slot_id = this.state.slot.timetable_slot_id;
        this.api.postBlockAppointment(objData).then(res => {
            this.props.showMainModal(locales_es.successModal.title, res.message);
            this.removePatient();
            this.setState({
                slot: null
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
    }

    selectPatient(patient) {
        this.setState({
            patient,
        })
    }

    removePatient() {
        this.setState({
            patient: null,
            patients: undefined
        })
    }

    renderAddPatientButton() {
        return (
            <div className="row">
                <div className="pt-3 m-auto">
                    <a href={`${HREF_PAGE_ADD_PATIENT}?redirect=${window.location.pathname}&slot=${JSON.stringify(this.state.slot)}&medic_id=${this.props.medic.id}`}
                       className="btn btn-brand btn-sm btn-bold btn-upper">{locales_es.addPatient}</a>
                </div>
            </div>
        )
    }

    onValueChange(event) {
        this.setState({
            owner_str: '',
            patientDestination: event.target.value
        });
    }

    handleChange(ev) {
        this.setState({owner_str: ev.target.value});
    }

    closeModal() {
        this.setState({
            slot: null,
            patients: undefined,
            patient: null,
            externalVideocallUrl: null,
        })
    }

    handleFormChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    putAppointment() {
        const objData = {
            external_videocall_url: this.state.externalVideocallUrl,
            type_id: this.state.appointmentTypeId,
        };
        this.api.putAppointment(this.state.slot.appointment_id, objData).then(res => {
            this.props.showMainModal(locales_es.successModal.title, res.message);
            this.closeModal();
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            this.closeModal();
        });
    }

    getVideocallUrl(slot) {
        if (slot.external_videocall_url) {
            return slot.external_videocall_url;
        }
        return `${HREF_PAGE_VIDEOCALL}/${slot.videocall_hash}`;
    }

    render() {
        const {loading, slot, patients, patient, prices} = this.state;

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
                wrapperCustomClassName: 'form-group',
                // disabled: slot && slot.type_id !== APPOINTMENT_MIXED_TYPE,
            },
        ];

        const priceInputs = [
            {
                label: locales_es.price,
                placeholder: locales_es.price,
                id: 3,
                state: 'priceId',
                value: this.state.priceId,
                type: 'select',
                required: true,
                options: this.state.prices,
                wrapperCustomClassName: 'form-group',
                // disabled: slot && slot.type_id !== APPOINTMENT_MIXED_TYPE,
            },
        ];

        const videocallForm = [
            {
                label: locales_es.externalVideocallLink,
                placeholder: locales_es.externalVideocallLinkPlaceholder,
                id: 1,
                state: 'externalVideocallUrl',
                value: this.state.externalVideocallUrl,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group',
                // disabled: slot && slot.type_id !== APPOINTMENT_MIXED_TYPE,
            },
        ];

        return (
            <>
                {
                    loading ?
                        <Loading/>
                        :
                        slot ?
                            <Modal modalId="assignAppointment"
                                   title={!slot.info ? locales_es.assignAppointment : locales_es.appointmentInfo}
                                   visible={slot}
                                   hideCloseButton={true}
                                   actions={!slot.info ? [
                                       {
                                           className: patient ? 'btn btn-brand btn-danger btn-pill m-3 align-self-start d-none' : 'btn btn-brand btn-danger btn-pill m-3 align-self-start',
                                           title: locales_es.blockAppointment,
                                           onClick: () => this.blockAppointment()
                                       },
                                       {
                                           className: 'btn btn-brand btn-elevate btn-pill m-3 align-self-start',
                                           title: locales_es.assignAppointment,
                                           onClick: () => this.postAppointment()
                                       },
                                       {
                                           className: 'btn btn-secondary btn-pill',
                                           title: locales_es.cancel,
                                           onClick: () => this.closeModal()
                                       }
                                   ] : [
                                       {
                                           className: 'btn btn-brand btn-warning btn-pill m-3 align-self-start',
                                           title: locales_es.saveChanges,
                                           onClick: () => this.putAppointment()
                                       },
                                       {
                                           className: 'btn btn-brand btn-danger btn-pill m-3 align-self-start',
                                           title: locales_es.remove,
                                           onClick: () => this.deleteAppointment()
                                       },
                                       {
                                           className: 'btn btn-secondary btn-pill',
                                           title: locales_es.close,
                                           onClick: () => this.closeModal()
                                       }
                                   ]}
                            >
                                <div className="kt-section mt-3">
                                    <div className="kt-section__desc">
                                        {slot.appointment_id &&
                                              <>
                                                    <StatusDropdown appointmentId={slot.appointment_id}
                                                                    showTitle={true}
                                                                    showMainModal={this.props.showMainModal}
                                                                    style={{
                                                                        paddingLeft: '11px',
                                                                        float: 'right',
                                                                    }}
                                                    />

                                                  {this.props.medic && this.props.medic.enable_before_payment &&
                                                      <PaymentStatusDropdown appointmentId={slot.appointment_id}
                                                                      showTitle={true}
                                                                      showMainModal={this.props.showMainModal}
                                                                      style={{
                                                                          paddingLeft: '11px',
                                                                          float: 'right',
                                                                      }}
                                                      />
                                                  }
                                              </>
                                        }
                            <span dangerouslySetInnerHTML={
                                {
                                    __html: slot && this.dateTimeService.parseEventDate(slot.startStr)
                                }
                            }/>&nbsp;
                                        {
                                            slot && this.dateTimeService.parseEventTime(slot.startStr, 'full-string')
                                        }
                                        &nbsp;-&nbsp;
                                        {
                                            slot && this.dateTimeService.parseEventTime(slot.endStr, 'full-string')
                                        }
                                    </div>
                                    <div className="kt-section__desc">

                                        {slot.consultation_price || slot.before_payment_amount ?
                                        <div className="mt-5 mb-5">
                                            {slot.consultation_price ?
                                            <p><span className="font-weight-bold">Precio del Turno:</span> {locales_es.currency_sign}{slot.consultation_price}</p>
                                              : null }
                                            {slot.before_payment_amount ?
                                            <p><span className="font-weight-bold">Precio a abonar en la plataforma:</span> {locales_es.currency_sign}{slot.before_payment_amount}</p>
                                              : null }
                                        </div>
                                        : null }

                                        {this.state.appointmentTypes.length ?
                                            <Form
                                                styles={"d-inline-block col-md-6" + (!slot.appointment_id && prices && prices.length ? " float-left" : "")}
                                                inputs={inputs}
                                                handleChange={this.handleFormChange}
                                            />
                                            : null
                                        }

                                        {!slot.appointment_id && prices && prices.length ?
                                          <Form
                                            styles="d-inline-block col-md-6"
                                            inputs={priceInputs}
                                            handleChange={this.handleFormChange}
                                          />
                                          : null
                                        }
                                        <div
                                            className="kt-quick-search kt-quick-search--offcanvas kt-quick-search--has-result"
                                            id="kt_quick_search_offcanvas">
                                            {patient ?
                                                slot.info ? null :
                                                    <button onClick={() => this.removePatient()} type="button"
                                                            className="btn btn-elevate btn-circle btn-icon mr-2 float-right">
                                                        <i className="flaticon-close"/></button>
                                                :
                                                <form onSubmit={(e) => this.onSearchSubmit(e)}
                                                      className="kt-input-icon kt-input-icon--right"
                                                      id="searchForm">
                                                    <input className="form-control"
                                                           type="search"
                                                           onChange={(e) => this.onSearchSubmit(e)}
                                                           placeholder={locales_es.searchByPatientsNameOrLastname}/>
                                                    <span onClick={(e) => this.onSearchSubmit(e)}
                                                          className="kt-input-icon__icon kt-input-icon__icon--right">
                                                    <span><i className="la la-search"/></span>
                                                </span>
                                                </form>
                                            }
                                            <div className="kt-quick-search__wrapper">
                                                <div className="kt-quick-search__result">
                                                    {patient ?
                                                        <>
                                                            <div className="row">
                                                                <div
                                                                    className="kt-portlet kt-portlet--height-fluid pointer">
                                                                    <div
                                                                        className="kt-widget kt-widget--general-2">
                                                                        <div
                                                                            className="kt-portlet__body kt-portlet__body--fit">
                                                                            <div
                                                                                className="kt-widget__top p-0">
                                                                                <div
                                                                                    className="kt-portlet__body kt-portlet__body--fit">
                                                                                    <div
                                                                                        className="kt-widget__top">
                                                                                        <div
                                                                                            className="kt-media kt-media--lg kt-media--circle">
                                                                                            <img
                                                                                                src={patient.full_profile_image}
                                                                                                alt=""/>
                                                                                        </div>
                                                                                        <div
                                                                                            className="kt-widget__wrapper">
                                                                                            <div
                                                                                                className="kt-widget__label"><span
                                                                                                className="kt-widget__title">{patient.name} {patient.lastname}</span>
                                                                                                <span
                                                                                                    className="kt-widget__desc">{patient.identification}</span>
                                                                                                <a href={`mailto:${patient.email}`}
                                                                                                   className="kt-widget__desc"><i
                                                                                                    className="flaticon2-send kt-font-success"/> {patient.email}
                                                                                                </a>
                                                                                                <a href={`tel:${patient.cellphone}`}
                                                                                                   className="kt-widget__desc"><i
                                                                                                    className="fa fa-phone-square"/> {patient.cellphone}
                                                                                                </a>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {slot.info ?
                                                                <>
                                                                    {slot.owner_str &&
                                                                    <>
                                                                        <strong
                                                                            className="col-form-label">{locales_es.whoIsTheAppointmentPatient}</strong>
                                                                        <br/>
                                                                        <label
                                                                            className="col-form-label">{slot.owner_str}</label>
                                                                    </>
                                                                    }
                                                                    {slot.schedules_reminders && slot.schedules_reminders.length &&
                                                                        <Schedules data={slot.schedules_reminders} />
                                                                    }
                                                                </>
                                                                :
                                                                <>
                                                                    <div
                                                                        className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>

                                                                    <div className="form-group row">
                                                                        <label
                                                                            className="col-3 col-form-label">{locales_es.whoIsTheAppointmentPatient}</label>
                                                                        <div className="col-9">
                                                                            <div className="kt-radio-list">
                                                                                <label className="kt-radio">
                                                                                    <input type="radio" name="radio3"
                                                                                           value="me"
                                                                                           onChange={(e) => this.onValueChange(e)}
                                                                                           checked={this.state.patientDestination === 'me'}/> {locales_es.theAppointmentPatientIsForThisPatient}
                                                                                    <span></span>
                                                                                </label>
                                                                                <label className="kt-radio">
                                                                                    <input type="radio" name="radio3"
                                                                                           value="someone"
                                                                                           onChange={(e) => this.onValueChange(e)}
                                                                                           checked={this.state.patientDestination === 'someone'}/> {locales_es.theAppointmentPatientIsSomeoneelse}
                                                                                    <span></span>
                                                                                </label>
                                                                                {this.state.patientDestination === 'someone' &&
                                                                                <input className="form-control"
                                                                                       type="text"
                                                                                       value={this.state.owner_str}
                                                                                       onChange={(ev) => this.handleChange(ev)}
                                                                                       placeholder={locales_es.patientFullName}
                                                                                       disabled={this.state.patientDestination === 'me'}/>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            }
                                                            {(slot.type_id === APPOINTMENT_VIRTUAL_TYPE || slot.type_id === APPOINTMENT_MIXED_TYPE) &&
                                                            (slot.external_videocall_url || slot.videocall_hash) &&
                                                            <div>
                                                                <a href={this.getVideocallUrl(slot)}
                                                                   type="button"
                                                                   target="_blank"
                                                                   title={locales_es.enterVideocall}
                                                                   className={'btn btn-elevate btn-circle btn-icon m-1 ' +
                                                                   (slot.external_videocall_url ? ' btn-focus' : 'btn-primary')}>
                                                                    <i className="flaticon-laptop"/>
                                                                </a>
                                                                <a href={this.getVideocallUrl(slot)}
                                                                   type="button"
                                                                   target="_blank"
                                                                   title={locales_es.enterVideocall}>
                                                                    {slot.external_videocall_url ? locales_es.enterExternalVideocall : locales_es.enterVideocall}
                                                                </a>

                                                                <Form
                                                                    styles="kt-form"
                                                                    inputs={videocallForm}
                                                                    handleChange={this.handleFormChange}
                                                                />
                                                            </div>
                                                            }
                                                        </>
                                                        : patients === null ?
                                                            <div className="row">
                                                                <div className="col text-center">
                                                                    <Spinner/>
                                                                </div>
                                                            </div>
                                                            : patients && patients.length ?
                                                                <>
                                                                    <div className="row">
                                                                        {patients.map(patient => {
                                                                            return (
                                                                                <div key={patient.id}
                                                                                     onClick={() => this.selectPatient(patient)}
                                                                                     className="kt-portlet kt-portlet--height-fluid pointer">
                                                                                    <div
                                                                                        className="kt-widget kt-widget--general-2">
                                                                                        <div
                                                                                            className="kt-portlet__body kt-portlet__body--fit">
                                                                                            <div
                                                                                                className="kt-widget__top p-0">
                                                                                                <div
                                                                                                    className="kt-portlet__body kt-portlet__body--fit">
                                                                                                    <div
                                                                                                        className="kt-widget__top">
                                                                                                        <div
                                                                                                            className="kt-media kt-media--lg kt-media--circle">
                                                                                                            <img
                                                                                                                src={patient.full_profile_image}
                                                                                                                alt=""/>
                                                                                                        </div>
                                                                                                        <div
                                                                                                            className="kt-widget__wrapper">
                                                                                                            <div
                                                                                                                className="kt-widget__label"><span
                                                                                                                className="kt-widget__title">{patient.name} {patient.lastname}</span><span
                                                                                                                className="kt-widget__desc">{patient.identification}</span>
                                                                                                                <span
                                                                                                                  className="kt-widget__desc">{patient.email}</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                    {this.renderAddPatientButton()}
                                                                </>
                                                                : patients === undefined ?
                                                                    <div className="row mt-3">
                                                                        <div className="m-auto">
                                                                            <div className="alert">
                                                                                <div
                                                                                    className="alert-text">{locales_es.searchAPatientToAssignAppointment}...
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    :
                                                                    <>
                                                                        <div className="row mt-3">
                                                                            <div className="m-auto">
                                                                                <div className="alert alert-dark"
                                                                                     role="alert">
                                                                                    <div
                                                                                        className="alert-text">{locales_es.noPatientsFound}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {this.renderAddPatientButton()}
                                                                    </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Modal>
                            :
                            <>
                                <FullCalendar
                                    ref={this.calendarComponentRef}
                                    // eventClassNames={'medicloud-remove-cursor-icon'}
                                    plugins={[dayGridPlugin, timeGridPlugin]}
                                    initialView={this.state.initialView}
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    // timeZone={DEFAULT_TIME_ZONE} // Esto hay que habilitarlo para videollamadas
                                    slotMinTime={FC_SLOT_MIN_TIME}
                                    slotMaxTime={FC_SLOT_MAX_TIME}
                                    eventClick={(e) => {
                                        this.onEventClick(e.event.extendedProps)
                                    }}
                                    // titleFormat={(e) => console.log(e)}
                                    locale={fcLocale}
                                    allDaySlot={false}
                                    events={
                                        (fetchInfo, successCallback, failureCallback) => this.getCalendarData(fetchInfo, successCallback, failureCallback)
                                    }
                                    initialDate={this.state.initialDate}
                                />
                                <br/>
                                <h6>{locales_es.reference}:</h6>
                                <div style={{
                                    backgroundColor: '#ddd',
                                    padding: 10,
                                    color: '#333',
                                }}>
                                    <img src={VideoCallIcon}/> {locales_es.videocalAppointment}
                                </div>
                            </>
                }
            </>
        )
    }
}
