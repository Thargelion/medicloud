import React, {Component} from 'react';
import locales_es from "../../locales/es";
import Spinner from "../spinner";
import {PAYMENT_METHOD_AMOUNT_TYPE_FIXED, PAYMENT_METHOD_AMOUNT_TYPE_PERCENT} from "../../models/constants";

export default class BankTransferData extends Component {

  render() {
    const {bankTransferData, onClickCancel, onClickAcceptAction, medic, event} = this.props;
    return (
      <>
        <div className="woopi-overlay">
          {bankTransferData === true ? <Spinner /> :
            <div className="woopi-overlay-content">
              <div className="row justify-content-center">
                <div className="col-lg-9 text-center">
                  <span className="btn btn-focus btn-elevate btn-circle btn-icon mr-3">
                    <i className="flaticon-piggy-bank"></i>
                  </span>
                  <h4 className="m-2">{locales_es.bankTransferDataModal.title}</h4>
                  <div className="kt-timeline__item-text">
                    <strong>{locales_es.bankTransferDataModal.subtitle}</strong>.
                    <br />
                    <br />
                    <div>
                      {bankTransferData.data}
                    </div>
                    <div className="m-2">
                    {medic.before_payment_type === PAYMENT_METHOD_AMOUNT_TYPE_FIXED ?
                    `Debes transferir $${event.before_payment_amount}, en concepto de seña o pago parcial o total del turno.` : ''}
                    {medic.before_payment_type === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT ?
                      `Debes transferir $${event.before_payment_amount}, que es el ${medic.before_payment_amount}% del valor del turno, en concepto de seña o pago parcial o total del turno.` : ''}
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
          }

        </div>
      </>
    )
  }
}
