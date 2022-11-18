import React, {Component} from "react";
import {
  HREF_PAGE_HOME, PAYMENT_METHOD_AMOUNT_TYPE_PERCENT, PAYMENT_METHOD_BANK_TRANSFER,
  PAYMENT_METHOD_MERCADO_PAGO, STATUS_FAILED,
  STATUS_SUCCESS,
  USER_TYPE_MEDIC
} from "../../models/constants";
import AuthService from "../../modules/authService";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import locales_es from "../../locales/es";
import Spinner from "../../components/spinner";
import AmountTypeConfig from "../../components/amountTypeConfig";
import "./styles.css";
import Loading from "../../components/loading";
import ModalAnimationResult from "../../components/modalAnimationResult";

export default class SettingsPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      userData: null,
      paymentMethods: null,
      enableBeforePayment: null,
      mercadoPagoEnabled: null,
      result: null,
      amountTypes: null,
      currentAmountType: null,
      currentPaymentMethods: [],
      bankTransferData: '',
    };

    this.auth = new AuthService();
    this.api = new APIService();
    this.helpers = new Helpers();

    if (window.URLSearchParams && new window.URLSearchParams(this.props.location.search).get("result")) {
      setTimeout(() => {
        this.setState({
          result: new window.URLSearchParams(this.props.location.search).get("result")
        })
      }, 1500);
    }
  }

  componentWillMount() {
    this.checkUserStatus();
  }

  setLoading(bool) {
    this.setState({
      loading: bool
    })
  }

  async checkUserStatus() {
    const isLoggedIn = await this.auth.isLoggedUser();
    const userData = this.auth.getUserData();
    // alert(JSON.stringify(userData));
    if (!isLoggedIn || (isLoggedIn && userData && userData.user && userData.user.user_type !== USER_TYPE_MEDIC)) {
      this.redirectNotLoggedIn();
    } else {
      this.load();
    }
  }

  load() {
    this.api.getPaymentMethods().then(res => {
      if (res && res.data) {
        this.setState({
          paymentMethods: res.data
        }, () => {
          this.loadUserData();
          this.getMercadoPagoStatus();
          this.getBankTransferInfo();
        });
      }
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });

    this.api.getPaymentsAmountTypes().then(res => {
      this.setState({
        amountTypes: res.data
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });
  }

  loadUserData() {
    this.auth.getRemoteUserData().then(res => {
      this.setState({
        userData: res.data.user,
        enableBeforePayment: res.data.user.enable_before_payment,
        beforePaymentType: res.data.user.before_payment_type,
        currentAmountType: res.data.user.before_payment_type,
        currentAmount: res.data.user.before_payment_amount,
        beforePaymentAmount: res.data.user.before_payment_amount,
      }, () => {
        this.loadUserPaymentMethods();
      });
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  loadUserPaymentMethods() {
    this.api.getPaymentMethodsByUser(this.state.userData.id).then(res => {
      const arr = res.data;
      this.setState({
        currentPaymentMethods: arr.map(pm => pm.payment_method.id)
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    });
  }

  PMIndexInArray(pmId) {
    return this.state.currentPaymentMethods.indexOf(pmId);
  }

  redirectNotLoggedIn() {
    window.location.href = HREF_PAGE_HOME;
  }

  getBankTransferInfo() {
    this.api.getBankTransfer().then(res => {
      if (res.data) {
        this.setState({
          bankTransferData: res.data.data
        })
      }
    }).catch((err) => {
      // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      console.log(err)
    })
  }

  getMercadoPagoStatus() {
    this.api.getMercadoPagoInfo().then(() => {
      this.setMercadoPagoEnabled(true);
    }).catch(() => {
      // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      this.setMercadoPagoEnabled(false);
    })
  }

  setMercadoPagoEnabled(bool) {
    this.setState({
      mercadoPagoEnabled: bool
    })
  }

  render() {
    const {
      loading,
      paymentMethods,
      userData,
      enableBeforePayment,
      beforePaymentType,
      beforePaymentAmount,
      mercadoPagoEnabled,
      result,
      amountTypes,
      currentAmountType,
      currentAmount
    } = this.state;

    const onChangeEnableBeforePayment = () => {
      this.setState({
        enableBeforePayment: !enableBeforePayment
      })
    };

    const save = (ev) => {
      ev.preventDefault();
      if (enableBeforePayment) {
        if (beforePaymentAmount) {
          const objData = {
            enable_before_payment: enableBeforePayment,
            before_payment_type: beforePaymentType,
            before_payment_amount: beforePaymentAmount,
          };

          // Validaciones
          if (beforePaymentType === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT) {
            if (beforePaymentAmount > 100 || beforePaymentAmount < 1) {
              this.props.showMainModal(locales_es.infoModal.title, 'En cobro por Porcentaje debe configurar valores entre 1% y 100%');
              return;
            }
          }
          sendConfig(objData, true);
        } else {
          this.props.showMainModal(locales_es.infoModal.title, 'Debe configurar un monto o porcentaje de cobro');
        }
      } else {
        const objData = {
          enable_before_payment: enableBeforePayment,
        };
        sendConfig(objData);
      }
    };

    const sendConfig = (objData, sendPM) => {
      this.setLoading(true);
      this.api.putPaymentConfig(objData).then((res) => {
        if (sendPM) {
          sendPaymentMethods();
        } else {
          this.props.showMainModal(locales_es.successModal.title, res.message);
          this.setLoading(false);
        }
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        this.setLoading(false);
      });
    };

    const sendPaymentMethods = () => {
      this.setLoading(true);

      this.api.putBankTransferData({data: this.state.bankTransferData}).then(() => {
        this.api.putPaymentMethods({payment_methods: this.state.currentPaymentMethods}).then(res => {
          this.props.showMainModal(locales_es.successModal.title, res.message);
          this.load();
          this.setLoading(false);
        })
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        this.setLoading(false);
      });
    };

    const onClickCheckbox = (e, pm) => {
      if (!enableBeforePayment) {
        e.preventDefault();
      }
      if (pm.tag === PAYMENT_METHOD_MERCADO_PAGO && !mercadoPagoEnabled) {
        this.props.showMainModal(locales_es.infoModal.title, 'Debe vincular primero una cuenta Mercado Pago para poder usar este medio de cobro');
        return;
      }

      const paymentMethods = JSON.parse(JSON.stringify(this.state.currentPaymentMethods));
      // console.log('paymentMethods:');
      // console.log(paymentMethods);
      const index = this.PMIndexInArray(pm.id);
      if (index >= 0) {
        paymentMethods.splice(index, 1);
        this.setState({
          currentPaymentMethods: paymentMethods
        })
      } else {
        paymentMethods.push(pm.id);
        this.setState({
          currentPaymentMethods: paymentMethods
        })
      }
    };

    const onClickLinkMercadoPago = () => {
      this.api.getMercadoPagoAuthorizationLink(window.location.origin).then(res => {
        window.location.href = res.data.url;
        // window.open(res.data.url, '_blank');
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
    };

    const onClickUnlinkMercadoPago = () => {
      this.props.showMainModal('Desvincular cuenta de Mercado Pago', '¿Está seguro de desvincular su cuenta de Mercado Pago?', null, [
        {
          label: 'Sí, desvincular',
          class: 'btn btn-danger btn-elevate btn-pill btn-sm',
          method: () => {
            this.api.deleteMercadoPagoAuthorization().then(res => {
              this.props.showMainModal(locales_es.successModal.title, res.message);
              this.setState({
                mercadoPagoEnabled: false
              })
            }).catch(err => {
              this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            })
          }
        },
        {
          label: 'No, no desvincular',
          class: 'btn btn-primary btn-elevate btn-pill btn-sm'
        }
      ]);
    };

    const onChangeAmountTypeConfig = (amountType) => {
      this.setState({
        beforePaymentType: amountType
      })
    };

    const onChangeBeforePaymentAmount = (amount) => {
      this.setState({
        beforePaymentAmount: amount
      })
    };

    const onBlurBankTransferTextarea = (pmId) => {
      if (this.PMIndexInArray(pmId) >= 0 && !this.state.bankTransferData) {
        this.props.showMainModal(locales_es.infoModal.title, 'Debes completar la información adicional en el campo de texto para activar el cobro mediante Transferencia Bancaria.');
      }
    };

    return (
      <div className="kt-portlet kt-portlet--height-fluid kt-widget-17">
        {loading ? <Loading/> : null}
        <div className="row">
          <div className="col-12">

            <div className="kt-portlet kt-portlet--height-fluid kt-portlet--tabs">
              <div className="kt-portlet__head">
                <div className="kt-portlet__head-label">
                  <h3 className="kt-portlet__head-title">
                    {locales_es.settings}
                  </h3>
                </div>
                <div className="kt-portlet__head-toolbar">
                  <ul className="nav nav-tabs nav-tabs-line nav-tabs-line-brand nav-tabs-bold"
                      role="tablist">
                    <li className="nav-item">
                      <a className="nav-link show active" data-toggle="tab"
                         href="#kt_portlet_tabs_1_1_content" role="tab" aria-selected="true">
                        {locales_es.gatewayMethods}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="kt-portlet__body">
                <div className="tab-content">
                  <div className="tab-pane fade active show" id="kt_portlet_tabs_1_1_content" role="tabpanel">
                    {userData === null ? <Spinner/> :
                      userData ?
                        <>
                          <div className="row mt-3">
                            <div className="col">
                              <label className="kt-checkbox">
                                <input type="checkbox" id="enable-before-payment"
                                       onChange={onChangeEnableBeforePayment}
                                       checked={enableBeforePayment}/>
                                <span></span> Habilitar cobro online
                              </label>
                            </div>
                          </div>
                          {paymentMethods === null ?
                            <Spinner/>
                            : paymentMethods && paymentMethods.length ?
                              paymentMethods.map(pm =>
                                <div key={pm.id}
                                     className={`row mt-3 ml-3 border-top ${enableBeforePayment ? '' : 'disabled'}`}>
                                  <div className="col">
                                    <label className="kt-checkbox">
                                      <input type="checkbox" id={pm.id}
                                             onChange={(e) => onClickCheckbox(e, pm)}
                                             checked={this.PMIndexInArray(pm.id) >= 0}
                                             disabled={enableBeforePayment && pm.tag === PAYMENT_METHOD_MERCADO_PAGO ? !mercadoPagoEnabled : false}/>
                                      <span></span>{locales_es.gatewayMethodsList[pm.tag]['label_' + userData.user_type]}
                                    </label>
                                    {pm.tag === PAYMENT_METHOD_BANK_TRANSFER && this.PMIndexInArray(pm.id) >= 0 ?
                                      <>
                                        <br/>
                                        <label className="float-right m-2">Información para la transferencia ({locales_es.required})</label>
                                        <textarea className="form-control"
                                                  onChange={(e) => this.setState({
                                                    bankTransferData: e.target.value
                                                  })}
                                                  onBlur={() => onBlurBankTransferTextarea(pm.id)}
                                                  placeholder="Escribe aquí toda la información necesaria para que el paciente pueda realizar la transferencia correctamente">{this.state.bankTransferData}</textarea>
                                      </>
                                      : null}
                                    {pm.tag === PAYMENT_METHOD_MERCADO_PAGO ?
                                      mercadoPagoEnabled === null ? <Spinner/>
                                        :
                                        <>
                                          {mercadoPagoEnabled ? <button type="button"
                                                                        onClick={onClickUnlinkMercadoPago}
                                                                        className="btn btn-danger btn-elevate btn-pill btn-sm m-sm-3 m-lg-0 ml-lg-3">Desvincular
                                              Cuenta</button>
                                            : <button type="button"
                                                      onClick={onClickLinkMercadoPago}
                                                      className="btn btn-info btn-elevate btn-pill btn-sm m-sm-3 m-lg-0 ml-lg-3">Vincular
                                              Cuenta de Mercado Pago</button>
                                          }
                                        </>
                                      : null
                                    }
                                  </div>
                                </div>
                              )
                              :
                              <div className="row">
                                <div className="col">
                                  <h6 className="text-center">No hay métodos de pago habilitados</h6>
                                </div>
                              </div>
                          }

                          {amountTypes === null ? <Spinner/> :
                            enableBeforePayment &&
                            <AmountTypeConfig amountTypes={amountTypes}
                                              currentAmountType={currentAmountType}
                                              currentAmount={currentAmount}
                                              onChangeBeforePaymentAmount={onChangeBeforePaymentAmount}
                                              onChangeAmountTypeConfig={onChangeAmountTypeConfig}
                            />
                          }

                        </>
                        : null
                    }

                    <div className="kt-portlet__foot kt-portlet__foot--md">
                      <div className="kt-widget-17__foot">
                        <div className="kt-widget-17__foot-info"></div>
                        <div className="kt-widget-17__foot-toolbar">
                          <a href="#" onClick={save}
                             className="btn btn-brand btn-sm btn-upper btn-bold">{locales_es.save}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {result && (result === STATUS_SUCCESS || result === STATUS_FAILED) ?
          <ModalAnimationResult
            acceptAction={() => this.setState({result: null})}
            result={result}
            titleSuccess={'¡Tu cuenta ha sido vinculada con éxito!'}
            titleFailed={'Ha ocurrido un error al vincular tu cuenta'}
          />
          : null
        }
      </div>

    )
  }
}
