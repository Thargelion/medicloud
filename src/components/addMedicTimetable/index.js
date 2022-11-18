import React, {Component} from 'react';
import locales_es from "../../locales/es";
import Form from "../form";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import {
  DAYS_OF_THE_WEEK,
  DEFAULT_TIME_ZONE,
  FC_SLOT_MAX_TIME,
  FC_SLOT_MIN_TIME, HREF_PAGE_ADD_CLINIC, HREF_PAGE_MEDIC_EDIT_TIMETABLES,
  hrefDashboard,
  USER_TYPE_MEDIC,
  USER_TYPE_SECRETARY
} from "../../models/constants";
import TimeRangeSlider from 'react-time-range-slider';

import Loading from './../../components/loading';
import Modal from "../modal";
import TimezoneService from "../../modules/timezoneService";
import ConfigService from "../../modules/configService";
import Spinner from "../spinner";
import AuthService from "../../modules/authService";
import DateTimeService from "../../modules/DateTimeService";
import PriceModal from "../priceModal";
import PricesTable from "../pricesTable";
// import TimetablePrices from "../timetablePrices";

export default class AddMedicTimetable extends Component {
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
      prices: [],
      /*prices: [
        {"id":null,"price":"100","title":"titulo","description":"descripcion"},
        {"id":null,"price":"200","title":"titulo","description":"descripcion"},
        {"id":null,"price":"300","title":"titulo","description":"descripcion"},
      ],*/
      price: null,
    };

    this.changeStartHandler = this.changeStartHandler.bind(this);
    this.timeChangeHandler = this.timeChangeHandler.bind(this);
    this.onSavePriceModal = this.onSavePriceModal.bind(this);
    this.onRemovePrice = this.onRemovePrice.bind(this);
    this.onEditPrice = this.onEditPrice.bind(this);

    this.api = new APIService();
    this.helpers = new Helpers();
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
            });
          } else {
            this.setSecretaryDefaults();
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

  setLoading(bool) {
    this.setState({
      loading: bool
    });
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

  changeStartHandler(time) {
    console.log("Start Handler Called", time);
  }

  timeChangeHandler(time) {
    this.setState({
      value: time
    });
  }

  goBack() {
    window.history.back();
  }

  send() {
    console.log(this.state.prices);
    if (!this.state.timezone) {
      this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.checkTimeonze);
      return;
    }

    const objData = {
      "medic_id": this.props.medic.id,
      "day": this.state.day,
      "start": this.state.value.start,
      "end": this.state.value.end,
      "start_date": this.dateTimeService.parseStringDateToAPIStringDate(
        this.dateTimeService.parseDateToConventionalAPIString(this.state.startDate)
      ),
      "end_date": this.dateTimeService.parseStringDateToAPIStringDate(
        this.dateTimeService.parseDateToConventionalAPIString(this.state.endDate)
      ),
      "clinic_id": this.state.clinicId,
      "consulting_room_id": this.state.consulting_room_id,
      "duration": this.state.duration,
      "comment": this.state.comment,
      // "prices": this.state.prices,
      "enabled": Number(this.state.enabled),
      "type_id": this.state.appointmentTypeId,
      "time_zone": this.state.timezone.value,
      "footer_email_text": this.state.footer_email_text,
    };
    this.setLoading(true);
    this.api.postTimetables(objData).then(res => {
      this.setLoading(false);
      const cb = () => {
        this.props.showMainModal(locales_es.successModal.title, res.message);
        this.goToTimetablesList();
      }
      this.addPrices(res.data.id, cb);
    }).catch(err => {
      this.setLoading(false);
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  addPrices(timetableId, callback) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    if (prices.length) {
      const promises = [];
      prices.map(price => {
          promises.push(this.api.postTimetablePrice({timetable_id: timetableId, ...price}))
      });

      if (promises.length) {
        Promise.all(promises).then((values) => {
          console.log('Values:');
          console.log(values);
          callback ? callback() : this.props.showMainModal(locales_es.successModal.title, locales_es.successModal.message);
        }).catch((err) => {
          console.log(err);
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
      } else {
        callback && callback();
      }
    } else {
      callback && callback();
    }
  }

  toggleEnable() {
    this.setState({
      enabled: !this.state.enabled
    })
  }

  goToTimetablesList() {
    window.location.href = `${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${this.props.medic.id}/`;
  }

  goToEditClinic() {
    window.location.href = `${HREF_PAGE_ADD_CLINIC}/${this.props.medic.id}/${this.state.clinicId}`;
  }

  onSavePriceModal(price) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    if (price.index !== null) {
      prices[price.index] = price
    } else {
      prices.push(price);
    }
    this.setState({
      prices,
      price: null,
    });
  }

  onRemovePrice(price, index) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    prices.splice(index, 1);
    this.setState({
      prices,
    })
  }

  onEditPrice(price, index) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    prices[index].index = index;
    this.setState({
      price: prices[index],
    })
  }

  render() {
    const inputs = [];

    if (this.props.userType === USER_TYPE_SECRETARY) {
      inputs.push({
        label: locales_es.consultingRoom,
        placeholder: locales_es.consultingRoom,
        id: 2,
        state: 'consulting_room_id',
        value: this.state.consulting_room_id,
        type: 'select',
        required: true,
        options: this.state.consultingRoomOptions,
        wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
      })
    }

    if (this.props.userType === USER_TYPE_MEDIC) {
      inputs.push({
        label: locales_es.consultingPlace,
        placeholder: locales_es.consultingPlace,
        id: 2,
        state: 'clinicId',
        value: this.state.clinicId,
        type: 'select',
        required: true,
        options: this.state.clinics,
        wrapperCustomClassName: 'form-group',
        primaryAction:
          <a href="#" className="kt-link kt-link--brand" onClick={(e) => {
            e.preventDefault();
            this.goToEditClinic()
          }}>
            {locales_es.editThisAttentionPlace}
          </a>,
        secondaryAction:
          <a href={`${HREF_PAGE_ADD_CLINIC}/${this.props.medic.id}`}
             className="btn btn-brand btn-sm btn-bold btn-upper">+ {locales_es.addClinic}</a>,
      })
    }

    const minEndDate = new window.Date();
    minEndDate.setDate(minEndDate.getDate() + 1);

    const inputsTwo = [
      {
        label: locales_es.day,
        placeholder: locales_es.day,
        id: 3,
        state: 'day',
        value: this.state.day,
        type: 'select',
        required: true,
        options: DAYS_OF_THE_WEEK,
        wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
      },
      {
        label: `${locales_es.appointmentDuration} (${locales_es.inMinutes})`,
        placeholder: `(${locales_es.inMinutes})`,
        id: 4,
        state: 'duration',
        value: this.state.duration,
        type: 'number',
        step: 1,
        min: 1,
        max: 60,
        required: true,
        wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
      },
      {
        label: locales_es.observations,
        placeholder: locales_es.observationsPlaceholder,
        id: 5,
        state: 'comment',
        value: this.state.comment,
        type: 'text',
        required: false,
        wrapperCustomClassName: 'form-group clear',
      },
      {
        label: locales_es.footerEmailText,
        placeholder: locales_es.footerEmailTextPlaceholder,
        id: 6,
        state: 'footer_email_text',
        value: this.state.footer_email_text,
        type: 'textarea',
        required: false,
        wrapperCustomClassName: 'form-group clear',
      },
      {
        label: locales_es.appointmentType,
        placeholder: locales_es.appointmentType,
        id: 7,
        state: 'appointmentTypeId',
        value: this.state.appointmentTypeId,
        type: 'select',
        required: true,
        options: this.state.appointmentTypes,
        wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
      },
      {
        label: locales_es.timezone,
        placeholder: locales_es.timezone,
        id: 8,
        state: 'timezone',
        value: this.state.timezone,
        type: 'react-select',
        required: true,
        options: this.state.timezoneOptions,
        wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
      },
      {
        label: locales_es.startDate,
        placeholder: locales_es["DD/MM/YYYY"],
        autoComplete: 'off',
        id: 9,
        state: 'startDate',
        value: this.state.startDate,
        type: 'date',
        required: false,
        wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0 clear',
        minDate: new window.Date().getTime(),
        info: locales_es.startDateInfo,
      },
      {
        label: locales_es.endDate,
        placeholder: locales_es["DD/MM/YYYY"],
        autoComplete: 'off',
        id: 10,
        state: 'endDate',
        value: this.state.endDate,
        type: 'date',
        required: false,
        wrapperCustomClassName: 'form-group col-md-6 float-left pr-md-0',
        minDate: minEndDate.getTime(),
        info: locales_es.endDateInfo,
      },
    ];

    const {clinics, prices, price} = this.state;

    return (
      <>
        {this.state.loading ? <Loading/> : null}
        {this.props.userType === USER_TYPE_MEDIC && clinics === null ? <Spinner/> :
          clinics && clinics.length || this.props.userType === USER_TYPE_SECRETARY ?
            <>
              <div className="kt-portlet__body">
                <div className="row">
                  <div className="woopi-timetable-prices col-md-6 mb-5">
                    {prices && prices.length ?
                      <PricesTable prices={prices} onRemove={this.onRemovePrice} onEdit={this.onEditPrice} />
                      :
                      <div>
                        <h6 className="m-0 p-0">{locales_es.prices}</h6><br/>
                        <p>{locales_es.pricesEmptyText}</p>
                      </div>
                    }
                    <p className="text-center text-md-left">
                      <a href="#" className="kt-link kt-link--brand" onClick={(e) => {
                        e.preventDefault();
                        this.setState({
                          price: true
                        })
                      }}>
                        <i className="flaticon2-plus" /> {locales_es.addPrice}
                      </a>
                    </p>
                  </div>
                  <Form
                    inputs={inputs}
                    handleChange={this.handleChange}
                    wrapper={false}
                    wrapperClassName="col-md-6"
                  />
                </div>
              </div>
              <hr />
              <Form
                styles="kt-form"
                inputs={inputsTwo}
                handleChange={this.handleChange}
                handleDateChange={this.handleDateChange}
                handleReactSelectChange={this.handleReactSelectChange}
                wrapper={true}
              />

              <div className="row pl-4 pr-4">
                <div className="col">
                  <h3>{locales_es.lapseTime}</h3>
                </div>
              </div>
              <div className="row pl-4 pr-4">
                <div className="col">
                  {locales_es.from}: {this.state.value.start}
                </div>
                <div className="col text-right">
                  {locales_es.to}: {this.state.value.end}
                </div>
              </div>

              <div className="row pl-4 pr-4">
                <div className="col">
                  <TimeRangeSlider
                    disabled={false}
                    format={24}
                    maxValue={FC_SLOT_MAX_TIME}
                    minValue={FC_SLOT_MIN_TIME}
                    name={"time_range"}
                    //onChangeStart={this.changeStartHandler}
                    onChange={this.timeChangeHandler}
                    step={15}
                    value={this.state.value}/>
                </div>
              </div>

              <div className="row mt-5 pr-4">
                <div className="col text-center">
                  <label className="kt-checkbox">
                    <input type="checkbox" onChange={() => this.toggleEnable()}
                           checked={this.state.enabled}/> {locales_es.enabledTimetable}
                    <span/>
                  </label>
                </div>
              </div>

              <div className="row m-4">
                <div className="col text-center">
                  <button type="button"
                          onClick={() => this.send()}
                          className="btn btn-brand btn-elevate btn-pill mr-3">{locales_es.save}</button>
                  <button type="button"
                          onClick={() => this.goBack()}
                          className="btn btn-outline-brand btn-elevate btn-pill m-3">{locales_es.cancel}</button>
                </div>
              </div>
            </>
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

        {price &&
          <PriceModal
            price={price}
            onSave={this.onSavePriceModal}
            onCancel={() => {this.setState({price: null})}}
          />
        }

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
