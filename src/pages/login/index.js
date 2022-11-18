import React, {Component} from 'react';
import Form from "./../../components/form";
import locales_es from "../../locales/es";
import {hrefDashboard, hrefRecovery} from "../../models/constants";
import AuthService from "../../modules/authService";
import Loading from "./../../components/loading";
import bgIcon from "./../../images/bg_icon.svg";
import AuthHeader from "../../components/authHeader";
import ConfigService from "../../modules/configService";

export default class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      email: '',
      clinicId: null,
      password: '',
      redirect: window.URLSearchParams
        ? new window.URLSearchParams(this.props.location.search).get("redirect") : null,
    };

    this.auth = new AuthService();
    this.configService = new ConfigService();
  }

  componentWillMount() {
    this.checkUserStatus();
  }

  componentDidMount() {
    this.configService.getLocalClinicData().then(clinic => {
      this.setState({
        clinicId: clinic.id || null
      })
    }).catch(err => {
      console.log(err)
    });
  }

  async checkUserStatus() {
    const isLoggedIn = await this.auth.isLoggedUser();
    if (isLoggedIn) {
      this.successLoginRedirect();
    } else {
      const regex = /cancelAppointment/;
      if (regex.test(this.state.redirect)) {
        this.props.showMainModal(locales_es.infoModal.title, "Debes iniciar sesión para cancelar el turno");
      }
    }
  }

  handleChange = state => ev => {
    this.setState({[state]: ev.target.value});
  };

  validateForm() {
    return !this.state.email || !this.state.password
      ? this.props.showMainModal('Error', 'Complete todos los campos del formulario')
      : true;
  }

  login() {
    if (this.validateForm()) {
      this.setLoading(true);
      // want to show the loading a little more the first time
      setTimeout(() => {
        this.auth.login(this.state.email, this.state.password, this.state.clinicId)
          .then(() => {
            this.successLoginRedirect();
            this.setLoading(false);
          }).catch(err => {
          console.log(err);
          this.props.showMainModal(locales_es.errorModal.title, err.message);
          this.setLoading(false);
        });
      }, 0);
    }
  }

  successLoginRedirect() {
    if (this.state.redirect) {
      window.location.href = this.state.redirect;
      return;
    }
    window.location.href = hrefDashboard;
    // this.props.history.replace(hrefDashboard);
  }

  setLoading(bool) {
    this.setState({
      loading: bool
    });
  }

  render() {

    const inputs = [
      {
        label: locales_es.email_address,
        placeholder: locales_es.email_address,
        id: '1',
        state: 'email',
        value: this.state.email,
        type: 'email',
        required: true
      },
      {
        label: locales_es.password,
        placeholder: locales_es.password,
        id: '2',
        state: 'password',
        value: this.state.password,
        type: 'password',
        required: true
      },
    ];

    return (
      <>
        {this.state.loading ? <Loading/> : ''}
        <AuthHeader register={true} redirect={this.state.redirect}/>
        <div className="kt-login-v2__body p-0">
          <div className="kt-login-v2__wrapper">
            <div className="kt-login-v2__container">
              <div className="kt-login-v2__title">
                <h3>{locales_es.login}</h3>
              </div>

              <Form
                style="kt-login-v2__form kt-form"
                inputs={inputs}
                handleChange={this.handleChange}
                onSubmit={() => this.login()}
                onSubmitButtonText={locales_es.login}
                secondaryButtonText={locales_es.forgotYourPassword}
                onClickSecondaryButton={() => {
                  window.location.href = hrefRecovery;
                }}
              />
            </div>
          </div>
          <div className="kt-login-v2__image d-none d-md-flex">
            <img src={bgIcon} alt=""/>
          </div>

        </div>


      </>
    )
  }
}
