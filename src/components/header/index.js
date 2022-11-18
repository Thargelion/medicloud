import React, {Component} from 'react';
import Rodal from 'rodal';

import ProfileImageDefault from './../../images/profile_image_default.jpg';
import AuthService from "../../modules/authService";
import {
    headerNavId,
    HREF_PAGE_DASHBOARD,
    HREF_PAGE_HOME,
    HREF_PAGE_MEDIC,
    HREF_PAGE_MY_MEDICS,
    HREF_PAGE_PATIENTS,
    HREF_PAGE_SETTINGS,
    hrefLogin,
    IMAGE_LOGO,
    setNavLinksEvent,
    USER_TYPE_MEDIC,
    USER_TYPE_PATIENT,
    USER_TYPE_SECRETARY,
} from "../../models/constants";
import locales_es from "./../../locales/es";
import Helpers from "../../modules/helpers";


import APIService from "../../modules/apiService";
import UserProfile from "../userProfile";
import ConfigService from "../../modules/configService";
import Spinner from "../spinner";

export default class Header extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoggedIn: false,
            userData: {},
            fullModal: null,
            venueLogo: null,
            venueName: null,
        };

        this.auth = new AuthService();
        this.helpers = new Helpers();
        this.api = new APIService();
        this.configService = new ConfigService();
    }

    componentDidMount() {
        // When the component is mounted, add your DOM listener to the "nv" elem.
        // (The "nv" elem is assigned in the render function.)
        this.nav.addEventListener(setNavLinksEvent, () => {
            this.checkUserStatus();
        });
        this.checkUserStatus();


        const isLoggedIn = this.auth.isLoggedUser();
        this.setState({
            isLoggedIn
        }, this.setMenu);

        // this.setMenu();
        this.setClinic();
    }

    setClinic() {
        this.configService.getLocalClinicData().then(res => {
            this.setState({
                venueLogo: res['full_image'] || '',
                venueName: res['name'] || locales_es.appName,
            }, () => this.setHTMLTitle());
        }).catch(err => {
            console.log(err);
        });
    }

    setHTMLTitle() {
        const title = document.getElementById('html-title');
        if (title) {
            title.innerHTML = this.state.venueName;
        }
    }

    checkUserStatus() {
        this.auth.checkLoginStatusAndDoSomethingOrDefault(this.handleLoginHeader, this.handleLogoutHeader);
    }

    // Use a class arrow function (ES7) for the handler. In ES6 you could bind()
    // a handler in the constructor.
    handleLoginHeader = () => {
        this.setState({isLoggedIn: true}, () => this.setMenu());
    };

    handleLogoutHeader = () => {
        this.setState({isLoggedIn: false}, () => this.setMenu());
    };

    setMenu() {
        if (this.state.isLoggedIn) {
            this.auth.getRemoteUserData().then(res => {
                if (res && res.data && res.data.user) {
                    this.setState({
                        userData: res.data.user,
                    }, () => {
                        window.initProfile();
                    })
                }
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                window.initProfile();
            });
        }
    }

    showLogoutModal() {
        this.showModal(locales_es.logoutModal.title, locales_es.logoutModal.subtitle);
    }

    logout() {
        this.auth.logout(true);
        this.hide();
        // this.toggleMenu();
    }

    /* MODAL Functions */
    showModal(title, content) {
        this.setState({modalTitle: title});
        this.setState({modalContent: content});
        this.show();
    }

    show() {
        this.setState({visible: true});
    }

    hide() {
        this.setState({visible: false});
    }

    //

    goToLogin(e) {
        e.preventDefault();
        const medicPageRegex = new RegExp(HREF_PAGE_MEDIC);
        if (medicPageRegex.test(window.location.pathname)) {
            window.location.href = `${hrefLogin}?redirect=${window.location.pathname}`;
            return;
        }
        window.location.href = hrefLogin;
    }

    renderLogo() {
        return (
          this.state.venueLogo || this.state.venueName
            ? <img alt={this.state.venueName} src={this.state.venueLogo || IMAGE_LOGO} />
            : <Spinner />
        )
    }

    render() {

        const {isLoggedIn, userData} = this.state;

        return (
            <div id={headerNavId} ref={elem => this.nav = elem}
                 className="mdl-js-layout mdl-layout--fixed-header has-drawer is-upgraded is-small-screen"
                 style={{marginBottom: '30px'}}>

                {/*mobile header*/}
                <div id="kt_header_mobile" className="kt-header-mobile  kt-header-mobile--fixed ">
                    <div className="kt-header-mobile__logo">
                        <a href="index.html">
                            {this.renderLogo()}
                        </a>
                    </div>
                    <div className="kt-header-mobile__toolbar">
                        {isLoggedIn &&
                        <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler">
                            <span /></button>
                        }
                        <button className="kt-header-mobile__toolbar-topbar-toggler"
                                id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button>
                    </div>
                </div>

                {/*desktop header*/}
                <div id="kt_header" className="kt-header kt-grid__item kt-grid kt-grid--ver  kt-header--fixed ">

                    <div className="kt-header__brand   kt-grid__item" id="kt_header_brand">
                        <a href="/">
                            {this.renderLogo()}
                        </a>
                    </div>


                    <button className="kt-header-menu-wrapper-close" id="kt_header_menu_mobile_close_btn"><i
                        className="la la-close" /></button>
                    <div className="kt-header-menu-wrapper kt-grid__item"
                         id="kt_header_menu_wrapper">
                        <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile ">
                            <ul className="kt-menu__nav ">
                                <li className="kt-menu__item">
                                    <a onClick={() => {
                                        window.toggleMobileMenu();
                                        window.location.href = HREF_PAGE_DASHBOARD;
                                    }} className="kt-menu__link">
                                        <span className="kt-menu__link-text">{userData.user_type === USER_TYPE_PATIENT ? locales_es.myAppointments : locales_es.dashboard}</span>
                                    </a>
                                </li>
                                {userData.user_type === USER_TYPE_SECRETARY &&
                                    <li className="kt-menu__item">
                                        <a onClick={() =>{
                                            window.toggleMobileMenu();
                                            window.location.href = HREF_PAGE_HOME;
                                        }} className="kt-menu__link">
                                            <span className="kt-menu__link-text">{locales_es.medics}</span>
                                        </a>
                                    </li>
                                }
                                {userData.user_type === USER_TYPE_PATIENT &&
                                <li className="kt-menu__item">
                                    <a onClick={() =>{
                                        window.toggleMobileMenu();
                                        window.location.href = HREF_PAGE_MY_MEDICS;
                                    }} className="kt-menu__link">
                                        <span className="kt-menu__link-text">{locales_es.myMedics}</span>
                                    </a>
                                </li>
                                }
                                {(userData.user_type === USER_TYPE_SECRETARY || userData.user_type === USER_TYPE_MEDIC) &&
                                <li className="kt-menu__item">
                                    <a onClick={() =>{
                                        window.toggleMobileMenu();
                                        window.location.href = HREF_PAGE_PATIENTS;
                                    }} className="kt-menu__link">
                                        <span className="kt-menu__link-text">{userData.user_type === USER_TYPE_SECRETARY ? locales_es.patients : locales_es.myPatients}</span>
                                    </a>
                                </li>
                                }
                            </ul>
                        </div>
                    </div>

                    <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">

                        {isLoggedIn ?
                            <>
                                {userData.user_type === USER_TYPE_MEDIC && <div className="kt-header__topbar-item">
                                    <div className="kt-header__topbar-wrapper"
                                         id="kt_offcanvas_toolbar_quick_actions_toggler_btn">
                                        <a href={HREF_PAGE_SETTINGS} className="kt-header__topbar-icon" title={locales_es.settings}><i className="flaticon2-settings" /></a>
                                    </div>
                                </div>}
                                <div className="kt-header__topbar-item kt-header__topbar-item--user"
                                     id="kt_offcanvas_toolbar_profile_toggler_btn">
                                    <div className="kt-header__topbar-welcome">
                                        {locales_es.hello},
                                    </div>
                                    <div className="kt-header__topbar-username">
                                        {userData.name}
                                    </div>
                                    <div className="kt-header__topbar-wrapper">
                                        <img alt="" src={userData.full_profile_image || ProfileImageDefault} />
                                    </div>
                                </div>
                            </>
                            :
                            <a onClick={(e) => this.goToLogin(e)} href={hrefLogin} className="kt-header__topbar-item kt-header__topbar-item--user">
                                <div className="kt-header__topbar-username">
                                    {locales_es.login}
                                </div>
                            </a>
                        }
                    </div>

                </div>

                {isLoggedIn && <UserProfile userData={userData} showLogoutModal={() => this.showLogoutModal()} />}

                <Rodal width={window.screen && window.screen.availWidth ? window.screen.availWidth * 0.9 : '300'}
                       customStyles={this.state.fullModal ? {height: '90%', overflow: 'scroll', zIndex: 9000} : {}}
                       visible={this.state.visible} onClose={() => this.hide()}>
                    <div>
                        <h4 className="rodal-title">{this.state.modalTitle}</h4>
                        <div className="rodal-body">{this.state.modalContent}</div>
                        <div className="rodal-footer">
                            <button className="btn btn-primary" type="button"
                                    onClick={() => this.logout()}>Aceptar
                            </button>
                            <button className="btn btn-alert" type="button"
                                    onClick={() => this.hide()}>Cancelar
                            </button>
                        </div>
                    </div>
                </Rodal>
            </div>
        )
    }
}
