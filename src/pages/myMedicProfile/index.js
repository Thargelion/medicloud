import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {
  DEFAULT_SLUGNAME,
  DEFAULT_TIME_ZONE,
  HREF_PAGE_HOME, HREF_PAGE_MEDIC, HREF_PAGE_MEDIC_ADD_TIMETABLE,
  HREF_PAGE_MY_PROFILE,
  PARSE_TEL_INPUT_ONLY_COUNTRIES, USER_TYPE_MEDIC,
} from "../../models/constants";
import Subheader from "../../components/subheader";
import Form from "../../components/form";
import APIService from "../../modules/apiService";
import intlTelInput from "intl-tel-input";
import AuthService from "../../modules/authService";
import Helpers from "../../modules/helpers";
import DateTimeService from "../../modules/DateTimeService";
import TimezoneService from "../../modules/timezoneService";

export default class MyMedicProfilePage extends Component {

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
      specialtyOptions: [],
      specialty_id: 0,
      profileLink: '',
      register: this.props.location && this.props.location.search && window.URLSearchParams
          ? new window.URLSearchParams(this.props.location.search).get("register") : null,
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
    if (!isLoggedIn || (isLoggedIn && userData && userData.user && userData.user.user_type !== USER_TYPE_MEDIC)) {
      this.redirectNotLoggedIn();
    }
  }

  redirectNotLoggedIn() {
    window.location.href = HREF_PAGE_HOME;
  }

  checkModalMessage() {
    if (window.URLSearchParams) {
      const message = new window.URLSearchParams(this.props.location.search).get("message");

      if (message) {
        this.props.showMainModal(locales_es.infoModal.title, message);
      }
    }
  }

  componentDidMount() {
    this.checkModalMessage();
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

    this.api.getSpecialties().then(res => {
      this.setState({
        specialtyOptions: res.data,
        // specialty_id: res.data[0].id
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });

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
              prefix_name: userData.prefix_name,
              slugname: userData.slugname && userData.slugname === DEFAULT_SLUGNAME ? '' : userData.slugname,
              name: userData.name,
              lastname: userData.lastname,
              identification_type_id: userData.identification_type_id,
              identification: userData.identification,
              medical_registration_number: userData.medical_registration_number,
              timezone: timezones.filter(tz => tz.value === (userData.time_zone || DEFAULT_TIME_ZONE))[0],
              gender_id: userData.gender_id,
              specialty_id: userData.specialty_id,
              userType: userData.user_type, // not modifiable. only used for views logic
              description: userData.description,
              facebook_url: userData.facebook_url,
              twitter_url: userData.twitter_url,
              instagram_url: userData.instagram_url,
              linkedin_url: userData.linkedin_url,
              website_url: userData.website_url,
              public_email: userData.public_email,
              public_phone: userData.public_phone,
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

  showShareLink() {
    const event = document.createEvent('Event');
    event.initEvent('showShareLink', true, true);
    document.dispatchEvent(event);
    if (this.state.register === 'true') {
      this.props.history.push(HREF_PAGE_MEDIC_ADD_TIMETABLE + '/' + this.auth.getUserData().user.id + '?register=true');
    }
  }

  sanitizeProfileLink(value) {
    // return value == undefined ? '' : value.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    // eslint-disable-next-line
    return value == undefined ? '' : value.replace(/[^a-z0-9_]+/gi, '-').replace(/[`!@#$%^&*()+=\[\]{};':"\\|,.<>\/?~]/g, '').toLowerCase();
  }

  generateProfileLink() {
    return `${window.location.origin}${this.state.slugname ? ('/' + this.state.slugname) : (HREF_PAGE_MEDIC + '/' + this.auth.getUserData().user.id)}`;
  }

  parseTelInputs() {

    const itiRegex = /\+\d+/gm;
    if (itiRegex.test(this.state.cellphone)) {
      const prefix = this.state.cellphone.match(itiRegex)[0]
      let cellphone = this.state.cellphone;
      cellphone = cellphone.replace(prefix, '');

      this.setState({
        cellphone,
      }, () => {
        // TODO Improve
        setTimeout(() => {
          const input = document.querySelector(".cellphoneInput");
          intlTelInput(input, {
            // any initialisation options go here
            initialCountry: 'AR',
            autoPlaceholder: 'off',
            onlyCountries: PARSE_TEL_INPUT_ONLY_COUNTRIES
          });
        }, 1500);
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

  send() {
    /*console.log(this.state.date_of_birth);
    return;*/
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

      objData.slugname = this.sanitizeProfileLink(objData.slugname);

      this.setLoading(true);
      this.auth.updateUser(objData)
        .then((res) => {
          // this.props.showMainModal(locales_es.successModal.title, res.message);
          // this.setLoading(false);
          if (this.state.register === 'true') {
            this.showShareLink();
          } else {
            window.location.href = window.location.origin + window.location.pathname + '?message=' + res.message;
          }
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
        label: locales_es.slugname,
        placeholder: locales_es.slugnamePlaceholder,
        id: 24,
        state: 'slugname',
        value: this.state.slugname,
        type: 'text',
        required: false,
        wrapperCustomClassName: 'form-group col pl-md-0',
        info: this.generateProfileLink(),
        transform: (value) => this.sanitizeProfileLink(value)
      },
      {
        label: locales_es.prefixName,
        placeholder: locales_es.prefixNamePlaceholder,
        id: 23,
        state: 'prefix_name',
        value: this.state.prefix_name,
        type: 'text',
        required: false,
        wrapperCustomClassName: 'form-group col-md-3 pl-md-0',
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
        type: 'text',
        required: true,
        wrapperCustomClassName: 'form-group col-12 col-md-4 float-left pl-md-0',
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

        <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app">
          <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
            <div className="col-md-9 offset-md-2">
              {this.state.register === 'true' ?
                  <div className="row">
                    <div className="col">
                      <div className="alert alert-accent fade show" role="alert">
                        <div className="alert-icon"><i className="flaticon-profile-1"/></div>
                        <div className="alert-text">
                          {locales_es.registerFillUpYourMedicProfile}
                        </div>
                        {/*<div className="alert-close">
                          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true"><i className="la la-close"/></span>
                          </button>
                        </div>*/}
                      </div>
                    </div>
                  </div>
                  : null
              }
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
