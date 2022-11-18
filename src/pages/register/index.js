import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {HREF_REGISTER_MEDIC, HREF_REGISTER_PATIENT, hrefDashboard} from "../../models/constants";
import AuthService from "../../modules/authService";
import Loading from "./../../components/loading";
import AuthHeader from "../../components/authHeader";
import ConfigService from "../../modules/configService";

export default class RegisterPage extends Component {

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

    return (
      <>
        {this.state.loading ? <Loading/> : ''}
        <AuthHeader register={false} redirect={this.state.redirect}/>
        <div class="row mt-5 pt-5 mb-5 pb-5">
          <div class="col-lg-6">

            <div class="kt-portlet kt-portlet--solid-focus kt-portlet--height-fluid">
              <div class="kt-portlet__head">
                <div class="kt-portlet__head-label">
                  <span class="kt-portlet__head-icon"><i class="fa fa-user"></i></span>
                  <h3 class="kt-portlet__head-title">Médicos</h3>
                </div>
                <div class="kt-portlet__head-toolbar">
                  Usuario Médico
                </div>
              </div>
              <div class="kt-portlet__body">
                <div class="kt-portlet__head-title text-center display-3 m-3">
                  <i class="fa fa-user-md"></i>
                </div>
                <div class="kt-portlet__content">
                  Registrate como médico y empieza a gestionar todos tus turnos a través de nuestra plataforma de forma completamente gratuita.
                </div>
              </div>
              <div class="kt-portlet__foot kt-portlet__foot--sm kt-align-right">
                <a href={this.state.redirect ? `${HREF_REGISTER_MEDIC}?redirect=${this.state.redirect}` : `${HREF_REGISTER_MEDIC}`} className="btn btn-font-light btn-outline-hover-light">Registrarme cómo médico</a>
              </div>
            </div>

          </div>

          <div class="col-lg-6">

            <div class="kt-portlet kt-portlet--solid-info kt-portlet--height-fluid">
              <div class="kt-portlet__head">
                <div class="kt-portlet__head-label">
                  <span class="kt-portlet__head-icon"><i class="fa fa-user"></i></span>
                  <h3 class="kt-portlet__head-title">Pacientes</h3>
                </div>
                <div class="kt-portlet__head-toolbar">
                  Usuario Paciente
                </div>
              </div>
              <div class="kt-portlet__body">
                <div class="kt-portlet__head-title text-center display-3 m-3">
                  <i class="fa fa-user-injured"></i>
                </div>
                <div class="kt-portlet__content">
                  Si necesitas solicitar un turno con un médico dentro de MediCloud, necesitas registrate como paciente de la plataforma.
                </div>
              </div>
              <div class="kt-portlet__foot kt-portlet__foot--sm kt-align-right">
                <a href={this.state.redirect ? `${HREF_REGISTER_PATIENT}?redirect=${this.state.redirect}` : `${HREF_REGISTER_PATIENT}`} className="btn btn-font-light btn-elevate btn-outline-hover-light">Registrarme como paciente</a>
              </div>
            </div>

          </div>

        </div>


      </>
    )
  }
}
