import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {HREF_REGISTER, hrefLogin} from "../../models/constants";
import Helpers from "../../modules/helpers";
import APIService from "../../modules/apiService";
import ConfigService from "../../modules/configService";

export default class AuthHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoggedIn: false,
            userData: {},
            fullModal: null,
            venueLogo: '',
            venueName: '',
        };

        this.helpers = new Helpers();
        this.api = new APIService();
        this.configService = new ConfigService();
    }

    componentDidMount() {
        this.setClinic();
    }

    setClinic() {
        this.configService.getLocalClinicData().then(res => {
            this.setState({
                venueLogo: res['full_image'],
                venueName: res['name'],
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

    render() {
        const {venueName, venueLogo} = this.state;
        return (
            <div className="kt-grid__item  kt-grid--hor">

                <div className="kt-login-v2__head">
                    <div className="kt-login-v2__logo">
                        <a href="/">
                            <img alt={venueName} src={venueLogo} style={{width: '100%'}} />
                        </a>
                    </div>
                    {this.props.register ?
                        <div className="kt-login-v2__signup">
                            <span>{locales_es.dontYouHaveAnAccount}</span>
                            <a href={this.props.redirect ? `${HREF_REGISTER}?redirect=${this.props.redirect}` : HREF_REGISTER}
                               className="kt-link kt-font-brand">{locales_es.register.button}</a>
                        </div>
                        :
                        <div className="kt-login-v2__signup">
                            <span>{locales_es.already_registered}</span>
                            <a href={this.props.redirect ? `${hrefLogin}?redirect=${this.props.redirect}` : hrefLogin}
                               className="kt-link kt-font-brand">{locales_es.loginYourself}</a>
                        </div>
                    }
                </div>

            </div>
        )
    }

}
