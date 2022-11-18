import React, {Component} from 'react';
import locales_es from "../../locales/es";
import Form from "../form";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import {
  DAYS_OF_THE_WEEK,
  DEFAULT_TIME_ZONE, FC_SLOT_MAX_TIME, FC_SLOT_MIN_TIME, HREF_PAGE_MEDIC_EDIT_TIMETABLES,
  hrefDashboard, USER_TYPE_MEDIC, USER_TYPE_PATIENT,
} from "../../models/constants";

import Loading from './../../components/loading';
import TimezoneService from "../../modules/timezoneService";
import ConfigService from "../../modules/configService";
import AuthService from "../../modules/authService";
import DateTimeService from "../../modules/DateTimeService";
import PricesTable from "../pricesTable";
import PriceModal from "../priceModal";

export default class EditMedicTimetable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      clinic_id: null,
      consultingRoomOptions: [],
      prices: [],
      duration: 0,
      footer_email_text: '',
      startDate: '',
      endDate: '',
      value: {
        start: FC_SLOT_MIN_TIME,
        end: FC_SLOT_MAX_TIME
      },
      timezoneOptions: [
        {value: 0, label: locales_es.loading},
      ],
      timezone: DEFAULT_TIME_ZONE,
      appointmentTypes: [],
      appointmentTypeId: null,
      editionDisabled: false,
    };

    this.onSavePriceModal = this.onSavePriceModal.bind(this);
    this.onRemovePrice = this.onRemovePrice.bind(this);
    this.onEditPrice = this.onEditPrice.bind(this);

    this.api = new APIService();
    this.helpers = new Helpers();
    this.auth = new AuthService();
    this.dateTimeService = new DateTimeService();
    this.timezoneService = new TimezoneService();
    this.configService = new ConfigService();
  }

  componentDidMount() {
    if (!this.props.timetableId) {
      alert(locales_es.errorModal.unexpectedError);
      return;
    }

    if (this.props.userType === USER_TYPE_PATIENT) {
      window.location.href = hrefDashboard;
    }

    this.configService.getLocalClinicData().then(clinic => {
      this.api.getConsultingRooms({clinic_id: clinic.id}).then(res => {
        if (res && res.data) {
          this.setState({
            consultingRoomOptions: res.data
          }, () => {
            this.getTimetables();
          });
        }
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      });
    }).catch(err => {
      console.log(err);
    });

    this.timezoneService.getRemoteParsedTimezones().then(res => {
      this.setState({
        timezoneOptions: res,
        // timezone: res.filter(tz => tz.value === DEFAULT_TIME_ZONE)[0]
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });

    this.api.getAppointmentsTypes().then(res => {
      this.setState({
        appointmentTypes: res.data,
        // appointmentTypeId: res.data[0].id
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  getTimetables() {
    this.setLoading(true);
    this.api.getTimetables({medic_id: this.props.medic.id}).then(res => {
      this.setState({
        timetables: JSON.parse(JSON.stringify(res.data))
      }, () => this.loadTimetable());
      this.setLoading(false);
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      this.setLoading(false);
    })
  }

  loadTimetable() {
    const selectedTimetable = this.state.timetables.filter(tt => Number(tt.id) === Number(this.props.timetableId))[0];

    this.setState({
      prices: selectedTimetable.prices,
      consulting_room_id: selectedTimetable.consulting_room_id,
      day: selectedTimetable.day,
      duration: selectedTimetable.duration,
      comment: selectedTimetable.comment,
      enabled: selectedTimetable.enabled,
      footer_email_text: selectedTimetable.footer_email_text,
      appointmentTypeId: selectedTimetable.type_id,
      startDate: new window.Date(selectedTimetable.start_date).getTime(),
      endDate: new window.Date(selectedTimetable.end_date).getTime(),
      timezone: this.state.timezoneOptions.filter(tz => tz.value === (selectedTimetable.time_zone || DEFAULT_TIME_ZONE))[0],
    }, () => this.checkEditionDisable(selectedTimetable))
  }

  checkEditionDisable(timetable) {
    if (this.props.userType === USER_TYPE_MEDIC) {
      this.api.getMyClinics().then(res => {
        const selectedClinic = res.data.filter(clinic => Number(clinic.id) === Number(timetable.clinic_id));
        this.setState({
          editionDisabled: !selectedClinic.length
        })
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        this.setState({
          editionDisabled: true, // for safe reasons...
        });
      })
    }
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

  onSavePriceModal(price) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    if (price.index !== null) {
      prices[price.index] = price
      this.setState({
        prices,
        price: null,
      });
    } else {
      this.api.postTimetablePrice({timetable_id: this.props.timetableId, ...price}).then(res =>{
        this.props.showMainModal(locales_es.successModal.title, res.message);
        prices.push(price);
        this.setState({
          prices,
          price: null,
        });
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
    }
  }

  onRemovePrice(price, index) {
    this.props.showMainModal(locales_es.confirmActionModal.title, locales_es.confirmActionModal.subtitle, null,
      [
        {
          label: locales_es.confirmActionModal.accept,
          class: 'btn btn-danger',
          method: () => this.confirmOnRemovePrice(price, index)
        },
        {
          label: locales_es.confirmActionModal.cancel,
          class: 'btn btn-brand',
        }
      ])
  }

  confirmOnRemovePrice(price, index) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    this.setLoading(true);
    this.api.deleteTimetablePrice(price.id).then(res => {
      this.props.showMainModal(locales_es.infoModal.title, res.message);
      prices.splice(index, 1);
      this.setState({
        prices,
      }, () => this.setLoading(false))
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  onEditPrice(price, index) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    prices[index].index = index;
    this.setState({
      price: prices[index],
    })
  }

  send() {
    const objData = {
      "id": this.props.timetableId,
      "medic_id": this.props.medic.id,
      "type_id": this.state.appointmentTypeId,
      "comment": this.state.comment,
      "footer_email_text": this.state.footer_email_text,
      "enabled": Number(this.state.enabled),
      "start_date": this.state.startDate ? this.dateTimeService.parseStringDateToAPIStringDate(
        this.dateTimeService.parseDateToConventionalAPIString(new window.Date(this.state.startDate))
      ) : null,
      "end_date": this.state.endDate ? this.dateTimeService.parseStringDateToAPIStringDate(
        this.dateTimeService.parseDateToConventionalAPIString(new window.Date(this.state.endDate))
      ) : null,
    };
    this.setLoading(true);
    this.api.putTimetable(objData).then(res => {
      const cb = () => {
        this.props.showMainModal(locales_es.successModal.title, res.message);
        window.location.href = `${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${this.props.medic.id}`;
      }
      this.editPrices(cb);
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      // this.getTimetables();
    })
  }

  editPrices(callback) {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    if (prices.length) {
      const promises = [];
      prices.map(price => {
        if (price.index) {
          promises.push(this.api.putTimetablePrice(price.id, price))
        }
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

  goBack() {
    window.history.back();
  }

  toggleEnable() {
    this.setState({
      enabled: !this.state.enabled
    })
  }

  render() {

    const {prices, price} = this.state;

    const inputsTwo = [
      {
        label: locales_es.day,
        placeholder: locales_es.day,
        disabled: true,
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
        disabled: true,
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
        disabled: false,
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
        required: false,
        disabled: true,
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
        required: false,
        disabled: this.state.editionDisabled,
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
        minDate: new window.Date().getTime(),
        info: locales_es.endDateInfo,
      },
    ];

    return (
      <>
        {this.state.loading ? <Loading/> : null}
        <div className="kt-portlet__body">
          <div className="row">
            <div className="woopi-timetable-prices col-md-6 mb-5">
              {prices && prices.length ?
                <PricesTable prices={prices} onRemove={this.onRemovePrice} onEdit={this.onEditPrice}/>
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
                  <i className="flaticon2-plus"/> {locales_es.addPrice}
                </a>
              </p>
            </div>
          </div>
        </div>
        <hr/>
        <Form
          styles="kt-form"
          inputs={inputsTwo}
          handleChange={this.handleChange}
          handleDateChange={this.handleDateChange}
          handleReactSelectChange={this.handleReactSelectChange}
          wrapper={true}
        />

        <div className="row mt-5">
          <div className="col">
            <label className="kt-checkbox">
              <input disabled={this.state.editionDisabled} type="checkbox" onChange={() => this.toggleEnable()}
                     checked={this.state.enabled}/> {locales_es.enabledTimetable}
              <span/>
            </label>
          </div>
        </div>

        <div className="row m-4">
          <div className="col text-center">
            <button type="button"
                    onClick={() => this.send()}
                    className="btn btn-warning btn-elevate btn-pill m-3">{locales_es.saveChanges}</button>
            <button type="button"
                    onClick={() => this.goBack()}
                    className="btn btn-outline-brand btn-elevate btn-pill m-3">{locales_es.cancel}</button>
          </div>
        </div>

        {price &&
          <PriceModal
            price={price}
            onSave={this.onSavePriceModal}
            onCancel={() => {
              this.setState({price: null})
            }}
          />
        }
      </>
    )
  }
}
