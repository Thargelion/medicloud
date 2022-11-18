import {
    apiURL_login,
    apiURL_register,
    apiURL_users,
    apiURL_user_me,
    apiURL_password_request,
    apiURL_user_password,
    apiURL_medics,
    apiURL_config,
    apiURL_identification_types,
    apiURL_genders,
    apiURL_consulting_rooms,
    apiURL_timetables,
    apiURL_appointments,
    apiURL_appointments_next,
    apiURL_appointments_nexts,
    apiURL_appointments_me,
    apiURL_patients_me,
    apiURL_nonworking_days,
    apiURL_nonworking_days_collisions,
    apiURL_profile_image,
    apiURL_clinics,
    apiURL_posts,
    apiURL_stats_totals,
    apiURL_posts_merged,
    apiURL_specialties,
    apiURL_medics_unassign,
    apiURL_patients,
    apiURL_appointments_block,
    apiURL_timezones,
    apiURL_appointments_types,
    apiURL_medics_me,
    apiURL_medic_patient,
    apiURL_messages,
    apiURL_appointments_videocall_token,
    apiURL_medic_patient_hash,
    apiURL_medics_appointment_types,
    apiURL_messages_image,
    apiURL_medics_interrupted_agenda,
    apiURL_user_cellphone,
    apiURL_cellphone_request_validation,
    apiURL_cellphone_validation,
    apiURL_appointments_status,
    apiURL_payment_methods,
    apiURL_payment_config,
    apiURL_mercadopago_info,
    apiURL_mercadopago_auth_link,
    apiURL_payment_amount_types,
    apiURL_payment_methods_user,
    apiURL_payment_method_bank_transfer, apiURL_payments_status, apiURL_appointment_payments_status,
    apiURL_clinics_domain,
    apiURL_clinics_user,
    apiURL_clinics_me, apiURL_medics_slugname, apiURL_timetables_prices,
}
    from "../models/api-urls";

// eslint-disable-next-line
import unregister from './apiService.config'; // No estamos usando el register(), pero importarlo hace que funcione el interceptor

import AuthService from './authService';
import axios from 'axios';

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

class APIService {

    callAuthServiceLogout() {
        const auth = new AuthService();
        auth.logout(true);
    }

    parseError(err) {
        let msg = '';

        msg =
          err && err.data && err.data.message
            ? err.data.message
            : err.message;


        if (
          err &&
          err.errors &&
          err.errors.length
        ) {
            err.errors.map(e => {
                if (e !== msg) {
                    msg += '. ' + e;
                }
            });
        }

        return msg;
    }

