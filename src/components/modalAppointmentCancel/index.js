import React, {Component} from 'react';
import locales_es from "../../locales/es";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Spinner from "../spinner";
import DateTimeService from "../../modules/DateTimeService";
import {HREF_PAGE_MEDIC} from "../../models/constants";

export default class ModalAppointmentCancel extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            appointment: null
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.dateTimeService = new DateTimeService();
    }

    componentDidMount() {
        this.api.getAppointment(this.props.appointmentId).then(res => {
            this.setState({
                appointment: res.data
            })
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    }

    render() {
        const {onConfirm, onAbort} = this.props;
        const {appointment} = this.state;

        return (
            <>
                <div className="woopi-overlay">
                    <div className="woopi-overlay-content">
                        <div className="row justify-content-center">
                            <div className="col-lg-9 text-center">
                                <h4 className="m-3">¿Está seguro de querer cancelar este turno?</h4>
                                <div>
                                    <div>
                                        <strong>Importante: </strong>
                                        Le avisaremos al médico de tu decisión.
                                        <br/>
                                        <br/>
                                        <strong className="d-inline-block mb-3">Datos del turno:</strong>
                                        <div>
                                            {appointment === null ? <Spinner /> :
                                              appointment ?
                                                <>
                                                    <h3 className="mb-3">
                                                        <span data-hj-allow dangerouslySetInnerHTML={
                                                            {
                                                                __html: this.dateTimeService.parseEventDate(appointment.start, false)
                                                            }
                                                        }/>&nbsp;
                                                        <span data-hj-allow dangerouslySetInnerHTML={
                                                            {
                                                                __html: this.dateTimeService.parseEventTime(appointment.start)
                                                            }
                                                        }/>
                                                    </h3>
                                                    <h5>
                                                        Profesional:
                                                    </h5>
                                                    <h4>
                                                        <a href={`${HREF_PAGE_MEDIC}/${appointment.medic.id}`}>{appointment.medic.prefix_name} {appointment.medic.name} {appointment.medic.lastname}</a>
                                                    </h4>
                                                </>
                                                : <div>Error: Turno no encontrado</div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-3">
                            <div className="col-lg-9 text-center">
                                {appointment &&
                                    <button href="#" onClick={(e) => {
                                        e.preventDefault();
                                        this.setLoading(true);
                                        onConfirm && onConfirm();
                                    }} type="button"
                                       disabled={this.state.loading}
                                       className="btn btn-warning btn-pill m-1">
                                        {locales_es.yesCancelAppointment}
                                    </button>
                                }
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    onAbort && onAbort()
                                }} type="button"
                                   className="btn btn-secondary btn-pill m-1">
                                    {locales_es.noCancelAppointment}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
