import React, {Component} from 'react';
import {PAYMENT_METHOD_AMOUNT_TYPE_FIXED, PAYMENT_METHOD_AMOUNT_TYPE_PERCENT} from "../../models/constants";

export default class AmountTypeConfig extends Component {

  constructor(props) {
    super(props);
    this.state = {
      _currentAmountType: this.props.currentAmountType
    }
  }

  componentDidMount() {
    if (this.props.currentAmount) {
      if (this.state._currentAmountType === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT) {
        this.setState({[PAYMENT_METHOD_AMOUNT_TYPE_PERCENT]: this.props.currentAmount})
      }
      if (this.state._currentAmountType === PAYMENT_METHOD_AMOUNT_TYPE_FIXED) {
        this.setState({[PAYMENT_METHOD_AMOUNT_TYPE_FIXED]: this.props.currentAmount})
      }
    }
  }

  _onChangeAmountTypeConfig(amountType) {
    this.setState({
      [PAYMENT_METHOD_AMOUNT_TYPE_PERCENT]: '',
      [PAYMENT_METHOD_AMOUNT_TYPE_FIXED]: '',
    }, () => {
      this.setState({
        _currentAmountType: amountType.id,
        [amountType.id]: this.props.currentAmount || 0,
      }, this.props.onChangeAmountTypeConfig && this.props.onChangeAmountTypeConfig(amountType.id))
    })
  }


  render() {
    const {amountTypes, onChangeBeforePaymentAmount} = this.props;

    return (
      amountTypes && amountTypes.length ?
        <div className="m-5 border-top">
          <div className="row">
            <div className="col mb-3">
              <strong>¿Cuánto cobrar?</strong>
            </div>
          </div>
          <div className="row kt-section">
            <div className="list-group">

              {amountTypes.map(type => {
                  if (type.id === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT) {
                    const conditionState = this.state._currentAmountType === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT;
                    const conditionProp = this.props.currentAmountType === PAYMENT_METHOD_AMOUNT_TYPE_PERCENT;
                    return (
                      <label
                        onClick={() => this._onChangeAmountTypeConfig(type)}
                        key={type.id}
                        className={`list-group-item list-group-item-action flex-column align-items-start cursor-pointer ${conditionState ? 'active' : ''}`}>
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">{type.name}</h5>
                          {conditionProp && <small>Activo</small>}
                        </div>
                        <p className="mb-1">Cobra una porción del valor del turno como seña o adelanto para considerar el
                          turno como Confirmado.</p>
                        <small className="text-muted">Puedes configurar este valor en 100% para cobrar la totalidad del
                          turno.</small>
                        <br/>
                        <small className="text-muted">Recuerda que aplica para turnos con precios configurados y mayores a
                          $0.</small>
                        <br/>
                        <small className="text-muted">El turno se pasa a "Confirmado" de forma automática cuando el cobro
                          es a través de Mercado Pago.</small>
                        <div className="form-group row mt-3">
                          <label htmlFor="example-number-input" className="col-auto col-form-label">%</label>
                          <div className="col-auto">
                            <input className="form-control" type="number"
                                   value={this.state[PAYMENT_METHOD_AMOUNT_TYPE_PERCENT]} id="example-number-input"
                                   min={1}
                                   max={100} step={1} disabled={!conditionState}
                                   onChange={(e) => {
                                     this.setState({[PAYMENT_METHOD_AMOUNT_TYPE_PERCENT]: e.target.value}, () => onChangeBeforePaymentAmount && onChangeBeforePaymentAmount(this.state[PAYMENT_METHOD_AMOUNT_TYPE_PERCENT]))
                                   }}/>
                          </div>
                        </div>
                      </label>
                    )
                  }
                  if (type.id === PAYMENT_METHOD_AMOUNT_TYPE_FIXED) {
                    const conditionState = this.state._currentAmountType === PAYMENT_METHOD_AMOUNT_TYPE_FIXED;
                    const conditionProp = this.props.currentAmountType === PAYMENT_METHOD_AMOUNT_TYPE_FIXED;
                    return (
                      <label
                        onClick={() => this._onChangeAmountTypeConfig(type)}
                        key={type.id}
                        className={`list-group-item list-group-item-action flex-column align-items-start cursor-pointer ${conditionState ? 'active' : ''}`}>
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">{type.name}</h5>
                          {conditionProp && <small>Activo</small>}
                        </div>
                        <p className="mb-1">Ajusta el porcentaje del valor del turno que quieres cobrar.</p>
                        <small>Recuerda que aplica para turnos con precios configurados y mayores a $0.</small>
                        <div className="form-group row mt-3">
                          <label htmlFor="example-number-input" className="col-auto col-form-label">$</label>
                          <div className="col-auto">
                            <input className="form-control" type="number" id="example-number-input"
                                   value={this.state[PAYMENT_METHOD_AMOUNT_TYPE_FIXED]}
                                   disabled={!conditionState}
                                   onChange={(e) => {
                                     this.setState({[PAYMENT_METHOD_AMOUNT_TYPE_FIXED]: e.target.value}, () => onChangeBeforePaymentAmount && onChangeBeforePaymentAmount(this.state[PAYMENT_METHOD_AMOUNT_TYPE_FIXED]))
                                   }}/>
                          </div>
                        </div>
                      </label>
                    )
                  }
                }
              )}
            </div>
          </div>
        </div>
        : null
    )
  }
}