    setParams = (urlStr, params) => {
        const url = new URL(urlStr);
        // params = {lat:35.696233, long:139.570431};
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }
        return url;
    };

    getConfig = async () => {
        const response = await fetch(apiURL_config, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getCellphoneValidation = async () => {
        const response = await fetch(apiURL_cellphone_request_validation, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postCellphoneValidation = async (data) => {
        const response = await fetch(apiURL_cellphone_validation, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getPaymentMethods = async (userId) => {
        const url = apiURL_payment_methods + (userId ? ('/user/' + userId) : '');
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getPaymentsAmountTypes = async () => {
        const response = await fetch(apiURL_payment_amount_types, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    putPaymentConfig = async (data) => {
        const response = await fetch(apiURL_payment_config, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    putPaymentMethods = async (data) => {
        const response = await fetch(apiURL_payment_methods, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getPaymentMethodsByUser = async (userId) => {
        const response = await fetch(apiURL_payment_methods_user + '/' + userId, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };


    getBankTransfer = async (userId) => {
        const url = apiURL_payment_method_bank_transfer + (userId ? ('/' + userId) : '');
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    putBankTransferData = async (data) => {
        const response = await fetch(apiURL_payment_method_bank_transfer, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMercadoPagoInfo = async () => {
        const response = await fetch(apiURL_mercadopago_info, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMercadoPagoAuthorizationLink = async (domain) => {
        const response = await fetch(apiURL_mercadopago_auth_link + '?domain=' + domain, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    deleteMercadoPagoAuthorization = async () => {
        const response = await fetch(apiURL_mercadopago_info, {
            method: 'DELETE',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getClinics = async () => {
        const response = await fetch(apiURL_clinics, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMyClinics = async () => {
        const response = await fetch(apiURL_clinics_me, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    getClinicsByUser = async (id) => {
        const response = await fetch(apiURL_clinics_user + '/' + id, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    getClinic = async (domain) => {
        const response = await fetch(apiURL_clinics_domain + '?domain=' + domain, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    getClinicById = async (id) => {
        const response = await fetch(apiURL_clinics + '/' + id, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    postClinic = async (data) => {
        const response = await fetch(apiURL_clinics, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    putClinic = async (id, data) => {
        const response = await fetch(apiURL_clinics + '/' + id, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    deleteClinic = async (id) => {
        const url = new URL(apiURL_clinics);
        const response = await fetch(url + '/' + id, {
            method: 'DELETE',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    getTotals = async (params) => {
        let url = new URL(apiURL_stats_totals);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMergedAnnouncements = async (params) => {
        let url = new URL(apiURL_posts_merged);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        /*if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }*/
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postAnnouncement = async (data) => {
        const response = await fetch(apiURL_posts, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    deleteAnnouncement = async (id) => {
        const url = new URL(apiURL_posts);
        const response = await fetch(url + '/' + id, {
            method: 'DELETE',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    login = async (email, password, clinicId) => {
        const response = await fetch(apiURL_login, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email,
                password,
                clinic_id: clinicId,
            })
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(this.parseError(body));

        return body;
    };

    register = async (data) => {
        const response = await fetch(apiURL_register, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(body.errors && body.errors.length ? body.errors[0] : body.message);

        return body;
    };

    updateCellphone = async (data) => {
        const response = await fetch(apiURL_user_cellphone, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    updateUser = async (data) => {
        const response = await fetch(apiURL_user_me, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    passwordRequest = async (email) => {
        const response = await fetch(apiURL_password_request, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email,
            })
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    updatePassword = async (old_password, new_password, new_password_confirmation) => {
        const response = await fetch(apiURL_user_password, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                old_password,
                new_password,
                new_password_confirmation,
            })
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getUserMe = async () => {
        const response = await fetch(apiURL_user_me, {
            method: 'GET',
            headers
        });
        const body = await response.json();

        if (response.status >= 401) {
            this.callAuthServiceLogout();
            return false;
        }

        if (response.status >= 300) throw Error(body.message);

        return body;
    };

    getUserById = async (id) => {
        const response = await fetch(apiURL_users + '/' + id, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getNonWorkingDays = async (params) => {
        let url = new URL(apiURL_nonworking_days);
        if (params) {
			url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postNonWorkingDays = async (params) => {
        let url = new URL(apiURL_nonworking_days);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'POST',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    deleteNonWorkingDays = async (id) => {
        const url = new URL(apiURL_nonworking_days);
        const response = await fetch(url + '/' + id, {
            method: 'DELETE',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getNonWorkingDaysCollisions = async (params) => {
        let url = new URL(apiURL_nonworking_days_collisions);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMedics = async (params) => {
        let url = new URL(apiURL_medics);
        if (params) {
			url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMyMedics = async () => {
        const response = await fetch(apiURL_medics_me, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMedicPatientBounding = async (params) => {
        let url = new URL(apiURL_medic_patient);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMedicPatientBoundingByHash = async (hash) => {
        const response = await fetch(apiURL_medic_patient_hash + '/' + hash, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMedicById = async (medicId) => {
        const response = await fetch(apiURL_medics + '/' + medicId, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMedicBySlugname = async (slugname) => {
        const response = await fetch(apiURL_medics_slugname + '/' + slugname, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getVideocallData = async (hash) => {
        const response = await fetch(apiURL_appointments_videocall_token + '/' + hash, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status === 401) {
            throw ('401');
            // return;
        }
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMessages = async (medicPatientId) => {
        const response = await fetch(apiURL_messages + '/' + medicPatientId, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postMessage = async (msg, medic_patient_id, clinic_id) => {
        const response = await fetch(apiURL_messages, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                msg,
                medic_patient_id,
                clinic_id,
            })
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postMedic = async (data) => {
        const response = await fetch(apiURL_medics, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    putInterruptedAgenda = async (userId, data) => {
        const response = await fetch(apiURL_medics_interrupted_agenda + '/' + userId, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postPatient = async (data) => {
        const response = await fetch(apiURL_patients, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getIdentificationTypes = async () => {
        const response = await fetch(apiURL_identification_types, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getGenders = async () => {
        const response = await fetch(apiURL_genders, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getTimezones = async () => {
        const response = await fetch(apiURL_timezones, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getSpecialties = async () => {
        const response = await fetch(apiURL_specialties, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getConsultingRooms = async (params) => {
        let url = new URL(apiURL_consulting_rooms);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getAppointmentsTypes = async (params) => {
        let url = new URL(apiURL_appointments_types);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMedicAppointmentsTypes = async (medicId) => {
        const response = await fetch(apiURL_medics_appointment_types + '/' + medicId, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getTimetables = async (params) => {
        let url = new URL(apiURL_timetables);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postTimetables = async (data) => {
        const response = await fetch(apiURL_timetables, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(this.parseError(body));

        return body;
    };

    putTimetable = async (data) => {
        const response = await fetch(apiURL_timetables, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    deleteTimetables = async (id) => {
        const response = await fetch(apiURL_timetables + '/' + id, {
            method: 'DELETE',
            headers,
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getTimetablePrices = async (id) => {
        const response = await fetch(apiURL_timetables + '/' + id + "/prices", {
            method: 'GET',
            headers,
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(this.parseError(body));

        return body;
    };

    postTimetablePrice = async (data) => {
        const response = await fetch(apiURL_timetables_prices, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) throw Error(this.parseError(body));

        return body;
    };

    putTimetablePrice = async (id, data) => {
        const response = await fetch(apiURL_timetables_prices + '/' + id, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    deleteTimetablePrice = async (id) => {
        const response = await fetch(apiURL_timetables_prices + '/' + id, {
            method: 'DELETE',
            headers,
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    unassignMedic = async (params) => {
        let url = new URL(apiURL_medics_unassign);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'DELETE',
            headers,
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getNextAppointment = async (params, isPublic) => {
        let url = new URL(apiURL_appointments_next);
        url += isPublic ? '/public' : '/private';
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getNextAppointments = async (params, isPublic) => {
        let url = new URL(apiURL_appointments_nexts);
        url += isPublic ? '/public' : '/private';
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getPaymentsStatus = async () => {
        const response = await fetch(apiURL_payments_status, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    putPaymentsStatus = async (id, data) => {
        const response = await fetch(apiURL_appointment_payments_status + '/' + id, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getAppointmentsStatus = async () => {
        const response = await fetch(apiURL_appointments_status, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getAppointments = async (params, isPublic) => {
        let url = new URL(apiURL_appointments);
        url += isPublic ? '/public' : '/private';
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getAppointment = async (id) => {
        const response = await fetch(apiURL_appointments + '/' + id, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMyAppointments = async (params) => {
        let url = new URL(apiURL_appointments_me);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    getMyPatients = async (params) => {
        let url = new URL(apiURL_patients_me);
        if (params) {
            url = this.setParams(url, params);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        const body = await response.json();
        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    postAppointment = async (data) => {
        const response = await fetch(apiURL_appointments, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;

    };

    putAppointment = async (id, data) => {
        const response = await fetch(apiURL_appointments + '/' + id, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };

    putAppointmentStatus = async (id, data) => {
        const response = await fetch(apiURL_appointments_status + '/' + id, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;
    };


    postBlockAppointment = async (data) => {
        const response = await fetch(apiURL_appointments_block, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;

    };

    cancelAppointment = async (id) => {
        const response = await fetch(apiURL_appointments + '/' + id, {
            method: 'DELETE',
            headers,
        });
        const body = await response.json();

        if (response.status >= 300) {
            throw Error(body.message);
        }

        return body;

    };

    uploadProfileImage = async (file) => {

        const auth = new AuthService();

        const headers = {
            'AuthorizationJWT': `Bearer ${auth.getAccessToken()}`,
        };

        // Create an object of formData
        const formData = new FormData();

        // Update the formData object
        formData.append(
            "profile_image",
            file,
            file.name
        );

        // Details of the uploaded file
        console.log(file);

        // Request made to the backend api
        // Send formData object
        return axios.post(apiURL_profile_image, formData, {
            headers: headers
        });
    };

    sendImageMessage = async (file, medicPatientId) => {

        const auth = new AuthService();

        const headers = {
            'AuthorizationJWT': `Bearer ${auth.getAccessToken()}`,
        };

        // Create an object of formData
        const formData = new FormData();

        // Update the formData object
        formData.append(
            "image",
            file,
            file.name,
        );

        // Update the formData object
        formData.append(
            "medic_patient_id",
            medicPatientId
        );

        // Details of the uploaded file
        console.log(file);

        // Request made to the backend api
        // Send formData object
        return axios.post(apiURL_messages_image, formData, {
            headers: headers
        });
    };

}

//unregister();

export default APIService;
