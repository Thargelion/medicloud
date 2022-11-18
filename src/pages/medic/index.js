import React, {Component} from 'react';
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Subheader from "../../components/subheader";
import locales_es from "../../locales/es";
import {HREF_PAGE_HOME, HREF_PAGE_MEDICS, USER_TYPE_MEDIC, USER_TYPE_SECRETARY} from "../../models/constants";
import Loading from "../../components/loading";
import MedicProfileHeader from "../../components/medicProfileHeader";
import AuthService from "../../modules/authService";
import MedicAgenda from "../../components/medicAgenda";
import MedicAppointmentsBranded from "../../components/medicAppointmentsBranded";
import MedicAppointments from "../../components/medicAppointments";
import AppointmentsCalendar from "../../components/appointmentsCalendar";
import ConfigService from "../../modules/configService";
import Spinner from "../../components/spinner";

export default class MedicPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            medicIdOrSlugname: props.match.params.id,
            medic: null,
            userType: null,
            isBranded: null,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.configService = new ConfigService();
    }

    renderText(textFromDB) {
        return textFromDB ? textFromDB.split('\n').map((x, i) => <p key={i}>{x}</p>) : '';
    }

    componentDidMount() {
        let promise;
        if (isNaN(this.state.medicIdOrSlugname)) {
            promise = this.api.getMedicBySlugname;
        } else {
            promise = this.api.getMedicById;
        }
        promise(this.state.medicIdOrSlugname).then(res => {
            this.setState({
                medic: res.data
            });
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            window.location.href = HREF_PAGE_HOME;
        });

        this.setLocalUserType();

        this.configService.getLocalClinicData().then(clinic => {
            this.setState({
                isBranded: Boolean(clinic.id)
            });
        }).catch(err => {
            console.log(err);
        })
    }

    setLocalUserType() {
        const localUser = this.auth.getUserData();
        if (localUser && localUser.user) {
            this.setState({
                userType: localUser.user.user_type,
                userId: localUser.user.id
            });
        }
    }

    renderMedicSecretaryAdministration(medic, userType) {
        return (
          <>
              {medic &&
              <AppointmentsCalendar location={this.props.location}
                                    medic={medic}
                                    showMainModal={this.props.showMainModal}/>
              }
              <MedicAgenda history={this.props.history}
                           showMainModal={this.props.showMainModal}
                           medic={medic} userType={userType}/>
          </>
        )
    }

    renderPatientMedicAppointments() {
        return (
            this.state.isBranded === null ?
                <div className="p-3">
                    <Spinner />
                </div>
                : this.state.isBranded ?
                    <MedicAppointmentsBranded history={this.props.history}
                                              showMainModal={this.props.showMainModal}
                                              medic={this.state.medic}/>
                    :
                        <MedicAppointments history={this.props.history}
                                                  showMainModal={this.props.showMainModal}
                                                  medic={this.state.medic}/>
        )
    }

    render() {
        const {medic, userType} = this.state;

        return (
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.specialists,
                        href: HREF_PAGE_MEDICS
                    },
                    {
                        name: locales_es.specialistProfile,
                        href: HREF_PAGE_MEDICS
                    },
                    medic ? {
                        name: medic.name + ' ' + medic.lastname
                    } : {}
                ]}/>
                <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                        {
                            medic == null ? <Loading/>
                                : medic ?
                                <MedicProfileHeader showMainModal={this.props.showMainModal} medic={medic}/>
                                :
                                <div className="tcenter"> {locales_es.noMedicsAvailable} <br/><br/></div>
                        }
                    </div>


                    <div className="tab-content">
                        <div className="tab-pane fade show active" id="kt_tabs_1_1" role="tabpanel">

                            <div className="row">
                                <div className="col-md-12 col-lg-4 order-2 order-md-1 order-lg-1">

                                    <div className="kt-portlet kt-portlet--height-fluid">
                                        <div className="kt-portlet__head">
                                            <div className="kt-portlet__head-label">
                                                <h3 className="kt-portlet__head-title">{locales_es.bio}</h3>
                                            </div>
                                        </div>
                                        <div className="kt-portlet__body">
                                            <div className="kt-widget-16">
                                                {medic && medic.description ? this.renderText(medic.description) : ''}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="col-md-12 col-lg-8 order-1 order-md-2 order-lg-2">

                                    <div className="kt-portlet kt-portlet--height-fluid">
                                        <div className="kt-portlet__head">
                                            <div className="kt-portlet__head-label">
                                                <h3 className="kt-portlet__head-title">
                                                    {userType && (userType === USER_TYPE_SECRETARY || userType === USER_TYPE_MEDIC)
                                                        ? locales_es.administrateAppointments
                                                        : locales_es.requestAnAppointment
                                                    }</h3>
                                            </div>
                                        </div>
                                        <div
                                            className="kt-portlet__body kt-portlet__body--fluid kt-portlet__body--fit">
                                            <div className="kt-widget-2">
                                                {medic &&
                                                <div className="kt-widget-2__content kt-portlet__space-x">
                                                    {/*Aca se saca turno o se edita la agenda*/}
                                                    {/*MÉDICO*/}
                                                    {userType && (userType === USER_TYPE_MEDIC)
                                                        ?
                                                        <div className="mt-3">
                                                            {Number(this.state.userId) === Number(medic.id) ?
                                                                this.renderMedicSecretaryAdministration(medic, userType)
                                                                :
                                                                <p>{locales_es.contactThisDoctorToSharePatients}</p>
                                                            }
                                                        </div>
                                                        : userType && (userType === USER_TYPE_SECRETARY) ?
                                                            <div className="mt-3">
                                                                {this.renderMedicSecretaryAdministration(medic, userType)}
                                                            </div>
                                                            :
                                                                this.renderPatientMedicAppointments()
                                                    }
                                                </div>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>


                </div>
            </>
        )
    }
}
