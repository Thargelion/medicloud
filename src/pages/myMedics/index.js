import React, {Component} from 'react';
import Loading from "./../../components/loading";
import APIService from './../../modules/apiService';
import Subheader from "../../components/subheader";
import locales_es from "../../locales/es";
import {
    HREF_PAGE_ADD_MEDIC,
    HREF_PAGE_MY_MEDICS,
    USER_TYPE_SECRETARY
} from "../../models/constants";
import Helpers from "../../modules/helpers";
import AuthService from "../../modules/authService";
import MedicsList from "../../components/medicsList";

export default class MyMedicsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            medics: null,
            apiMedics: null,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
    }

    componentDidMount() {
        this.api.getMyMedics()
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
            });
        });
    }

    onSearchSubmit(ev) {
        if (ev && ev.preventDefault) {
            ev.preventDefault();
        }
        const form = document.getElementById('searchForm');
        const query = form.children[0].value;

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

    render() {

        const {medics} = this.state;

        return (
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.myMedics,
                        href: HREF_PAGE_MY_MEDICS
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

                        {
                            medics == null ? <Loading/>
                                : medics && medics.length ?
                                <MedicsList medics={medics} showChatAccess={true}/>
                                :
                                <div className="tcenter"> {locales_es.noMedicsAvailable} <br/><br/></div>
                        }

                        {this.auth.getLocalUserType() === USER_TYPE_SECRETARY &&
                        <div className="text-center mt-3">
                            <a href={`${HREF_PAGE_ADD_MEDIC}`}
                               className="btn btn-brand btn-sm btn-bold btn-upper">{locales_es.addMedic}</a>
                        </div> }
                    </div>
                </div>
            </>
        )
    }
}
