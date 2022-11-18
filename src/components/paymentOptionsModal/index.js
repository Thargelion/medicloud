import React, {Component} from 'react';
import Spinner from "../spinner";
import locales_es from "../../locales/es";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import AppointmentScheduled from "../appointmentScheduled";
import BankTransferData from "../bankTransferData";
import MercadoPagoData from "../mercadoPagoData";

export default class PaymentOptionsModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      paymentMethods: null,
      bankTransferData: null,
      mercadoPagoData: null,
    };

    this.api = new APIService();
    this.helpers = new Helpers();
  }

  componentDidMount() {
    if (this.props.medicId) {
      this.loadPaymentInfo()
    } else {
      this.setState({
        paymentMethods: false, // termina mostrando error al usuario...
      })
    }
  }

  loadPaymentInfo() {
    if (this.props.medicId) {
      this.api.getPaymentMethods(this.props.medicId).then(res => {
        this.setState({
          paymentMethods: res.data
        }, () => this.loadMedicData())
      }).catch(err => {
        this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
      })
    } else {
      this.setState({
        paymentMethods: false, // termina mostrando error al usuario...
      })
    }
  }

  loadMedicData() {
    this.api.getMedicById(this.props.medicId).then(res => {
      this.setState({
        medic: res.data
      })
    }).catch(err => {
      this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
    })
  }

  render() {

    const {paymentMethods, medic, bankTransferData, mercadoPagoData} = this.state;

    const {acceptAction, event} = this.props;

    const onBankTransferClick = () => {
      this.setState({
        bankTransferData: true
      }, () => {
        this.api.getBankTransfer(this.state.medic.id).then(res => {
          this.setState({
            bankTransferData: res.data
          })
        }).catch(err => {
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
      })
    };

    const onBankTransferClickCancel = () => {
      this.setState({
        bankTransferData: false,
      })
    };

    const onMercadoPagoClick = () => {
      this.setState({
        mercadoPagoData: true
      }, () => {
        this.api.getBankTransfer(this.state.medic.id).then(res => {
          this.setState({
            mercadoPagoData: res.data
          })
        }).catch(err => {
          this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
      })
    };

    const onMercadoPagoClickCancel = () => {
      this.setState({
        mercadoPagoData: false,
      })
    };

    const onAcceptMercadoPago = () => {
      window.location.href = this.props.event.payment_url;
      // window.initMPCheckout(this.state.event.payment_url.split('?pref_id=')[1]);
    };

    return (
      paymentMethods === null && !medic ? <Spinner/>
        : paymentMethods && paymentMethods.length && medic ?
        <>
          <AppointmentScheduled
            paymentMethods={paymentMethods}
            onContinue={() => acceptAction && acceptAction()}
            medic={medic}
            showMainModal={this.props.showMainModal}
            onBankTransferClick={onBankTransferClick}
            onMercadoPagoClick={onMercadoPagoClick}
          />

          {bankTransferData &&
          <BankTransferData bankTransferData={bankTransferData} onClickCancel={onBankTransferClickCancel}
                            medic={medic}
                            event={event}
                            onClickAcceptAction={() => acceptAction && acceptAction()}/>}

          {mercadoPagoData &&
          <MercadoPagoData mercadoPagoData={mercadoPagoData} onClickCancel={onMercadoPagoClickCancel}
                           medic={medic}
                           event={event}
                           onClickAcceptAction={onAcceptMercadoPago}/>}

        </>
        : null
    )
  }
}
