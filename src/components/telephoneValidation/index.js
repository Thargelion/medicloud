import React, {Component} from 'react';
import "./index.css";
import locales_es from "../../locales/es";
import DateTimeService from "../../modules/DateTimeService";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import ReactCodeInput from 'react-verification-code-input';
import Spinner from "../spinner";
import AuthService from "../../modules/authService";

const initValidationModalId = 'initValidationModal';

const initialState = {
    isValidated: null,
    enableResend: null,
    validatedText: locales_es.telephoneAlreadyValidated,
    sendingRequest: null,
};

export default class TelephoneValidation extends Component {
    constructor(props) {
        super(props);

        this.state = JSON.parse(JSON.stringify(initialState));

        this.dateTimeService = new DateTimeService();
        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
    }

    reset() {
        this.setState(initialState);
        this.load();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.setState({
            isValidated: null
        }, () => {
            this.auth.getRemoteUserData().then(res => {
                if (res && res.data && res.data.user) {
                    this.setState({
                        isValidated: Boolean(Number(res.data.user.is_cellphone_validated))
                    }, () => {
                        if (this.props.redirect) {
                            setTimeout( () => {
                                this.initValidation()
                            }, 3000)
                        }
                    });
                } else {
                    this.setState({
                        isValidated: false
                    })
                }
            }).catch(err => {
                console.log(err);
            });
        })
    }

    initValidation() {
        const phone = this.props.getCountryCodeMethod()
            ? (this.props.getCountryCodeMethod() + ' ' + this.props.cellphone)
            : ('+54' + ' ' + this.props.cellphone);
        this.setState({
            cellphone: phone
        }, () => {
            if (this.props.cellphone) {
                this.api.updateCellphone({cellphone: this.state.cellphone}).then(() => {
                    window.showCustomModal('#' + initValidationModalId);
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
            }

            if (!this.props.cellphone) {
                this.props.showMainModal(locales_es.infoModal.title, 'Complete con un n??mero de tel??fono v??lido');
            }
        });
    }

    sendValidationCode() {
        this.setState({
            sendingRequest: true
        }, () => {
            this.api.getCellphoneValidation().then(() => {
                const enableResend = new Date();
                enableResend.setMinutes(enableResend.getMinutes() + 1);
                this.setState({
                    enableResend,
                    sendingRequest: false,
                });
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                this.setState({
                    sendingRequest: false,
                })
            });
        })
    }

    initCountdown() {
        const timeinterval = setInterval(() => {
            const t = this.dateTimeService.getTimeRemaining(this.state.enableResend);
            // clock.innerHTML = t.minutes + ':' + t.seconds;
            this.setState({
                resendCountdown: t.minutes + ':' + t.seconds
            });
            if (t.total <= 0) {
                clearInterval(timeinterval);
                this.setState({
                    resendCountdown: null,
                })
            }
        }, 1000);
    }

    send(code) {
        this.api.postCellphoneValidation({cellphone_validation_code: code}).then(res => {
            this.props.showMainModal(locales_es.successModal.title, res.message);
            this.setState({
                validatedText: locales_es.telephoneValidationSuccessfull
            }, () => {
               if (this.props.redirect) {
                   window.hideCustomModal('#' + initValidationModalId);
                   this.props.history.replace(this.props.redirect);
               } else {
                   this.load();
               }
            });
        }).catch(err => {
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    showMoreInfo() {
        this.props.showMainModal(locales_es.infoModal.title, 'Validar tu tel??fono te permitir?? recibir notificaciones y alertas en tu tel??fono.');
    }

    render() {
        const {isValidated, enableResend, resendCountdown, sendingRequest} = this.state;

        return (
            <>
                {isValidated === null ?
                    <Spinner/>
                    : isValidated ?
                        <span className="telephone-validation m-2 d-inline-block"
                              onClick={this.initValidation.bind(this)}>
                        <i className="flaticon2-check-mark kt-font-success pr-1"/>
                        <a className="kt-link kt-font-success">
                            {locales_es.valid}
                        </a>
                    </span>
                        :
                        <span className="telephone-validation m-2 d-inline-block">
                            <i onClick={() => this.showMoreInfo()} className="flaticon2-information kt-font-info pr-1"/>
                            <a className="kt-link kt-font-bold" onClick={this.initValidation.bind(this)}>
                            {locales_es.validate}
                            </a>
                        </span>
                }

                <div id={initValidationModalId} className="modal" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Validar tu tel??fono</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">??</span>
                                </button>
                            </div>
                            {isValidated === null ?
                                <Spinner/>
                                : !isValidated ?
                                    enableResend ?
                                        <>
                                            <div className="modal-body text-center">
                                                <div className="text-center">
                                                    Enviando c??digo de validaci??n a <h4>{this.state.cellphone}</h4>
                                                </div>
                                                <div className="text-center">
                                                    {resendCountdown ?
                                                        <p>Puedes reenviar el c??digo en <span
                                                            id="clock">{resendCountdown}</span></p>
                                                        :
                                                        <p>Si no recibiste el c??digo, chequea que ingresaste el n??mero
                                                            correctamente, o escr??benos a <a
                                                                href="mailto:info@woopi.com.ar">este e-mail</a></p>
                                                    }
                                                </div>
                                                {this.initCountdown()}
                                                <div className="verification-code">
                                                    <h6>Ingrese el c??digo de 5 d??gitos que recibi?? por tel??fono</h6>
                                                    <ReactCodeInput
                                                        fields={5}
                                                        onComplete={this.send.bind(this)}
                                                        autoFocus={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button disabled={resendCountdown}
                                                        onClick={this.sendValidationCode.bind(this)}
                                                        type="button"
                                                        className="btn btn-warning">{locales_es.resendValidationCode}
                                                </button>
                                                <button type="button" className="btn btn-outline-danger"
                                                        onClick={this.reset.bind(this)}
                                                        data-dismiss="modal">{locales_es.cancel}
                                                </button>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className="modal-body">
                                                <div className="text-center pb-3">
                                                    <a className="btn btn-icon btn-circle btn-brand">
                                                        <i className="flaticon-whatsapp"></i>
                                                    </a>
                                                </div>
                                                <p className="text-center">Te enviaremos un c??digo por WhatsApp al n??mero <h4>{this.state.cellphone}</h4> para validar que todo funciona correctamente.</p>
                                                <p className="text-center">De esta forma, podr??s recibir notificaciones de la plataforma a
                                                    trav??s de
                                                    WhatsApp</p>
                                            </div>
                                            <div className="modal-footer justify-content-center justify-content-md-end">
                                                {sendingRequest ?
                                                    <Spinner />
                                                    :
                                                    <>
                                                        <button onClick={this.sendValidationCode.bind(this)}
                                                                type="button"
                                                                className="btn btn-brand">{locales_es.sendValidationCode}
                                                        </button>
                                                        <button type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={this.reset.bind(this)}
                                                                data-dismiss="modal">{locales_es.cancel}
                                                        </button>
                                                    </>
                                                }
                                            </div>
                                        </>
                                    :
                                    <div className="modal-body text-center">
                                        <p>{this.state.validatedText}</p>
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
