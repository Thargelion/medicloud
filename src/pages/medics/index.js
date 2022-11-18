import React, {Component} from 'react';
import Loading from "./../../components/loading";
import APIService from './../../modules/apiService';
import Subheader from "../../components/subheader";
import locales_es from "../../locales/es";
import {
    HREF_PAGE_ADD_MEDIC,
    HREF_PAGE_MEDICS, hrefDashboard, hrefLogin,
    USER_TYPE_SECRETARY
} from "../../models/constants";
import Helpers from "../../modules/helpers";
import AuthService from "../../modules/authService";
import MedicsList from "../../components/medicsList";
import ConfigService from "../../modules/configService";
import Spinner from "../../components/spinner";

export default class MedicsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            medics: null,
            apiMedics: null,
            clinicId: 0,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.configService = new ConfigService();
    }

    componentDidMount(cb) {
        this.configService.getLocalClinicData().then(clinic => {
            console.log(clinic);
            this.setState({
                clinicId: clinic.id
            }, () => {
                if (this.state.clinicId) {
                    this.api.getMedics({clinic_id: this.state.clinicId})
                        .then((res) => {
                            this.setState({
                                medics: res.data,
                                apiMedics: res.data,
                            });
                        }).catch(err => {
                        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                        this.setState({
                            medics: [],
                            apiMedics: [],
                        }, () => {
                            cb && cb();
                        });
                    });
                }
            });
        }).catch(err => {
            console.log(err);
        });
    }

    onSearchSubmit(ev) {
        if (ev && ev.preventDefault) {
            ev.preventDefault();
        }
        const form = document.getElementById('searchForm');
        const input = form.children[0];
        const query = input.value;

        // https://stackoverflow.com/questions/37511043/how-to-stop-re-submitting-a-form-after-clicking-back-button
        // TODO: mejorar y volver a cargar el filtro en el botón volver a esta url
        if (!this.state.medics && query) {
            input.value = '';
            return;
        }

        this.setState({
            medics: this.state.apiMedics
        }, () => {
            if (!query) {
                return;
            }
            const regex = new RegExp(query, 'i'); // add 'i' modifier that means "ignore case"

            let medics = JSON.parse(JSON.stringify(this.state.medics));
            medics = medics.filter(medic => {
                if (regex.test(medic.name) || regex.test(medic.lastname) || regex.test(medic.specialty_name)) {
                    return medic;
                }
            });
            this.setState({
                medics
            });
        })
    }

    redirect() {
        this.auth.isLoggedUser()
          ? this.props.history.push(hrefDashboard)
          : window.location.href = hrefLogin
    }

    render() {

        const {medics, clinicId} = this.state;

        return (
            clinicId === 0 ? <Spinner />
            : clinicId ? <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.allSpecialists,
                        href: HREF_PAGE_MEDICS
                    }
                ]}/>
                <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">

                        <div className="form-group row justify-content-center mt-3">
                            <div className="col col-lg-6">
                                <form onSubmit={(e) => this.onSearchSubmit(e)}
                                      className="kt-input-icon kt-input-icon--right" id="searchForm">
                                    <input className="form-control"
                                           type="search"
                                           onChange={(e) => this.onSearchSubmit(e)}
                                           placeholder={locales_es.searchByMedicsOrSpeciality}/>
                                    <span onClick={(e) => this.onSearchSubmit(e)}
                                          className="kt-input-icon__icon kt-input-icon__icon--right">
                                        <span><i className="la la-search"/></span>
                                    </span>
                                </form>
                            </div>
                        </div>

                        {this.auth.getLocalUserType() === USER_TYPE_SECRETARY &&
                        <div className="text-center m-3">
                            <a href={`${HREF_PAGE_ADD_MEDIC}`}
                               className="btn btn-brand btn-sm btn-bold btn-upper"><i className="flaticon2-add-1" /> {locales_es.addMedic}</a>
                        </div> }

                        {
                            medics == null ? <Loading/>
                                : medics && medics.length ?
                                <MedicsList medics={medics}/>
                                :
                                <div className="tcenter"> {locales_es.noMedicsAvailable} <br/><br/></div>
                        }
                    </div>
                </div>
            </>
              :
              <>
                <div className="text-center m-5 p-5">{locales_es.loading}...</div>
                  {this.redirect()}
              </>
        )
    }
}
