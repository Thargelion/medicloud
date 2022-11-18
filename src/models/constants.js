import locales_es from './../locales/es';
import Logo from './../images/logo.png';

export const userDataLocalStorage = 'user_data';
export const clinicDataLocalStorage = 'clinic_data';
export const clinicDataExpireDateLocalStorage = 'clinic_data_expire_date';

export const APPOINTMENT_PRESENTIAL_TYPE = 1;
export const APPOINTMENT_VIRTUAL_TYPE = 2;
export const APPOINTMENT_MIXED_TYPE = 3;
// TIMEZONE
export const DEFAULT_TIME_ZONE = 'America/Argentina/Buenos_Aires';
export const DEFAULT_SLUGNAME = 'not_configured';

export const IMAGE_LOGO = Logo;

// STORAGE & USER CONSTANTS
export const userAccessToken = 'token';

// CLINIC TODO
// export const CLINIC_ID = process.env.REACT_APP_CLINIC_ID;

// Days of the week
export const DAYS_OF_THE_WEEK = [
    {
        value: 1,
        name: locales_es.daysOfTheWeek.monday,
    },
    {
        value: 2,
        name: locales_es.daysOfTheWeek.tuesday,
    },
    {
        value: 3,
        name: locales_es.daysOfTheWeek.wednesday,
    },
    {
        value: 4,
        name: locales_es.daysOfTheWeek.thursday,
    },
    {
        value: 5,
        name: locales_es.daysOfTheWeek.friday,
    },
    {
        value: 6,
        name: locales_es.daysOfTheWeek.saturday,
    },
    {
        value: 0,
        name: locales_es.daysOfTheWeek.sunday,
    },
];

// HREF
export const HREF_PAGE_HOME = '/';
export const HREF_PAGE_APPOINTMENT_REVIEW = '/appointment-review';
export const HREF_PAGE_MEDIC_ADD_TIMETABLE = '/medic-add-timetable';
export const HREF_PAGE_MEDIC_EDIT_TIMETABLES = '/medic-timetables';
export const HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES = '/medic-single-timetables';
export const HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS = '/nonWorking-days';
export const HREF_PAGE_DASHBOARD = '/dashboard';
export const hrefLogin = '/login';
export const HREF_REGISTER = '/register';
export const HREF_REGISTER_PATIENT = '/register-patient';
export const HREF_REGISTER_MEDIC = '/register-medic';
export const hrefRecovery = '/recovery';
export const hrefDashboard = '/dashboard';
export const HREF_PAGE_CHANGE_PASSWORD = '/change-password';
export const HREF_PAGE_MY_PROFILE = '/my-profile';
export const HREF_PAGE_MY_MEDIC_PROFILE = '/my-medic-profile';
export const HREF_PAGE_MEDIC = '/medic';
export const HREF_PAGE_MEDICS = '/medics';
export const HREF_PAGE_MY_MEDICS = '/my-medics';
export const HREF_PAGE_ONLINE = '/online';
export const HREF_PAGE_VIDEOCALL = '/videocall';
export const HREF_PAGE_ADD_MEDIC = '/add-medic';
export const HREF_PAGE_ADD_CLINIC = '/add-clinic';
export const HREF_PAGE_ADD_PATIENT = '/add-patient';
export const HREF_PAGE_TERMS = '/terms';
export const HREF_PAGE_PATIENTS = '/patients';
export const HREF_PAGE_SETTINGS = '/settings';

// EMAIL REMINDER STATUS
export const EMAIL_REMINDER_STATUS_PENDING = 'pending';
export const EMAIL_REMINDER_STATUS_SENT = 'sent';
export const EMAIL_REMINDER_STATUS_OPENED = 'opened';
export const EMAIL_REMINDER_STATUS_FAIL = 'fail';
export const EMAIL_REMINDER_STATUS_FAILED = 'failed';

// parseTelInput
export const PARSE_TEL_INPUT_ONLY_COUNTRIES = ['AR', 'BR', 'CU', 'EC', 'ES', 'IT', 'MX', 'UY', 'CL', 'PY', 'CO', 'VE', 'PE'];
export const PARSE_TEL_INPUT_COUNTRIES_CODES = [
    {
        countryCode: 'ar',
        dialCode: '+54'
    },
    {
        countryCode: 'br',
        dialCode: '+55'
    },
    {
        countryCode: 'cu',
        dialCode: '+53'
    },
    {
        countryCode: 'ec',
        dialCode: '+593'
    },
    {
        countryCode: 'es',
        dialCode: '+34'
    },
    {
        countryCode: 'it',
        dialCode: '+39'
    },
    {
        countryCode: 'mx',
        dialCode: '+52'
    },
    {
        countryCode: 'uy',
        dialCode: '+598'
    },
    {
        countryCode: 'cl',
        dialCode: '+56'
    },
    {
        countryCode: 'py',
        dialCode: '+592'
    },
    {
        countryCode: 'co',
        dialCode: '+57'
    },
    {
        countryCode: 've',
        dialCode: '+58'
    },
    {
        countryCode: 'pe',
        dialCode: '+51'
    }
];

