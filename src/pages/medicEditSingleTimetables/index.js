import React, {Component} from 'react';
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Subheader from "../../components/subheader";
import locales_es from "../../locales/es";
import {HREF_PAGE_MEDICS, USER_TYPE_PATIENT, USER_TYPE_SECRETARY} from "../../models/constants";
import Loading from "../../components/loading";
import MedicProfileHeader from "../../components/medicProfileHeader";
import AuthService from "../../modules/authService";
import Spinner from "../../components/spinner";
import EditMedicTimetable from "../../components/editMedicTimetables";
import MedicSingleTimetables from "../../components/medicSingleTimetables";

export default class MedicEditSingleTimetablesPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            medicId: Number(props.match.params.id),
            timetableId: Number(props.match.params.timetableId),
            medic: null,
            userType: null
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
    }

    componentWillMount() {
        this.setLocalUserType();
    }

    setLocalUserType() {
        const localUser = this.auth.getUserData();
        if (localUser && localUser.user) {
            this.setState({
                userType: localUser.user.user_type
            }, () => this.checkUserStatus());
        }
    }

    checkUserStatus() {
        const isLoggedIn = this.auth.isLoggedUser();
        if (!isLoggedIn || this.state.userType === USER_TYPE_PATIENT) {
            this.successLoginRedirect();
        }
    }

    componentDidMount() {
        this.api.getMedicById(this.state.medicId).then(res => {
            this.setState({
                medic: res.data
            });
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    render() {
        const {medic, timetableId, userType} = this.state;

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
                                timetableId ? null
                                    :
                                    <MedicProfileHeader showMainModal={this.props.showMainModal} medic={medic}/>
                                :
                                <div className="tcenter"> {locales_es.noInfoAvailable} <br/><br/></div>
                        }
                    </div>


                    <div className="tab-content">
                        <div className="tab-pane fade show active" id="kt_tabs_1_1" role="tabpanel">

                            <div className="row">
                                <div className="col-12">

                                    <div className="kt-portlet kt-portlet--height-fluid">
                                        <div className="kt-portlet__head">
                                            <div className="kt-portlet__head-label">
                                                <h3 className="kt-portlet__head-title">{locales_es.editTimetables}</h3>
                                            </div>
                                        </div>
                                        <div
                                            className="kt-portlet__body kt-portlet__body--fluid kt-portlet__body--fit">
                                            <div className="kt-widget-2">
                                                <div className="kt-widget-2__content kt-portlet__space-x">
                                                    {!medic ? <Spinner/> :
                                                        userType === USER_TYPE_SECRETARY ?
                                                            timetableId ?
                                                                <EditMedicTimetable
                                                                    showMainModal={this.props.showMainModal}
                                                                    medic={medic}
                                                                    timetableId={timetableId}/>
                                                                :
                                                                <MedicSingleTimetables
                                                                    showMainModal={this.props.showMainModal}
                                                                    medic={medic}/>
                                                            :
                                                            <div className="alert alert-primary fade show"
                                                                 role="alert">
                                                                <div className="alert-icon"><i
                                                                    className="flaticon-warning"/></div>
                                                                <div
                                                                    className="alert-text">{locales_es.momentaryDisabledTimetablesEdition}
                                                                </div>
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


                </div>
            </>
        )
    }
}
