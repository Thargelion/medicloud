import React, {Component} from 'react';
import Loading from "./../../components/loading";
import APIService from './../../modules/apiService';
import Subheader from "../../components/subheader";
import locales_es from "../../locales/es";
import {
    DEFAULT_TIME_ZONE, HREF_PAGE_ADD_MEDIC, HREF_PAGE_HOME,
    HREF_PAGE_MEDICS, PARSE_TEL_INPUT_ONLY_COUNTRIES, USER_TYPE_MEDIC,
    USER_TYPE_SECRETARY
} from "../../models/constants";
import Helpers from "../../modules/helpers";
import AuthService from "../../modules/authService";
import Form from "../../components/form";
import DateTimeService from "../../modules/DateTimeService";
import intlTelInput from "intl-tel-input";
import ConfigService from "../../modules/configService";
import TimezoneService from "../../modules/timezoneService";

export default class AddMedicPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            prefix_name: '',
            name: '',
            lastname: '',
            email: '',
            email_repeat: '',
            password: '',
            password_confirmation: '',
            loginMode: false,
            user_type: USER_TYPE_MEDIC,
            identificationOptions: [],
            genderOptions: [],
            timezoneOptions: [
                { value: 0, label: locales_es.loading },
            ],
            timezone: DEFAULT_TIME_ZONE,
            redirect: window.URLSearchParams
                ? new window.URLSearchParams(this.props.location.search).get("redirect") : null,
            specialtyOptions: [],
            specialty_id: 0,
            medical_registration_number: '',
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.dateTimeService = new DateTimeService();
        this.configService = new ConfigService();
        this.timezoneService = new TimezoneService();
    }

    componentDidMount() {
        if(this.auth.getLocalUserType() !== USER_TYPE_SECRETARY) {
            window.location.href = HREF_PAGE_HOME;
            return;
        }
        this.api.getIdentificationTypes().then(res => {
            this.setState({
                identificationOptions: res.data,
                identification_type_id: res.data[0].id
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
        this.api.getGenders().then(res => {
            this.setState({
                genderOptions: res.data,
                gender_id: res.data[0].id
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });

        this.timezoneService.getRemoteParsedTimezones().then(res => {
            this.setState({
                timezoneOptions: res,
                timezone: res.filter(tz => tz.value === DEFAULT_TIME_ZONE)[0]
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });

        this.api.getSpecialties().then(res => {
            this.setState({
                specialtyOptions: res.data,
                specialty_id: res.data[0].id
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });

        this.parseTelInputs();
    }

    handleChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    handleDateChange = state => value => {
        this.setState({[state]: value});
    };

    handleReactSelectChange = state => value => {
        this.setState({[state]: value});
    };

    parseTelInputs() {
        // TODO Improve
        setTimeout(() => {
            const input = document.querySelector(".cellphoneInput");
            intlTelInput(input, {
                // any initialisation options go here
                initialCountry: 'AR',
                onlyCountries: PARSE_TEL_INPUT_ONLY_COUNTRIES,
            });
        }, 1500);
    }

    validateForm() {
        let errors = 0;
        if (!this.state.name
            || !this.state.lastname
            || !this.state.email
            || !this.state.email_repeat
            || !this.state.cellphone
            || !this.state.identification_type_id
            || !this.state.identification
            || !this.state.date_of_birth
            || !this.state.gender_id
            || !this.state.specialty_id
        ) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeAllFormFields);
        }

        if (this.state.email !== this.state.email_repeat) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.emailsDontMatch);
        }

        if (!this.state.timezone) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.checkTimeonze);
        }


        return !errors;
    }

    send() {
        if (this.validateForm()) {
            this.setLoading(true);

            const objData = JSON.parse(JSON.stringify(this.state));

            const itiFlag = document.querySelector('.iti__selected-flag');
            if (itiFlag) {
                const itiRegex = /\+\d+/gm;
                if (itiRegex.test(itiFlag.title)) {
                    const prefix = itiFlag.title.match(itiRegex)[0];
                    objData.cellphone = prefix + ' ' + objData.cellphone;
                }
            }

            objData.date_of_birth = this.dateTimeService.parseStringDateToAPIStringDate(
                this.dateTimeService.parseDateToConventionalAPIString(this.state.date_of_birth)
            );

            objData.time_zone = this.state.timezone.value;

            this.configService.getLocalClinicData().then(res => {
                objData.clinic_id = res.id;

                this.api.postMedic(objData)
                    .then((res) => {
                        this.props.showMainModal(locales_es.successModal.title, res.message);
                        this.successLoginRedirect();
                        this.setLoading(false);
                    }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                    this.setLoading(false);
                });
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        }
    }

    successLoginRedirect() {
        if (this.state.redirect) {
            window.location.href = this.state.redirect;
            return;
        }
        // window.location.href = hrefDashboard;
        this.props.history.replace(HREF_PAGE_MEDICS);
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    }

    render() {

        const inputs = [
            {
                label: locales_es.prefixName,
                placeholder: locales_es.prefixNamePlaceholder,
                id: 1,
                state: 'prefix_name',
                value: this.state.prefix_name,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-3 pl-md-0 clear',
            },{
                label: locales_es.name,
                placeholder: locales_es.name,
                id: 2,
                state: 'name',
                value: this.state.name,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.lastname,
                placeholder: locales_es.lastname,
                id: 3,
                state: 'lastname',
                value: this.state.lastname,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.email_address,
                placeholder: locales_es.email_address,
                id: 4,
                state: 'email',
                value: this.state.email,
                type: 'email',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.repeatEmail,
                placeholder: locales_es.repeatEmail,
                id: 5,
                state: 'email_repeat',
                value: this.state.email_repeat,
                type: 'email',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.phone_number,
                placeholder: locales_es.phone_number_example,
                id: 6,
                state: 'cellphone',
                value: this.state.cellphone,
                type: 'number',
                required: true,
                wrapperCustomClassName: 'form-group col-12 col-md-4 float-left pl-md-0 clear',
                customClassName: 'cellphoneInput',
            },
            {
                label: locales_es.identificationType,
                placeholder: locales_es.identificationType,
                id: 8,
                state: 'identification_type_id',
                value: this.state.identification_type_id,
                type: 'select',
                required: true,
                options: this.state.identificationOptions,
                wrapperCustomClassName: 'form-group col-4 col-md-3 float-left pl-md-0',
            },
            {
                label: locales_es.identification,
                placeholder: locales_es.number,
                id: 9,
                state: 'identification',
                value: this.state.identification,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-8 col-md-5 float-left pr-md-0',
            },
            {
                label: locales_es.date_of_birth,
                placeholder: locales_es.date_of_birth_mask,
                id: 10,
                state: 'date_of_birth',
                value: this.state.date_of_birth,
                type: 'date',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
                maxDate: new window.Date().getTime(),
            },
            {
                label: locales_es.autoperceivedGender,
                placeholder: locales_es.autoperceivedGender,
                id: 11,
                state: 'gender_id',
                value: this.state.gender_id,
                type: 'select',
                required: true,
                options: this.state.genderOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.specialty,
                placeholder: locales_es.specialty,
                id: 12,
                state: 'specialty_id',
                value: this.state.specialty_id,
                type: 'select',
                required: true,
                options: this.state.specialtyOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.medicalRegistrationNumber,
                placeholder: locales_es.medicalRegistrationNumberPlaceholder,
                id: 13,
                state: 'medical_registration_number',
                value: this.state.medical_registration_number,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.bio,
                placeholder: locales_es.bioPlaceholder,
                id: 14,
                state: 'description',
                value: this.state.description,
                type: 'textarea',
                required: false,
                wrapperCustomClassName: 'form-group pr-md-0',
            },
            {
                label: locales_es.facebook,
                placeholder: locales_es.facebook,
                id: 15,
                state: 'facebook_url',
                value: this.state.facebook_url,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.twitter,
                placeholder: locales_es.twitter,
                id: 16,
                state: 'twitter_url',
                value: this.state.twitter_url,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.instagram,
                placeholder: locales_es.instagram,
                id: 17,
                state: 'instagram_url',
                value: this.state.instagram_url,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.linkedIn,
                placeholder: locales_es.linkedIn,
                id: 18,
                state: 'linkedin_url',
                value: this.state.linkedin_url,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.website,
                placeholder: locales_es.website,
                id: 19,
                state: 'website_url',
                value: this.state.website_url,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.publicEmail,
                placeholder: locales_es.publicEmail,
                id: 20,
                state: 'public_email',
                value: this.state.public_email,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.publicPhone,
                placeholder: locales_es.publicPhone,
                id: 21,
                state: 'public_phone',
                value: this.state.public_phone,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.timezone,
                placeholder: locales_es.timezone,
                id: 22,
                state: 'timezone',
                value: this.state.timezone,
                type: 'react-select',
                required: true,
                options: this.state.timezoneOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left',
            },
        ];

        return (
            <>
                {this.state.loading ? <Loading/> : ''}
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.specialists,
                        href: HREF_PAGE_MEDICS
                    },
                    {
                        name: locales_es.addSpecialist,
                        href: HREF_PAGE_ADD_MEDIC
                    }
                ]}/>
                <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                        <Form
                            styles="kt-form"
                            inputs={inputs}
                            handleChange={this.handleChange}
                            handleDateChange={this.handleDateChange}
                            handleReactSelectChange={this.handleReactSelectChange}
                            onSubmit={() => this.send()}
                            onSubmitButtonText={locales_es.send}
                            secondaryButtonText={locales_es.cancel}
                            onClickSecondaryButton={() => {
                                this.props.history.goBack()
                            }}
                            showTerms={false}
                            wrapper={true}
                        >
                            <div className="kt-portlet__head">
                                <div className="kt-portlet__head-label">
                                    <h3 className="kt-portlet__head-title">{locales_es.register.title}</h3>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </>
        )
    }
}
