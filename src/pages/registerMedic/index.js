import React, {Component} from 'react';
import Form from "../../components/form";
import locales_es from "../../locales/es";
import {
    DEFAULT_TIME_ZONE,
    HREF_PAGE_MY_MEDIC_PROFILE,
    PARSE_TEL_INPUT_ONLY_COUNTRIES,
    USER_TYPE_MEDIC
} from "../../models/constants";
import AuthService from "../../modules/authService";
import Loading from "../../components/loading";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import intlTelInput from "intl-tel-input";
import TimezoneService from "../../modules/timezoneService";

/* =================================== */
/* ACTUALMENTE SOLO REGISTRA MEDICOS */
/* =================================== */
class RegisterMedicPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            name: '',
            lastname: '',
            email: '',
            email_repeat: '',
            password: '',
            password_confirmation: '',
            loginMode: false,
            user_type: USER_TYPE_MEDIC, /* ACTUALMENTE SOLO REGISTRA MÉDICOS */
            identificationOptions: [],
            genderOptions: [],
            timezoneOptions: [
                { value: 0, label: locales_es.loading },
            ],
            timezone: DEFAULT_TIME_ZONE,
            specialtyOptions: [],
            specialty_id: 0,
            redirect: window.URLSearchParams
                ? new window.URLSearchParams(this.props.location.search).get("redirect") : null,
        };

        this.api = new APIService();
        this.auth = new AuthService();
        this.helpers = new Helpers();
        this.dateTimeService = new DateTimeService();
        this.timezoneService = new TimezoneService();
    }

    componentDidMount() {
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

        this.api.getSpecialties().then(res => {
            this.setState({
                specialtyOptions: res.data,
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

        this.parseTelInputs();
    }

    componentWillMount() {
        this.checkUserStatus();
        console.log(this.state.redirect);
    }

    async checkUserStatus() {
        const isLoggedIn = await this.auth.isLoggedUser();
        if (isLoggedIn) {
            this.successLoginRedirect();
        }
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
            || !this.state.password
            || !this.state.password_confirmation
            || !this.state.cellphone
            || !this.state.identification_type_id
            || !this.state.identification
            || !this.state.date_of_birth
            || !this.state.gender_id
        ) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeAllFormFields);
        }

        if (this.state.email !== this.state.email_repeat) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.emailsDontMatch);
        }

        if (this.state.password !== this.state.password_confirmation) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.passwordsDontMatch);
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

            this.auth.register(objData)
                .then(() => {
                    this.successLoginRedirect();
                    this.setLoading(false);
                }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                this.setLoading(false);
            });
        }
    }

    successLoginRedirect() {
        /*if (this.state.redirect) {
            window.location.href = this.state.redirect;
            return;
        }*/
        // window.location.href = hrefDashboard;
        window.location.href = HREF_PAGE_MY_MEDIC_PROFILE + '?register=true';
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        });
    }

    render() {

        const inputs = [
            {
                label: locales_es.name,
                placeholder: locales_es.name,
                autoComplete: 'given-name',
                id: 1,
                state: 'name',
                value: this.state.name,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.lastname,
                placeholder: locales_es.lastname,
                autoComplete: 'family-name',
                id: 2,
                state: 'lastname',
                value: this.state.lastname,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.email_address,
                placeholder: locales_es.email_address,
                autoComplete: 'email',
                id: 3,
                state: 'email',
                value: this.state.email,
                type: 'email',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.repeatEmail,
                placeholder: locales_es.repeatEmail,
                autoComplete: 'email',
                id: 4,
                state: 'email_repeat',
                value: this.state.email_repeat,
                type: 'email',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.password,
                placeholder: locales_es.password,
                autoComplete: 'off',
                id: 5,
                state: 'password',
                value: this.state.password,
                type: 'password',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
                advice: locales_es.passwordValidation
            },
            {
                label: locales_es.repeatPassword,
                placeholder: locales_es.repeatPassword,
                autoComplete: 'off',
                id: 6,
                state: 'password_confirmation',
                value: this.state.password_confirmation,
                type: 'password',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.phone_number,
                placeholder: locales_es.phone_number_example,
                autocomplete: 'tel-national',
                id: 7,
                state: 'cellphone',
                value: this.state.cellphone,
                type: 'tel',
                required: true,
                wrapperCustomClassName: 'form-group col-12 col-md-4 float-left pl-md-0 clear',
                customClassName: 'cellphoneInput',
                children: <><p className="pt-1">Ej. Argentina: <strong>9</strong> 11 12345678</p></>
            },
            {
                label: locales_es.identificationType,
                placeholder: locales_es.identificationType,
                autoComplete: 'off',
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
                autoComplete: 'off',
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
                autoComplete: 'off',
                id: 10,
                state: 'date_of_birth',
                value: this.state.date_of_birth,
                type: 'date',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0 clear',
                maxDate: new window.Date().getTime(),
            },
            {
                label: locales_es.autoperceivedGender,
                placeholder: locales_es.autoperceivedGender,
                autoComplete: 'off',
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
                children: <><p className="p-2">Si no encuentras tu especialidad, <a href="mailto:info@woopi.com.ar">contáctanos</a> y la agregamos</p></>
            },
            {
                label: locales_es.timezone,
                placeholder: locales_es.timezone,
                autoComplete: 'off',
                id: 13,
                state: 'timezone',
                value: this.state.timezone,
                type: 'react-select',
                required: true,
                options: this.state.timezoneOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
        ];

        return (
            <div className="row">

                {this.state.loading ? <Loading/> : ''}

                <div className="col-md-9 offset-md-2">
                    <div className="kt-portlet">
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
                                    <h3 className="kt-portlet__head-title">{locales_es.register.titleMedic}</h3>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>


            </div>
        )
    }
}

export default RegisterMedicPage;
