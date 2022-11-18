import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {PAYMENT_METHOD_AMOUNT_TYPE_FIXED, PAYMENT_METHOD_AMOUNT_TYPE_PERCENT} from "../../models/constants";

export default class MercadoPagoData extends Component {

  render() {
    const {onClickCancel, onClickAcceptAction, medic, event} = this.props;
    return (
      <>
        <div className="woopi-overlay">
          <div className="woopi-overlay-content">
            <div className="row justify-content-center">
              <div className="col-lg-9 text-center">
                <h4 className="m-4">{locales_es.mercadoPagoDataModal.title}</h4>
                <div className="kt-timeline__item-text">
                  <br/><strong>{locales_es.mercadoPagoDataModal.subtitle}</strong>.
                  <br/>
                  <br/>
                  <div className="m-2">
                    {medic.before_payment_type === PAYMENT_METHOD_AMOUNT_TYPE_FIXED ?
                      `Debes pagar $${event.before_payment_amount}, en concepto de seña o pago parcial o total del turno.` : ''}
                    {medic.before_payment_type === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT ?
                      `Debes pagar $${event.before_payment_amount}, que es el ${medic.before_payment_amount}% del valor del turno, en concepto de seña o pago parcial o total del turno.` : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="row justify-content-center mt-3">
              <div className="col text-center">
                <button type="button" className={'btn btn-elevate btn-pill m-1 btn-success'}
                        onClick={onClickAcceptAction}
                >{locales_es.continue}
                </button>
              </div>
              <div className="col text-center">
                <button type="button" className={'btn btn-elevate btn-pill m-1 btn-danger'}
                        onClick={onClickCancel}
                >{locales_es.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
