import React, {Component} from 'react';
import locales_es from "./../../locales/es";
import {
  DEFAULT_SLUGNAME,
  HREF_PAGE_CHANGE_PASSWORD, HREF_PAGE_MEDIC, HREF_PAGE_MY_MEDIC_PROFILE,
  HREF_PAGE_MY_PROFILE,
  USER_TYPE_MEDIC,
  USER_TYPE_PATIENT
} from "../../models/constants";
import AvatarImage from "../avatarImage";
import AuthService from "../../modules/authService";
import Modal from "../modal";
import "./index.css";

export default class UserProfile extends Component {

  constructor(props) {
    super(props);
    this.auth = new AuthService();

    this.state = {
      profileLink: null,
      modal: false,
    };
  }

  componentWillMount() {
    this.load();
  }

  componentDidMount() {
    document.addEventListener('showShareLink', () => this.shareLink());
  }

  load() {
    this.auth.getRemoteUserData().then(res => {
      if (res.data && res.data.user) {
        const userData = res.data.user;
        const profileLink = `${window.location.origin}${userData.slugname && userData.slugname !== DEFAULT_SLUGNAME ? ('/' + userData.slugname) : (HREF_PAGE_MEDIC + '/' + userData.id)}`;
        this.setState({
          profileLink
        });
      }
    });
  }

  shareLink() {
    this.setState({
      modal: true,
    }, () => {
      window.initPopovers();
    })
  }

  render() {
    const {userData} = this.props;
    const {modal, profileLink} = this.state;
    return (
      <>
        <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel" ref={elem => this.nav = elem}>
          <div className="kt-offcanvas-panel__head">
            <h3 className="kt-offcanvas-panel__title">
              {locales_es.myProfile}
            </h3>
            <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close">
              <i className="flaticon2-delete"/></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll ps ps--active-y">
            <div className="kt-user-card-v3 kt-margin-b-30">
              <div className="kt-user-card-v3__avatar">
                <AvatarImage profileImage={userData.full_profile_image} enableUpload={true}/>
              </div>
              <div className="kt-user-card-v3__detalis">
                <a className="kt-user-card-v3__name">
                  {userData.name} {userData.lastname}
                </a>
                <div className="kt-user-card-v3__desc">
                  {locales_es.user_type[userData.user_type]}
                </div>
                <div className="kt-user-card-v3__info">
                  <a className="kt-user-card-v3__item">
                    <i className="flaticon-email-black-circular-button kt-font-brand"/>
                    <span className="kt-user-card-v3__tag">{userData.email}</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="kt-margin-t-40">
              {userData.user_type === USER_TYPE_PATIENT &&
              <a href={HREF_PAGE_MY_PROFILE} type="button" className="btn btn-info btn-font-sm btn-upper btn-bold m-1">
                {locales_es.editProfile}
              </a>
              }
              {userData.user_type === USER_TYPE_MEDIC &&
              <>
                <div>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    this.shareLink();
                  }} type="button" className="btn btn-secondary btn-upper btn-bold m-1"><i
                    className="fa fa-share-alt"></i> Mi perfil médico</a>
                </div>
                <a href={HREF_PAGE_MY_MEDIC_PROFILE} type="button"
                   className="btn btn-info btn-font-sm btn-upper btn-bold m-1">
                  {locales_es.editProfile}
                </a>
              </>
              }
              <a href={HREF_PAGE_CHANGE_PASSWORD} type="button"
                 className="btn btn-warning btn-font-sm btn-upper btn-bold m-1">
                {locales_es.changePassword}
              </a>
              <button onClick={() => this.props.showLogoutModal()} type="button"
                      className="btn btn-danger btn-font-sm btn-upper btn-bold m-1">
                {locales_es.logout}
              </button>
            </div>
          </div>
        </div>
        {modal &&
        <Modal modalId="shareProfileLink"
               title={locales_es.shareLinkTitle}
               visible={modal}
               actions={[
                 {
                   className: 'btn btn-brand btn-elevate btn-pill m-3 align-self-start',
                   title: locales_es.accept,
                   onClick: () => {
                     this.setState({
                       modal: false
                     })
                   }
                 }
               ]}
        >
          <p>{locales_es.shareLinkDescription}</p>
          <div className="text-center kt-section__content kt-section__content--border">
            <a data-toggle="popover" title=""
               data-placement="top"
               data-content="Comparte ese link con tus pacientes"
               data-original-title="Copiado al portapapeles" aria-describedby="popover951328"
               href="#" onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(profileLink);
              window.initPopovers();
            }} className="btn btn-outline-hover-info btn-elevate btn-pill allow-user-select">{profileLink}</a>
            <p className="mt-3"><small>Puede configurar un link más personalizado ajustando el nombre de tu cuenta desde <a href={HREF_PAGE_MY_MEDIC_PROFILE}>tu perfil</a></small></p>
          </div>
        </Modal>
        }
      </>
    )
  }
}
