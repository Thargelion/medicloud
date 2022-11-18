import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {
    HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES,
    HREF_PAGE_MEDIC_EDIT_TIMETABLES, HREF_PAGE_ONLINE,
    USER_TYPE_MEDIC,
    USER_TYPE_PATIENT,
    USER_TYPE_SECRETARY
} from "../../models/constants";
import AuthService from "../../modules/authService";

export default class MedicsList extends Component {

    constructor(props) {
        super(props);
        this.auth = new AuthService();
    }


    renderMedics() {
        return (
            this.props.medics.map(medic => {
                const medicProfileURL = `/medic/${medic.id}`;
                return (
                    <div key={`medic-list-${medic.id}`} className="col-xl-4 col-lg-6">
                        <div className="kt-portlet">
                            <div className="kt-portlet__body">
                                <div className="kt-widget kt-widget--general-4">
                                    <div className="kt-widget__head">
                                        <div className="kt-media kt-media--lg">
                                            <img src={medic.full_profile_image} alt="image" style={
                                                {
                                                    maxWidth: 'initial',
                                                    width: 'auto',
                                                }
                                            }/>
                                        </div>
                                    </div>
                                    <a href={medicProfileURL} className="kt-widget__title" style={{marginBottom: 0}}>
                                        {medic.prefix_name} {medic.lastname} {medic.name}
                                    </a><br/>
                                    <span className="kt-widget__desc">{medic.specialty_name}</span>
                                    <br/>
                                    <br/>
                                    {medic.description &&
                                    <div className="kt-widget__desc">
                                            <span className="medicloud-substring">
                                                {String(medic.description).substring(0, 255)}
                                            </span>&nbsp;
                                        <a href={medicProfileURL}>{locales_es.readMore}</a>
                                    </div>
                                    }
                                    <div className="kt-widget__links d-none">
                                        {medic.public_email &&
                                        <div className="kt-widget__link">
                                            <i className="flaticon2-send kt-font-success"/><a
                                            href={`mailto:${medic.public_email}`}>{medic.public_email}</a>
                                        </div>
                                        }
                                        {medic.public_phone &&
                                        <div className="kt-widget__link">
                                            <i className="fa fa-phone-square"/><a
                                            href={`tel:${medic.public_phone}`}>{medic.public_phone}</a>
                                        </div>
                                        }
                                        {medic.instagram_url &&
                                        <div className="kt-widget__link">
                                            <a href={medic.instagram_url} target="_blank" rel="noreferrer">
                                                <i className="socicon-instagram kt-font-skype"/> Instagram
                                            </a>
                                        </div>
                                        }
                                        {medic.twitter_url &&
                                        <div className="kt-widget__link">
                                            <a href={medic.twitter_url} target="_blank" rel="noreferrer">
                                                <i className="socicon-twitter kt-font-skype"/> Twitter
                                            </a>
                                        </div>
                                        }
                                        {medic.linkedin_url &&
                                        <div className="kt-widget__link">
                                            <a href={medic.linkedin_url} target="_blank" rel="noreferrer">
                                                <i className="socicon-linkedin kt-font-skype"/> LinkedIn
                                            </a>
                                        </div>
                                        }
                                        {medic.website_url &&
                                        <div className="kt-widget__link">
                                            <a href={medic.website_url} target="_blank" rel="noreferrer">
                                                <i className="fa fa-external-link-square-alt"/> {locales_es.website}
                                            </a>
                                        </div>
                                        }
                                    </div>
                                    <div className="kt-widget__actions">
                                        <div className="kt-widget__left">
                                            <a href={medicProfileURL}
                                               className="btn btn-default btn-sm btn-bold btn-upper m-1">{locales_es.seeProfile}</a>
                                            {this.auth.getLocalUserType() === USER_TYPE_SECRETARY ?
                                                <>
                                                <a href={`${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${medic.id}`}
                                                   className="btn btn-brand btn-sm btn-bold btn-upper m-1">{locales_es.editTimetables}</a>
                                                    <a href={`${HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES}/${medic.id}`}
                                                       className="btn btn-outline-brand btn-sm btn-bold btn-upper m-1">{locales_es.editSingleTimetables}</a>
                                                </>
                                                :
                                                <a href={medicProfileURL}
                                                   className="btn btn-brand btn-sm btn-bold btn-upper m-1">{locales_es.setAppointment}</a>
                                            }
                                            {this.props.showChatAccess && (this.auth.getLocalUserType() === USER_TYPE_PATIENT || this.auth.getLocalUserType() === USER_TYPE_MEDIC) &&
                                            <a href={`${HREF_PAGE_ONLINE}/${medic.id}/${this.auth.getUserData().user.id}`}
                                               className="btn btn-primary btn-sm btn-bold btn-upper m-1">{locales_es.sendMessage}</a>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        )
    }

    render() {
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                <div className="row">
                    {this.renderMedics()}
                </div>
            </div>
        )
    }
}
