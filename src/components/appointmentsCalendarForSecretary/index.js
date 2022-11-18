import React, {Component} from 'react';
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid';
import locales_es, {fcLocale} from "../../locales/es";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Loading from "./../../components/loading"
import {
    APPOINTMENT_STATUS_OCCUPIED,
    DEFAULT_TIME_ZONE,
    FC_SLOT_MAX_TIME,
    FC_SLOT_MIN_TIME
} from "../../models/constants";
import DateTimeService from "../../modules/DateTimeService";
import ConfigService from "../../modules/configService";

export default class AppointmentsCalendarForSecretary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.dateTimeService = new DateTimeService();
        this.configService = new ConfigService();
    }

    componentDidMount() {
        this.getConsultingRoomOptions();
    }

    getConsultingRoomOptions() {
        this.configService.getLocalClinicData().then(clinic => {
            this.api.getConsultingRooms({clinic_id: clinic.id}).then(res => {
                this.setState({
                    consultingRoomOptions: res.data
                }, () => this.setLoading(false));
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                this.setLoading(false);
            })
        }).catch(err => {
            console.log(err);
        });
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    };

    parseEventsForFullCalendar(events) {
        events.map(event => {
            // const consultingName = this.state.consultingRoomOptions.filter(room => room.id == event.consulting_room_id)[0].name
            event.className = ['medicloud-fc-event'];

            // Timezone definido para turnos físicos // Esto hay que apagarlo en videollamadas
            event.start = this.dateTimeService.convertTZ(event.start, DEFAULT_TIME_ZONE);
            event.end = this.dateTimeService.convertTZ(event.end, DEFAULT_TIME_ZONE);

            if (event.patient_id) {
                event.title = `${event.patient.name} ${event.patient.lastname}`;
                event.className.push('medicloud-remove-cursor-icon');
            } else {
                event.title = `${locales_es.freeAppointment}`;
            }

            if (event.owner_str) {
                event.title += ` - ${event.owner_str}`
            }
            if (event.slot_status === APPOINTMENT_STATUS_OCCUPIED) {
                event.className.push('medicloud-fc-event--occupied');
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
                start: new Date(fetchInfo.start).toISOString(),
                end: new Date(fetchInfo.end).toISOString(),
            }
            this.api.getNonWorkingDays(objData).then(nonWorkingRes => {

                const parsedNonWorkingRes = this.parseNonWorkingEvent(nonWorkingRes.data);
                console.log(parsedNonWorkingRes);

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

    confirmEventRemove(appointmentId) {
        if(!appointmentId) return;
        const confirm = window.confirm(locales_es.confirmAppointmentRemoval);
        if (confirm) {
            this.api.cancelAppointment(appointmentId).then(res => {
                this.props.showMainModal(locales_es.successModal.title, res.message);
                this.componentDidMount();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            })
        }
    }

    render() {

        const {loading} = this.state;

        return (
            loading ?
                <Loading/>
                :
                <FullCalendar
                    // eventClassNames={'medicloud-remove-cursor-icon'}
                    plugins={[dayGridPlugin, timeGridPlugin]}
                    initialView="timeGridWeek" // timeGridWeek, dayGridWeek, dayGridMonth
                    headerToolbar={ {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    // timeZone={DEFAULT_TIME_ZONE} // Esto hay que habilitarlo para videollamadas
                    slotMinTime={FC_SLOT_MIN_TIME}
                    slotMaxTime={FC_SLOT_MAX_TIME}
                    eventClick={(e) => {
                        this.confirmEventRemove(e.event.extendedProps.appointment_id)
                    }}
                    // titleFormat={(e) => console.log(e)}
                    locale={fcLocale}
                    allDaySlot={false}
                    events={
                        (fetchInfo, successCallback, failureCallback) => this.getCalendarData(fetchInfo, successCallback, failureCallback)
                    }
                />
        )
    }
}