// API ERROR CODES
export const emailExists = 'email_exists';

// Payment Gateway ID's
export const PAYMENT_METHOD_BANK_TRANSFER = 'bank_transfer';
export const PAYMENT_METHOD_MERCADO_PAGO = 'mercado_pago';
export const STATUS_SUCCESS = 'success';
export const STATUS_FAILED = 'failed';

export const PAYMENT_STATUS_PENDING = 'pending';
export const PAYMENT_METHOD_AMOUNT_TYPE_PERCENT = 'percent';
export const PAYMENT_METHOD_AMOUNT_TYPE_FIXED = 'fixed';
export const MERCADO_PAGO_BASIC = 'mercadopago_basic';
export const STRIPE = 'stripe';

// USER TYPES
export const USER_TYPE_PATIENT = 'patient';
export const USER_TYPE_MEDIC = 'medic';
export const USER_TYPE_SECRETARY = 'secretary';

// APPOINTMENT TYPES
export const APPOINTMENT_STATUS_FREE = 'free';
export const APPOINTMENT_STATUS_OCCUPIED = 'occupied';

export const APPOINTMENT_PAYMENT_STATUS_NOT_APPLY = 'not_apply';



// FULLCALENDAR
// export const FC_SLOT_MIN_TIME = "06:00";
// export const FC_SLOT_MAX_TIME = "23:00";
export const FC_SLOT_MIN_TIME = "08:00";
export const FC_SLOT_MAX_TIME = "21:00";


// SCRIPTS IDS
export const stripeScriptId = 'stripe-library-script';

// HEADER
export const headerNavId = 'headerNav';
export const headerNavLogoutLinkId = 'headerNavLogoutLink';
export const headerNavWrapperId = 'headerNavWrapper';
export const setNavLinksEvent = 'setNavLinks';
export const EVENT_PROFILE_UPDATE = 'eventProfileUpdate';
export const setHiddenHeaderEvent = 'setHiddenHeader';



export const STATUS_COLORS = {
    "appointmentBadges" : {
        "scheduled": "kt-badge--primary",
        "pending": "kt-badge--primary",
        "confirmed": "kt-badge--success",
        "waiting_room": "kt-badge--accent",
        "attending": "kt-badge--focus",
        "completed": "kt-badge--dark",
        "patient_missed": "kt-badge--danger",
        "patient_canceled": "kt-badge--metal",
        "medic_canceled": "kt-badge--metal",
    },
    "appointmentButton" : {
        "scheduled": "btn-primary",
        "pending": "btn-primary",
        "confirmed": "btn-success",
        "waiting_room": "btn-accent",
        "attending": "btn-focus",
        "completed": "btn-dark",
        "patient_missed": "btn-danger",
        "patient_canceled": "btn-metal",
        "medic_canceled": "btn-metal",
    },
    "paymentStatusButton" : {
        "not_aply": "btn-metal",
        "not_apply": "btn-metal",
        "pending": "btn-danger",
        "paid": "btn-success",
    },
    "paymentStatusBadges" : {
        "not_aply": "kt-badge--metal",
        "not_apply": "kt-badge--metal",
        "pending": "kt-badge--danger",
        "paid": "kt-badge--success",
    },
    "paymentStatusFancyDotSpinner": {
        "not_aply": "text-metal",
        "not_apply": "text-metal",
        "pending": "text-danger",
        "paid": "text-success",
    },
    "fancyDotSpinner" : {
        "scheduled": "text-primary",
        "pending": "text-primary",
        "confirmed": "text-success",
        "waiting_room": "text-accent",
        "attending": "text-focus",
        "completed": "text-dark",
        "patient_missed": "text-danger",
        "patient_canceled": "text-metal",
        "medic_canceled": "text-metal",
    },
    "calendarDot" : {
        "scheduled": "dot-primary",
        "pending": "dot-primary",
        "confirmed": "dot-success",
        "waiting_room": "dot-accent",
        "attending": "dot-focus",
        "completed": "dot-dark",
        "patient_missed": "dot-danger",
        "patient_canceled": "dot-metal",
        "medic_canceled": "dot-metal",
    }
};
