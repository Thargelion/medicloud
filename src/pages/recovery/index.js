import React, {Component} from 'react';
import Form from "./../../components/form";
import locales_es from "../../locales/es";
import AuthService from "../../modules/authService";
import Loading from "./../../components/loading";
import AuthHeader from "../../components/authHeader";
import {hrefLogin} from "../../models/constants";
import bgIcon from "../../images/bg_icon.svg";


class RecoveryPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            email: '',
            password: '',
        };

        this.auth = new AuthService();
    }

    componentWillMount() {
        this.checkUserStatus();
    }

    async checkUserStatus() {
        const isLoggedIn = await this.auth.isLoggedUser();
        if (isLoggedIn) {
            this.successLoginRedirect();
        }
    }

    handleChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    validateForm() {
        return !this.state.email
            ? this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.completeWithYourRegisteredEmail)
            : true;
    }

    send() {
        if (this.validateForm()) {
            this.setLoading(true);
            this.auth.recovery(this.state.email)
                .then((res) => {
                    this.props.showMainModal(locales_es.successModal.title, res.message);
                    this.successLoginRedirect();
                    this.setLoading(false);
                }).catch(err => {
                console.log(err);
                this.props.showMainModal(locales_es.errorModal.title, err.message);
                this.setLoading(false);
            });
        }
    }

    successLoginRedirect() {
        this.props.modalMode && this.props.successMethod();
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
            }
        ];

        return (
            <>

                {this.state.loading ? <Loading/> : ''}

                <AuthHeader register={true}/>

                <div className="kt-login-v2__body">
                    <div className="kt-login-v2__wrapper">
                        <div className="kt-login-v2__container">
                            <div className="kt-login-v2__title">
                                <h3>{locales_es.recoveryPassword}</h3>
                            </div>
                            <Form
                                style="kt-login-v2__form kt-form"
                                inputs={inputs}
                                handleChange={this.handleChange}
                                onSubmit={() => this.send()}
                                onSubmitButtonText={locales_es.recovery}
                                secondaryButtonText={locales_es.doYouHaveAnAccountAlready}
                                onClickSecondaryButton={() => {
                                    window.location.href = hrefLogin;
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

export default RecoveryPage;
