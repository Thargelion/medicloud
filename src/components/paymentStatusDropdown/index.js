import React, {Component} from 'react';
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import locales_es from "./../../locales/es";
import Spinner from "../spinner";
import {STATUS_COLORS} from "../../models/constants";

export default class PaymentStatusDropdown extends Component {

    constructor(props) {
        super(props);

        this.state = {
            statusList: [],
            loading: false,
            nextStatus: null,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
    }

    componentDidMount() {
        this.api.getPaymentsStatus().then(res => {
            this.setState({
                statusList: res.data
            }, () => this.getCurrentState())
        }).catch(err => {
            // this.props.showMainModal(locales_es.infoModal.title, this.helpers.getErrorMsg(err));
            console.log(err);
        })
    }

    getCurrentState() {
        if (this.props.currentStatus) {
            this.setState({
                currentStatus: this.props.currentStatus
            })
        } else {
            this.api.getAppointment(this.props.appointmentId).then(res => {
                this.setState({
                    currentStatus: res.data.payment_status
                })
            }).catch(err => {
                console.log(err);
            })
        }
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    }

    render() {
        const {statusList, currentStatus, nextStatus, loading} = this.state;
        const {showTitle, style} = this.props;

        const onClick = (stat) => {
            this.setState({
                nextStatus: stat.id
            }, () => {
                this.setLoading(true);
                this.api.putPaymentsStatus(this.props.appointmentId, {payment_status: stat.id}).then(() => {
                    this.getCurrentState();
                    this.setLoading(false);
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                    this.setLoading(false);
                })
            })
        };

        const getCurrentStatus = () => {
            const result = statusList.filter(stat => stat.id === currentStatus);
            // TODO REMOVE // HOTFIX TO EMEND API TYPO in "not_aply" in place of "not_apply"
            if (currentStatus === 'not_aply' && !result.length) {
                result.push({
                    id: 'not_apply',
                    name: 'No aplica',
                });
            }
            return result && result.length ? result[0] : {};
        };

        return (
            <div style={style}>
                {showTitle &&
                <div className="row">
                    <div className="col">
                        <label>{locales_es.paymentStatusText}</label>
                    </div>
                </div>
                }
                    <div className="row">
                        <div className="col mb-3">
                            {!currentStatus ?
                                <Spinner className="text-left" />
                                :
                                <div className="btn-group">
                                    <button type="button" className={`btn ${STATUS_COLORS.paymentStatusButton[getCurrentStatus().id]}`}>
                                        {getCurrentStatus().name}
                                    </button>
                                    <button type="button"
                                            className={`btn ${STATUS_COLORS.paymentStatusButton[getCurrentStatus().id]} ${loading ? '' : 'dropdown-toggle'} dropdown-toggle-split`}
                                            style={loading ? {borderRadius: '0.25rem', borderTopLeftRadius: 0, borderBottomLeftRadius: 0} : {}}
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {loading && nextStatus
                                            ? <div
                                                className={`spinner-grow ${STATUS_COLORS.paymentStatusFancyDotSpinner[statusList.filter(stat => stat.id === nextStatus)[0].id]}`}
                                                style={{width: '1rem', height: '1rem', verticalAlign: 'middle'}}
                                                role="status"><span className="sr-only">Loading...</span></div>
                                            : <span className="sr-only">Toggle Dropdown</span>}
                                    </button>
                                    <div className="dropdown-menu" x-placement="bottom-start">
                                        {statusList.map(stat => {
                                            return (
                                                <>
                                                {stat.id === 'patient_missed' && <div className="dropdown-divider"></div>}
                                                <a className="dropdown-item cursor-pointer"
                                                    onClick={() => onClick(stat)}>
                                                    <span className={`kt-badge ${STATUS_COLORS.paymentStatusBadges[stat.id]} mr-2`} />
                                                    {stat.name}
                                                </a>
                                                </>
                                            )
                                        })}
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
            </div>
        )
    }
}
