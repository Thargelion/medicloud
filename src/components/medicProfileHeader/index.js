import React, {Component} from 'react';
import APIService from "../../modules/apiService";
import locales_es from "../../locales/es";
import Helpers from "../../modules/helpers";
import Spinner from "../spinner";
import {APPOINTMENT_VIRTUAL_TYPE, USER_TYPE_PATIENT} from "../../models/constants";
import DateTimeService from "../../modules/DateTimeService";
import ConfigService from "../../modules/configService";
import ViewHelpers from "../../modules/viewHelpers";

export default class MedicProfileHeader extends Component {

  constructor(props) {
    super(props);

    this.state = {
      timetables: null,
      singleTimetables: null,
    };

    this.api = new APIService();
    this.helpers = new Helpers();
    this.viewHelpers = new ViewHelpers();
    this.dateTimeService = new DateTimeService();
    this.configService = new ConfigService();
  }

  componentDidMount() {
    this.configService.getLocalClinicData().then(clinic => {
      const objData = {
        medic_id: this.props.medic.id,
      };

      if (clinic.id) {
        objData.clinic_id = clinic.id;
      }

      this.api.getTimetables(objData).then(res => {

        let timetables = res.data
          // .sort((a, b) => (Number(String(a.start_date).substring(0,2)) < Number(String(b.start_date).substring(0,2))) ? 1 : -1)
          // .sort((a, b) => (a.day > b.day) ? 1 : -1)
          .filter(tt => (tt.enabled !== 0));

        /*timetables.map((tt, index) => {
            if (tt.start_date && tt.end_date
              && this.dateTimeService.diffTwoDates(new Date(tt.start_date), new Date(tt.end_date)).days <= 1) {
                timetables.splice(index, 1);
            }
        });*/

        this.setState({
          // timetables: res.data.sort((a, b) => (a.day > b.day) ? 1 : -1).filter(tt => (tt.enabled !== 0 && !tt.start_date && !tt.end_date)), // para ordenarlo por días de la semana https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
          timetables: timetables,
          singleTimetables: res.data.filter(tt => (tt.enabled !== 0 && tt.start_date && tt.end_date && this.dateTimeService.diffTwoDates(new Date(tt.start_date), new Date(tt.end_date)).days <= 1)),
        }, () => {
          if (this.props.onGetTimetablesCallback) {
            this.props.onGetTimetablesCallback(this.state.timetables);
          }
        })
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  renderLimitedTime(timetable) {
    const startDate = timetable.start_date;
    const endDate = timetable.end_date;
    /*
    // TODO [TESTING!] hoy se contemplan sólo dias únicos de atención. Cuando se apliquen startDate y endDate a los timetables persé (NO singleTimetables)
    // el concepto que hoy manejamos acá como "singleTimetables" DEBE morir, integrando todo de nuevo a "timetables"
    // y haciendo que la lógica funcione en el front de todas las formas posibles
    if (startDate && !endDate) {
        return ' ' + this.dateTimeService.parseDateToConventionalAPIString(new Date(startDate));
    }
    if (!startDate && endDate) {
        return ' ' + this.dateTimeService.parseDateToConventionalAPIString(new Date(endDate));
    }*/

    let str = '';

    if (startDate && endDate && this.dateTimeService.diffTwoDates(new Date(startDate), new Date(endDate)).days <= 1) {
      str += `${locales_es.singleTimetable}: ${this.dateTimeService.parseDateToConventionalAPIString(new Date(startDate))}`;
    } else {
      if (startDate && this.dateTimeService.getTimeRemaining(startDate, true).days > 0) {
        str += ` ${locales_es.start}: ${this.dateTimeService.parseDateToConventionalAPIString(new Date(startDate))}`;
      }
      if (endDate) {
        str += ` ${locales_es.end}: ${this.dateTimeService.parseDateToConventionalAPIString(new Date(endDate))}`;
      }
    }
    return str;
  }

  renderTimetables(timetables) {
    return (
      timetables.map((timetable) => {
        const limitedTime = this.renderLimitedTime(timetable);
        return (<div
          key={timetable.id}
          className="kt-profile__stats-item-chart">
          <span>{locales_es.daysOfTheWeek[Object.keys(locales_es.daysOfTheWeek)[timetable.day]]}
            &nbsp;{timetable.start} - {timetable.end} / {locales_es.price}: <u>{this.viewHelpers.getTimetablePricesText(timetable, USER_TYPE_PATIENT)}</u>
            {timetable.start_date || timetable.end_date ?  limitedTime && <><br/><i>{limitedTime}</i></> : null}
            {timetable.comment ?
              <>
                <br/><strong>{timetable.comment}</strong><br /><br />
              </>
              : null}
            {timetable.type_id === APPOINTMENT_VIRTUAL_TYPE ?
              <>
                &nbsp;
                <strong><i>({locales_es.appointmentTypeName[timetable.type_id]})</i></strong>
              </>
              : null
            }
                    </span>
        </div>)
      })
    )
  }

  render() {
    const {medic} = this.props;
    const {timetables, singleTimetables} = this.state;
    return (
      medic ?
        <div className="kt-portlet kt-profile">
          <div className="kt-profile__content">
            <div className="row">
              <div className="col-md-12 col-lg-6">
                <div className="kt-profile__main">
                  <div
                    className="kt-profile__main-pic medicloud-user-profile-avatar"
                    style={{backgroundImage: `url(${medic.full_profile_image})`}}/>
                  <div className="kt-profile__main-info">
                    <div
                      className="kt-profile__main-info-name">{medic.prefix_name} {medic.name} {medic.lastname}
                    </div>
                    <div
                      className="kt-profile__main-info-position">{medic.specialty_name}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 col-lg-3">
                <div className="kt-profile__contact">
                  <div className="kt-profile__stats mt-2">
                    <div className="kt-profile__stats-item">
                      <div
                        className="kt-profile__stats-item-label">{locales_es.externalLinks}</div>
                    </div>
                  </div>
                  {!medic.public_email
                  && !medic.public_phone
                  && !medic.instagram_url
                  && !medic.twitter_url
                  && !medic.linkedin_url
                  && !medic.website_url
                  && <p>{locales_es.noExternalLinks}</p>
                  }

                  {medic.public_email &&
                  <a href={`mailto:${medic.public_email}`}
                     className="kt-profile__contact-item">
                                            <span className="kt-profile__contact-item-icon">
                                                <i className="flaticon-email-black-circular-button kt-font-danger"/>
                                            </span>
                    <span
                      className="kt-profile__contact-item-text">{medic.public_email}</span>
                  </a>
                  }
                  {medic.public_phone &&
                  <a href={`tel:${medic.public_phone}`}
                     className="kt-profile__contact-item">
															<span className="kt-profile__contact-item-icon">
                                                                <i className="fa fa-phone-square"/>
															</span>
                    <span
                      className="kt-profile__contact-item-text">{medic.public_phone}</span>
                  </a>
                  }
                  {medic.instagram_url &&
                  <a href={medic.instagram_url}
                     className="kt-profile__contact-item">
															<span className="kt-profile__contact-item-icon">
                                                                <i className="socicon-instagram"/>
															</span>
                    <span
                      className="kt-profile__contact-item-text">Instagram</span>
                  </a>
                  }
                  {medic.twitter_url &&
                  <a href={medic.twitter_url}
                     className="kt-profile__contact-item">
															<span className="kt-profile__contact-item-icon">
                                                                <i className="socicon-twitter"/>
															</span>
                    <span
                      className="kt-profile__contact-item-text">Twitter</span>
                  </a>
                  }
                  {medic.linkedin_url &&
                  <a href={medic.linkedin_url} className="kt-profile__contact-item">
															<span className="kt-profile__contact-item-icon">
                                                                <i className="socicon-linkedin"/>
															</span>
                    <span
                      className="kt-profile__contact-item-text">LinkedIn</span>
                  </a>
                  }
                  {medic.website_url &&
                  <a href={medic.website_url}
                     className="kt-profile__contact-item">
															<span className="kt-profile__contact-item-icon">
                                                                <i className="fa fa-external-link-square-alt"/>
															</span>
                    <span className="kt-profile__contact-item-text">{locales_es.website}</span>
                  </a>
                  }
                </div>
              </div>
              <div className="col-md-12 col-lg-3 flex-column align-items-start">
                <div className="kt-profile__stats mb-3">
                  <div className="kt-profile__stats-item">
                    <div
                      className="kt-profile__stats-item-label">{locales_es.attentionSchedules}</div>
                    {timetables === null
                      ? <Spinner/>
                      : timetables && timetables.length ?
                        this.renderTimetables(timetables)
                        : <div className="kt-profile__stats-item-chart">
                          <span>{locales_es.noAttentionSchedules}</span>
                        </div>
                    }
                  </div>
                </div>
                <div className="kt-profile__stats">
                  <div className="kt-profile__stats-item">
                    {singleTimetables === null
                      ? <Spinner/>
                      : singleTimetables && singleTimetables.length ?
                        <>
                          <div
                            className="kt-profile__stats-item-label"><i
                            className="flaticon-star"/>&nbsp; {locales_es.attentionSingleSchedules}
                          </div>
                          {this.renderTimetables(singleTimetables)}
                        </>
                        : null
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        : null
    )
  }
}
