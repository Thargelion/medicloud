import React, {Component} from "react";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Spinner from "../../components/spinner";
import locales_es from "../../locales/es";
import AuthService from "../../modules/authService";
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import {
    HREF_PAGE_ONLINE,
    HREF_PAGE_PATIENTS,
    USER_TYPE_MEDIC, USER_TYPE_PATIENT,
    USER_TYPE_SECRETARY
} from "../../models/constants";
import DateTimeService from "../../modules/DateTimeService";
import Subheader from "../../components/subheader";
import MedicCard from "../../components/medicCard";

export default class PatientsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            patients: null,
            identificationOptions: []
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.dateTimeService = new DateTimeService();
    }

    componentDidMount() {
        this.api.getIdentificationTypes().then(res => {
            this.setState({
                identificationOptions: res.data
            }, () => {
                this.api.getMyPatients().then(res => {
                    this.setState({
                        patients: res.data,
                        apiPatients: res.data,
                    });
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        });
    }

    getSelectedIdentificationTypeName(identificationId) {
        const filtered = this.state.identificationOptions.filter(id => id.id === identificationId);
        return filtered && filtered.length ? `${locales_es.numberOf} ${filtered[0].name}` : locales_es.identificationType
    }

    onSearchSubmit(ev) {
        if (ev && ev.preventDefault) {
            ev.preventDefault();
        }
        const form = document.getElementById('searchForm');
        const query = form.children[0].value;

        this.setState({
            patients: this.state.apiPatients
        }, () => {
            if (!query) {
                return;
            }
            const regex = new RegExp(query, 'i'); // add 'i' modifier that means "ignore case"

            let patients = JSON.parse(JSON.stringify(this.state.patients));
            patients = patients.filter(patient => {
                if (regex.test(patient.name) || regex.test(patient.lastname)) {
                    return patient;
                }
            });
            this.setState({
                patients
            });
        })
    }

    render() {
        const {patients} = this.state;

        return (
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.patients,
                        href: HREF_PAGE_PATIENTS
                    }
                ]}/>
                <div className="kt-container">

                    <div className="form-group row justify-content-center">
                        <div className="col col-lg-6">
                            <form onSubmit={(e) => this.onSearchSubmit(e)}
                                  className="kt-input-icon kt-input-icon--right" id="searchForm">
                                <input className="form-control"
                                       type="search"
                                       onChange={(e) => this.onSearchSubmit(e)}
                                       placeholder={locales_es.searchByPatientsNameOrLastname}/>
                                <span onClick={(e) => this.onSearchSubmit(e)}
                                      className="kt-input-icon__icon kt-input-icon__icon--right">
                                        <span><i className="la la-search"/></span>
                                    </span>
                            </form>
                        </div>
                    </div>


                    <div className="p-2 text-right">
                        <ReactHTMLTableToExcel
                            id="test-table-xls-button"
                            className="btn btn-focus"
                            table="table-to-xls"
                            filename="Mis-Pacientes"
                            sheet="tablexls"
                            buttonText={locales_es.exportXLS}/>
                    </div>
                    <table id="table-to-xls" className="d-none">
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>E-Mail</th>
                            <th>N° de Documento</th>
                            <th>Teléfono</th>
                            <th>Fecha de Nacimiento</th>
                        </tr>
                        {patients === null ?
                            <div className="row">
                                <div className="col text-center">
                                    <Spinner/>
                                </div>
                            </div>
                            : patients && patients.length ?
                                patients.map(patient => {
                                    return (
                                        <tr>
                                            <td>
                                                {patient.name}
                                            </td>
                                            <td>
                                                {patient.lastname}
                                            </td>
                                            <td>
                                                {patient.email}
                                            </td>
                                            <td>
                                                {patient.identification}
                                            </td>
                                            <td>
                                                {patient.cellphone}
                                            </td>
                                            <td>
                                                {patient.date_of_birth &&
                                                    <span className="kt-widget__value"
                                                          dangerouslySetInnerHTML={
                                                              {
                                                                  __html: this.dateTimeService.parseEventDate(this.dateTimeService.parseAPIStringToDate(patient.date_of_birth), true, 'day') + ' ' +
                                                                      this.dateTimeService.parseEventDate(this.dateTimeService.parseAPIStringToDate(patient.date_of_birth), true, 'month') + ' ' +
                                                                      this.dateTimeService.parseEventDate(this.dateTimeService.parseAPIStringToDate(patient.date_of_birth), true, 'year')
                                                              }
                                                          }/>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                                :
                                <tr>
                                    <td>
                                        <div
                                            className="kt-datatable--error">{locales_es.noPatientsFound}</div>
                                    </td>
                                </tr>
                        }
                    </table>


                    {patients === null ?
                        <div className="row">
                            <div className="col text-center">
                                <Spinner/>
                            </div>
                        </div>
                        : patients && patients.length ?

                            <div className="row">
                                {patients.map(patient => {
                                    return (

                                        <div className="col-xl-4 col-lg-6">

                                            <div className="kt-portlet kt-portlet--height-fluid">
                                                <div className="kt-widget kt-widget--general-2">
                                                    <div className="kt-portlet__body kt-portlet__body--fit">
                                                        <div className="kt-widget__top">
                                                            <div className="kt-media kt-media--lg kt-media--circle">
                                                                <img src={patient.full_profile_image} alt=""/>
                                                            </div>
                                                            <div className="kt-widget__wrapper">
                                                                <div className="kt-widget__label">
                                                                    <a href="#" className="kt-widget__title">
                                                                        {patient.name} {patient.lastname}
                                                                    </a>
                                                                    <span className="kt-widget__desc">
                                {locales_es.patient}
                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="kt-widget__bottom">
                                                            <div className="kt-widget__progress mb-3">
                                                                <div className="kt-widget__stat">
                                    <span
                                        className="kt-widget__caption">{locales_es.email_address}: </span>
                                                                    <span
                                                                        className="kt-widget__value">{patient.email}</span>
                                                                </div>
                                                            </div>
                                                            <div className="kt-widget__progress mb-3">
                                                                <div className="kt-widget__stat">
                                    <span
                                        className="kt-widget__caption">{this.getSelectedIdentificationTypeName(patient.identification_type_id)}: </span>
                                                                    <span
                                                                        className="kt-widget__value">{patient.identification}</span>
                                                                </div>
                                                            </div>
                                                            <div className="kt-widget__progress mb-3">
                                                                <div className="kt-widget__stat">
                                    <span
                                        className="kt-widget__caption">{locales_es.phoneNumber}: </span>
                                                                    <span
                                                                        className="kt-widget__value">{patient.cellphone}</span>
                                                                </div>
                                                            </div>
                                                            <div className="kt-widget__progress mb-3">
                                                                <div className="kt-widget__stat">
                                    <span
                                        className="kt-widget__caption">{locales_es.date_of_birth}: </span>
                                                                    {patient.date_of_birth &&
                                                                        <span className="kt-widget__value"
                                                                              dangerouslySetInnerHTML={
                                                                                  {
                                                                                      __html: this.dateTimeService.parseEventDate(this.dateTimeService.parseAPIStringToDate(patient.date_of_birth), true, 'day') + ' ' +
                                                                                          this.dateTimeService.parseEventDate(this.dateTimeService.parseAPIStringToDate(patient.date_of_birth), true, 'month') + ' ' +
                                                                                          this.dateTimeService.parseEventDate(this.dateTimeService.parseAPIStringToDate(patient.date_of_birth), true, 'year')
                                                                                  }
                                                                              }/>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <br/>
                                                            {this.auth.getLocalUserType() !== USER_TYPE_SECRETARY &&
                                                                <div className="kt-widget__actions clear">
                                                                    {(this.auth.getLocalUserType() === USER_TYPE_PATIENT || this.auth.getLocalUserType() === USER_TYPE_MEDIC) &&
                                                                        <a href={`${HREF_PAGE_ONLINE}/${this.auth.getUserData().user.id}/${patient.id}`}
                                                                           className="btn btn-primary btn-sm btn-bold btn-upper">{locales_es.sendMessage}</a>
                                                                    }
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                })}

                            </div>

                            :
                            <>
                                <div className="row">
                                    <div className="offset-md-3 col-md-6 text-center">
                                        <div className="alert alert-dark" role="alert">
                                            <div className="alert-text">{locales_es.noPatientsFound}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                    }

                    <MedicCard/>

                </div>
            </>
        )
    }
}
