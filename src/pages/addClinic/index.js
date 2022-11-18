import React, {Component} from 'react';
import Loading from "./../../components/loading";
import APIService from './../../modules/apiService';
import Subheader from "../../components/subheader";
import locales_es from "../../locales/es";
import {
    HREF_PAGE_ADD_MEDIC, HREF_PAGE_HOME, HREF_PAGE_MEDIC_EDIT_TIMETABLES,
    HREF_PAGE_MEDICS, USER_TYPE_MEDIC,
} from "../../models/constants";
import Helpers from "../../modules/helpers";
import AuthService from "../../modules/authService";
import Form from "../../components/form";
import DateTimeService from "../../modules/DateTimeService";
import ConfigService from "../../modules/configService";
import TimezoneService from "../../modules/timezoneService";
import Modal from "../../components/modal";

export default class AddClinicPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            modalVisible: false,
            medicId: Number(props.match.params.medicId),
            clinicId: Number(props.match.params.clinicId),
            name: '',
            address: '',
            phone: '',
            web_url: '',
            redirect: window.URLSearchParams
                ? new window.URLSearchParams(this.props.location.search).get("redirect") : null,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.dateTimeService = new DateTimeService();
        this.configService = new ConfigService();
        this.timezoneService = new TimezoneService();
    }

    componentDidMount() {
        if (this.auth.getLocalUserType() !== USER_TYPE_MEDIC) {
            window.location.href = HREF_PAGE_HOME;
            return;
        }

        if (this.state.clinicId) {
            this.setLoading(true);
            this.api.getClinicById(this.state.clinicId).then(res => {
                this.setState({
                    name: res.data.name,
                    address: res.data.address,
                    phone: res.data.phone,
                    web_url: res.data.web_url,
                }, () => this.setLoading(false));
            }).catch(() => {
                this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeAllFormFields);
                this.setLoading(false);
            });
        } else {
            this.setLoading(false);
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

    validateForm() {
        let errors = 0;
        if (!this.state.name) {
            errors += 1;
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeAllFormFields);
        }
        return !errors;
    }

    send() {
        if (this.validateForm()) {
            this.setLoading(true);

            const objData = JSON.parse(JSON.stringify(this.state));

            if (this.state.clinicId) {
                this.api.putClinic(this.state.clinicId, objData)
                  .then((res) => {
                      this.props.showMainModal(locales_es.successModal.title, res.message);
                      this.successRedirect();
                      this.setLoading(false);
                  }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                    this.setLoading(false);
                });
            } else {
                this.api.postClinic(objData)
                  .then((res) => {
                      this.props.showMainModal(locales_es.successModal.title, res.message);
                      this.successRedirect();
                      this.setLoading(false);
                  }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                    this.setLoading(false);
                });
            }
        }
    }

    successRedirect() {
        if (this.state.redirect) {
            window.location.href = this.state.redirect;
            return;
        }
        this.props.history.replace(`${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${this.state.medicId}`);
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    }

    setModalVisible(bool) {
        this.setState({
            modalVisible: bool
        })
    }

    confirmDeleteClinic() {
        this.setLoading(true);
        this.api.deleteClinic(this.state.clinicId).then(() => {
            this.setLoading(false);
            this.successRedirect();
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            this.setLoading(false);
        })
    }

    render() {

        const inputs = [
            {
                label: locales_es.name,
                placeholder: locales_es.name,
                id: 2,
                state: 'name',
                value: this.state.name,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-4 float-left pl-md-0',
            },
            {
                label: locales_es.address,
                placeholder: locales_es.address,
                id: 3,
                state: 'address',
                value: this.state.address,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-8 float-left pr-md-0',
            },
            {
                label: locales_es.telephone_number,
                placeholder: locales_es.telephone_number_example,
                id: 6,
                state: 'phone',
                value: this.state.phone,
                type: 'number',
                required: false,
                wrapperCustomClassName: 'form-group col-md-4 float-left pl-md-0',
                customClassName: 'cellphoneInput',
            },
            {
                label: locales_es.website,
                placeholder: locales_es.website,
                id: 19,
                state: 'web_url',
                value: this.state.web_url,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-8 float-left pr-md-0',
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
                <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app mt-3">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                        <Form
                            styles="kt-form"
                            inputs={inputs}
                            handleChange={this.handleChange}
                            handleDateChange={this.handleDateChange}
                            handleReactSelectChange={this.handleReactSelectChange}
                            onSubmit={() => this.send()}
                            onSubmitButtonText={this.state.clinicId ? locales_es.save : locales_es.send}
                            secondaryButtonText={this.state.clinicId ? locales_es.deleteAttentionPlace : locales_es.cancel}
                            secondaryButtonStyle={this.state.clinicId ? 'kt-link--danger' : ''}
                            onClickSecondaryButton={() => {
                                if (this.state.clinicId) {
                                    this.setState({
                                        modalVisible: true,
                                    })
                                } else {
                                    this.props.history.goBack()
                                }
                            }}
                            showTerms={false}
                            wrapper={true}
                        >
                            <div className="kt-portlet__head">
                                <div className="kt-portlet__head-label">
                                    <h3 className="kt-portlet__head-title">{this.state.clinicId ? locales_es.editAttentionPlace : locales_es.register.title}</h3>
                                </div>
                            </div>
                        </Form>

                        {this.state.modalVisible ? <Modal modalId="deleteClinic"
                               title={locales_es.deleteAttentionPlace}
                               visible={this.state.modalVisible}
                               hideCloseButton={true}
                               actions={[
                                   {
                                       className: 'btn btn-brand btn-danger btn-pill m-3 align-self-start',
                                       title: locales_es.delete,
                                       onClick: () => {
                                           this.setModalVisible(false);
                                           this.confirmDeleteClinic();
                                       }
                                   },
                                   {
                                       className: 'btn btn-secondary btn-pill',
                                       title: locales_es.cancel,
                                       onClick: () => this.setModalVisible(false)
                                   }
                               ]}
                        >
                            <p>¿Está seguro de querer borrar esta clínica?</p>
                        </Modal> : null}
                    </div>
                </div>
            </>
        )
    }
}
