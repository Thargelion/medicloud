const getApiURL = () => {
    // 'localhost' or 'a digit'
    /*const localhostRegex = /localhost|192\.168\.0\.7/gm;
    if (localhostRegex.test(window.location.href)) {
        console.warn('AMBIENTE DE PRUEBA');
        return 'https://dev.medicloud.com.ar';
    }*/

    // return window.location.protocol + '//api.' + domain;
    return 'https://api.medicloud.com.ar';
};

// let apiURL = process.env.REACT_APP_PROD_API_ENDPOINT;
let apiURL = getApiURL();

// DEV
if (process.env.REACT_APP_ENV === 'dev') {
    apiURL = 'http://dev.medicloud.com.ar';
}

// MOCK
if (process.env.REACT_APP_ENV === 'mock') {
    apiURL = 'http://localhost:9001';
}

// NGROK
if (process.env.REACT_APP_ENV === 'ngrok') {
    apiURL = 'https://0424-201-231-131-162.ngrok.io';
}

// LOCAL
if (process.env.REACT_APP_ENV === 'local') {
    apiURL = '';
}


const apiVersion = '/v1';
apiURL += apiVersion;


export const apiURL_config = apiURL + '/configs';

export const apiURL_auth = apiURL + '/auth';
export const apiURL_login = apiURL_auth + '/login';
export const apiURL_register = apiURL_auth + '/register';
export const apiURL_checkout = apiURL + '/checkout';
export const apiURL_checkout_stripe = apiURL_checkout + '/stripe';

// Events
export const apiURL_clinics = apiURL + '/clinics';
export const apiURL_clinics_domain = apiURL_clinics + '/domain';
export const apiURL_clinics_user = apiURL_clinics + '/user';
export const apiURL_clinics_me = apiURL_clinics + '/me';
export const apiURL_medic_patient = apiURL + '/medic_patient';
export const apiURL_medic_patient_hash = apiURL_medic_patient + '/hash';
export const apiURL_medics = apiURL + '/medics';
export const apiURL_medics_me = apiURL_medics + '/me';
export const apiURL_medics_slugname = apiURL_medics + '/slugname';
export const apiURL_medics_unassign = apiURL_medics + '/unassign';
export const apiURL_medics_appointment_types = apiURL_medics + '/appointment_types';
export const apiURL_medics_interrupted_agenda = apiURL_medics + '/interrupted_agenda';
export const apiURL_stats = apiURL + '/stats';
export const apiURL_stats_totals = apiURL_stats + '/totals';
export const apiURL_nonworking_days = apiURL + '/nonworking_days';
export const apiURL_nonworking_days_collisions = apiURL_nonworking_days + '/collisions';
export const apiURL_posts = apiURL + '/posts';
export const apiURL_posts_merged = apiURL_posts + '/merged';
export const apiURL_identification_types = apiURL + '/identification_types';
export const apiURL_genders = apiURL + '/genders';
export const apiURL_timezones = apiURL + '/timezones';
export const apiURL_specialties = apiURL + '/specialties';
export const apiURL_consulting_rooms = apiURL + '/consulting_rooms';
export const apiURL_timetables = apiURL + '/timetables';
export const apiURL_timetables_prices = apiURL_timetables + '/prices';
export const apiURL_patients = apiURL + '/patients';
export const apiURL_patients_me = apiURL_patients + '/me';
export const apiURL_messages = apiURL + '/messages';
export const apiURL_messages_image = apiURL_messages + '/image';
export const apiURL_appointments = apiURL + '/appointments';
export const apiURL_appointments_block = apiURL_appointments + '/block';
export const apiURL_appointments_status = apiURL_appointments + '/status';
export const apiURL_appointments_me = apiURL_appointments + '/me';
export const apiURL_appointments_next = apiURL_appointments + '/next';
export const apiURL_appointments_nexts = apiURL_appointments + '/nexts';
export const apiURL_appointments_types = apiURL_appointments + '/types';
export const apiURL_appointments_videocall_token = apiURL_appointments + '/videocall_token';
export const apiURL_payments = apiURL + '/payments';
export const apiURL_payments_status = apiURL_payments + '/status';
export const apiURL_appointment_payments_status = apiURL_appointments + '/payment_status';
export const apiURL_payment_methods = apiURL_payments + '/methods';
export const apiURL_payment_amount_types = apiURL_payments + '/amount_types';
export const apiURL_payment_methods_user = apiURL_payment_methods + '/user';
export const apiURL_payment_method = apiURL + '/payment_method';
export const apiURL_payment_method_bank_transfer = apiURL_payment_method + '/bank_transfer';
export const apiURL_payment_config = apiURL_payments + '/config';
export const apiURL_mercadopago = apiURL + '/mercadopago';
export const apiURL_mercadopago_info = apiURL_mercadopago + '/info';
export const apiURL_mercadopago_auth_link = apiURL_mercadopago + '/authorization_link';

// Users
export const apiURL_users = apiURL + '/users';
export const apiURL_user_me = apiURL_users + '/me';
export const apiURL_user_cellphone = apiURL_users + '/cellphone';
export const apiURL_password_request = apiURL_auth + '/password_request';
export const apiURL_user_password = apiURL_users + '/password';
export const apiURL_profile_image = apiURL_users + '/profile_image';

export const apiURL_cellphone = apiURL + '/cellphone';
export const apiURL_cellphone_request_validation = apiURL_cellphone + '/request_validation';
export const apiURL_cellphone_validation = apiURL_cellphone + '/validation';
