import React, {Component} from "react";
import locales_es from "../../locales/es";
import APIService from "../../modules/apiService";
import Spinner from "../spinner";
import Helpers from "../../modules/helpers";
import AuthService from "../../modules/authService";
import {USER_TYPE_SECRETARY} from "../../models/constants";
import Modal from "../modal";
import Form from "../../components/form";
import ConfigService from "../../modules/configService";

export default class Announcements extends Component {

    constructor(props) {
        super(props);

        this.state = {
            announcements: null,
            modal: false,
            clinicId: 0,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.configService = new ConfigService();
    }

    componentDidMount() {
        this.load();
    }

    setModal(bool) {
        this.setState({
            modal: bool
        })
    }

    load() {
        this.setState({
            userType: this.auth.getLocalUserType()
        }, () => {
            this.configService.getLocalClinicData().then(res => {
                this.setState({
                    clinicId: res.id
                }, () => {
                    this.api.getMergedAnnouncements({clinic_id: this.state.clinicId}).then(res => {
                        this.setState({
                            announcements: res.data
                        })
                    }).catch(err => {
                        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                    });
                })
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, err);
            });
        });
    }

    handleChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    validateForm() {
        let errors = 0;
        if (!this.state.title
            || !this.state.text
            || !this.state.clinicId
        ) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeAllFormFields);
        }

        return !errors;
    }

    send() {
        if (this.validateForm()) {
            const objData = {
                title: this.state.title,
                text: this.state.text,
                clinic_id: this.state.clinicId
            };
            this.api.postAnnouncement(objData).then(res => {
                this.props.showMainModal(locales_es.successModal.title, res.message);
                this.setModal(false);
                this.load();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            })
        }
    }

    removeAnnouncement(id) {
        const confirm = window.confirm(locales_es.confirmAnnouncementRemoval);
        if (confirm) {
            this.api.deleteAnnouncement(id).then(res => {
                this.props.showMainModal(locales_es.successModal.title, res.message);
                this.load();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        }
    }

    render() {
        const {announcements, modal, userType} = this.state;

        const inputs = [
            {
                label: locales_es.announcementTitle,
                placeholder: locales_es.announcementTitle,
                id: '1',
                state: 'title',
                value: this.state.title,
                type: 'text',
                required: true
            },
            {
                label: locales_es.announcementText,
                placeholder: locales_es.announcementText,
                id: '2',
                state: 'text',
                value: this.state.text,
                type: 'textarea',
                required: true
            },
        ];

        return (
            <>
                {announcements === null ?
                    <Spinner/> : announcements.length ?
                        <div id="kt-widget-slider-13-3" className="kt-slider carousel slide"
                             data-ride="carousel" data-interval="12000">
                            <div className="kt-slider__head">
                                <div className="kt-slider__label">{locales_es.announcements}</div>
                                <div className="kt-slider__nav">
                                    <a className="kt-slider__nav-prev carousel-control-prev"
                                       href="#kt-widget-slider-13-3" role="button" data-slide="prev">
                                        <i className="fa fa-angle-left" />
                                    </a>
                                    <a className="kt-slider__nav-next carousel-control-next"
                                       href="#kt-widget-slider-13-3" role="button" data-slide="next">
                                        <i className="fa fa-angle-right" />
                                    </a>
                                </div>
                            </div>
                            <div className="carousel-inner">
                                {announcements.map((announcement, index) => {
                                    return (
                                        <div
                                            key={`announcement-${index}`}
                                            className={`carousel-item kt-slider__body ${index === 0 ? 'active' : ''}`}
                                            data-wrap="false">
                                            <div className="kt-widget-13 p-2">
                                                <div className="kt-widget-13__body">
                                                    <span className="kt-widget-13__title">
                                                        {announcement.title}
                                                    </span>
                                                    <div
                                                        className="kt-widget-13__desc kt-widget-13__desc--xl kt-font-brand">
                                                        {announcement.text}
                                                    </div>
                                                </div>
                                                <div className="kt-widget-13__foot">
                                                    {Number(announcement.clinic_id) === Number(this.state.clinicId)
                                                        ?
                                                        <>
                                                            <div className="btn btn-bold btn-sm btn-font-sm  btn-label-focus">
                                                                <i className="fa fa-hospital kt-label-font-color-2"/> {locales_es.clinicAnnouncement}
                                                            </div>
                                                            {userType === USER_TYPE_SECRETARY &&
                                                                <div onClick={() => this.removeAnnouncement(announcement.id)}
                                                                     className="kt-link kt-link--danger pointer ml-3">
                                                                    {locales_es.removeThisAnnouncement}
                                                                </div>
                                                            }
                                                        </>
                                                        : <div className="btn btn-bold btn-sm btn-font-sm  btn-label-success"><i
                                                            className="fa fa-stethoscope kt-label-font-color-2"/> {locales_es.medicloudAnnouncement}</div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        :
                        <div>{locales_es.noAnnouncements}</div>
                }
                {this.auth.getLocalUserType() === USER_TYPE_SECRETARY
                &&
                <div className="mt-3">
                    <a onClick={() => this.setModal(true)}
                       className="btn btn-default btn-sm btn-bold btn-upper pointer">{locales_es.addAnnouncement}</a>
                </div>
                }
                <Modal modalId="announcement"
                       title={locales_es.addAnnouncement}
                       visible={modal}
                       actions={[
                           {
                               className: 'btn btn-brand btn-elevate btn-pill m-3 align-self-start',
                               title: locales_es.send,
                               onClick: () => this.send()
                           },
                           {
                               className: 'btn btn-outline btn-sm btn-bold btn-upper pointer',
                               title: locales_es.cancel,
                               onClick: () => {
                               }
                           }
                       ]}
                >
                    <Form
                        style="kt-login-v2__form kt-form"
                        inputs={inputs}
                        handleChange={this.handleChange}
                    />
                </Modal>
            </>
        )
    }
}
