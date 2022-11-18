import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {
    DEFAULT_TIME_ZONE,
    HREF_PAGE_HOME,
    HREF_PAGE_MY_PROFILE,
    PARSE_TEL_INPUT_ONLY_COUNTRIES,
    PARSE_TEL_INPUT_COUNTRIES_CODES,
    USER_TYPE_PATIENT
} from "../../models/constants";
import Subheader from "../../components/subheader";
import Form from "../../components/form";
import APIService from "../../modules/apiService";
import intlTelInput from "intl-tel-input";
import AuthService from "../../modules/authService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import TimezoneService from "../../modules/timezoneService";
import TelephoneValidation from "../../components/telephoneValidation";

export default class MyProfilePage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            identificationOptions: [],
            genderOptions: [],
            timezoneOptions: [
                {value: 0, label: locales_es.loading},
            ],
            timezone: DEFAULT_TIME_ZONE,
            redirect: window.URLSearchParams
                ? new window.URLSearchParams(this.props.location.search).get("redirect") : null,
        };

        this.auth = new AuthService();
        this.api = new APIService();
        this.helpers = new Helpers();
        this.dateTimeService = new DateTimeService();
        this.timezoneService = new TimezoneService();
    }

    componentWillMount() {
        this.checkUserStatus();
    }

    async checkUserStatus() {
        const isLoggedIn = await this.auth.isLoggedUser();
        const userData = this.auth.getUserData();
        // alert(JSON.stringify(userData));
        if (!isLoggedIn || (isLoggedIn && userData && userData.user && userData.user.user_type !== USER_TYPE_PATIENT)) {
            this.redirectNotLoggedIn();
        }
    }

    redirectNotLoggedIn() {
        window.location.href = HREF_PAGE_HOME;
    }

    componentDidMount() {
        this.api.getIdentificationTypes().then(res => {
            this.setState({
                identificationOptions: res.data
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
        this.api.getGenders().then(res => {
            this.setState({
                genderOptions: res.data
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });

        this.loadUser();
    }

    loadUser() {
        this.timezoneService.getRemoteParsedTimezones().then(timezones => {
            this.setState({
                timezoneOptions: timezones,
                // timezone: timezones.filter(tz => tz.value === DEFAULT_TIME_ZONE)[0]
            }, () => {
                this.api.getUserMe().then(res => {
                    if (res && res.data && res.data.user) {
                        const userData = res.data.user;
                        this.setState({
                            cellphone: userData.cellphone,
                            date_of_birth: this.dateTimeService.parseAPIStringToDate(userData.date_of_birth),
                            email: userData.email,
                            full_profile_image: userData.full_profile_image,
                            name: userData.name,
                            lastname: userData.lastname,
                            identification_type_id: userData.identification_type_id,
                            identification: userData.identification,
                            timezone: timezones.filter(tz => tz.value === (userData.time_zone || DEFAULT_TIME_ZONE))[0],
                            gender_id: userData.gender_id,
                            userType: userData.user_type, // not modifiable. only used for views logic
                        }, () => this.parseTelInputs())
                    }
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                })
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
    }

    parseTelInputs() {

        const itiRegex = /\+\d+/gm;
        if (itiRegex.test(this.state.cellphone)) {
            const prefix = this.state.cellphone.match(itiRegex)[0];
            let cellphone = this.state.cellphone;
            cellphone = cellphone.replace(prefix, '');
            cellphone = cellphone.replace(' ', '');

            const countryCode = PARSE_TEL_INPUT_COUNTRIES_CODES.filter(code => code.dialCode === prefix)[0].countryCode;

            this.setState({
                cellphone,
            }, () => {
                // TODO Improve
                setTimeout(() => {
                    const input = document.querySelector(".cellphoneInput");
                    intlTelInput(input, {
                        // any initialisation options go here
                        initialCountry: countryCode || 'AR',
                        autoPlaceholder: 'off',
                        onlyCountries: PARSE_TEL_INPUT_ONLY_COUNTRIES
                    });
                }, 700);
                // TODO Recontra Improve
                /*
                setTimeout(() => {
                    // TODO no funciona todavía
                    // Busca el pais del prefijo y le setea la bandera correspondiente
                    const countryList = document.querySelector(".iti__country-list");
                    // countryList.children[0].children[2]
                    for (let i = 0; i < countryList.children.length; i++) {
                        const indexEl = countryList.children[i];
                        const indexPrefix = indexEl.children[2].innerHTML;
                        console.log(indexPrefix === prefix ? 'countryCode: ' + indexPrefix : '' )
                        if (indexPrefix === prefix) {
                            console.log(indexEl);
                            indexEl.click();
                        }
                    }
                }, 3000);
                */
            });
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

    setLoading(bool) {
        this.setState({
            loading: bool
        });
    }

    getSelectedIdentificationTypeName() {
        const filtered = this.state.identificationOptions.filter(id => id.id === this.state.identification_type_id);
        return filtered && filtered.length ? `${locales_es.numberOf} ${filtered[0].name}` : locales_es.selectIdentificationType
    }

    validateForm() {
        console.log(this.state);
        let errors = 0;

        if (!this.state.name
            || !this.state.lastname
            || !this.state.cellphone
            || !this.state.identification_type_id
            || !this.state.identification
            || !this.state.date_of_birth
            || !this.state.gender_id
        ) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeAllFormFields);
        }

        if (!this.state.timezone) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.checkTimeonze);
        }

        return !errors;
    }

    getCountryCode() {
        const itiFlag = document.querySelector('.iti__selected-flag');
        if (itiFlag) {
            const itiRegex = /\+\d+/gm;
            if (itiRegex.test(itiFlag.title)) {
                return itiFlag.title.match(itiRegex)[0];
            }
        }
        return '';
    }

    send() {
        /*console.log(this.state.date_of_birth);
        return;*/
        if (this.validateForm()) {
            this.setLoading(true);

            const objData = JSON.parse(JSON.stringify(this.state));

            if (this.getCountryCode()) {
                objData.cellphone = this.getCountryCode() + ' ' + objData.cellphone;
            }

            objData.date_of_birth = this.dateTimeService.parseStringDateToAPIStringDate(
                this.dateTimeService.parseDateToConventionalAPIString(this.state.date_of_birth)
            );

            // delete objData.email;

            objData.time_zone = this.state.timezone.value;

            this.auth.updateUser(objData)
                .then((res) => {
                    this.props.showMainModal(locales_es.successModal.title, res.message);
                    this.setLoading(false);

                    this.setState({
                        cellphone: null
                    }, () => {
                        this.loadUser();
                    })
                }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                this.setLoading(false);
            });
        }
    }

    render() {

        const inputs = [
            {
                label: locales_es.email_address,
                placeholder: locales_es.email_address,
                id: 3,
                state: 'email',
                value: this.state.email,
                type: 'email',
                required: true,
                wrapperCustomClassName: 'form-group',
                disabled: true,
            },
            {
                label: locales_es.name,
                placeholder: locales_es.name,
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
                id: 2,
                state: 'lastname',
                value: this.state.lastname,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.phone_number,
                placeholder: locales_es.phone_number_example,
                id: 7,
                state: 'cellphone',
                value: this.state.cellphone,
                type: 'tel',
                required: true,
                wrapperCustomClassName: 'form-group col-12 col-md-4 float-left pl-md-0',
                customClassName: 'cellphoneInput',
                children: <><TelephoneValidation
                    getCountryCodeMethod={this.getCountryCode}
                    cellphone={this.state.cellphone}
                    showMainModal={this.props.showMainModal}
                    redirect={this.state.redirect}
                    history={this.props.history}
                /><p className="pt-1">Ej. Argentina: <strong>9</strong> 11 12345678</p></>
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
                placeholder: this.getSelectedIdentificationTypeName(),
                id: 9,
                state: 'identification',
                value: this.state.identification,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-8 col-md-5 float-left pr-md-0',
            },
            {
                label: locales_es.date_of_birth,
                placeholder: locales_es.date_of_birth,
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
                id: 11,
                state: 'gender_id',
                value: this.state.gender_id,
                type: 'select',
                required: true,
                options: this.state.genderOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
            },
            {
                label: locales_es.timezone,
                placeholder: locales_es.timezone,
                id: 12,
                state: 'timezone',
                value: this.state.timezone,
                type: 'react-select',
                required: true,
                options: this.state.timezoneOptions,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
        ];

        return (
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.myProfile,
                        href: HREF_PAGE_MY_PROFILE
                    },
                    {
                        name: locales_es.editProfile,
                        href: HREF_PAGE_MY_PROFILE
                    }
                ]}/>

                <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app mt-3 mt-md-0">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                        <div className="col-md-9 offset-md-2">
                            <div className="kt-portlet">
                                <Form
                                    styles="kt-form"
                                    inputs={inputs}
                                    handleChange={this.handleChange}
                                    handleDateChange={this.handleDateChange}
                                    handleReactSelectChange={this.handleReactSelectChange}
                                    onSubmit={() => this.send()}
                                    onSubmitButtonText={locales_es.save}
                                    wrapper={true}
                                >
                                    <div className="kt-portlet__head">
                                        <div className="kt-portlet__head-label">
                                            <h3 className="kt-portlet__head-title">{locales_es.myProfile}</h3>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
