import React, {Component} from "react";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import locales_es from "../../locales/es";
import Subheader from "../../components/subheader";
import {HREF_PAGE_CHANGE_PASSWORD} from "../../models/constants";
import Form from "../../components/form";
import Loading from "../../components/loading";
import AuthService from "../../modules/authService";

export default class ChangePassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        }

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        })
    }

    handleChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    validateForm() {
        return !this.state.old_password || !this.state.new_password || !this.state.new_password_confirmation
            ? this.props.showMainModal('Error', 'Complete todos los campos del formulario')
            : true;
    }

    send() {
        if (this.validateForm()) {
            this.setLoading(true);
            // want to show the loading a little more the first time
            setTimeout(() => {
                this.auth.updatePassword(this.state.old_password, this.state.new_password, this.state.new_password_confirmation)
                    .then(() => {
                        window.history.back();
                        this.setLoading(false);
                    }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, err.message);
                    this.setLoading(false);
                });
            }, 0);
        }
    }

    render() {

        const {loading} = this.state;

        const inputs = [
            {
                label: locales_es.oldPassword,
                placeholder: locales_es.oldPassword,
                id: 4,
                state: 'old_password',
                value: this.state.old_password,
                type: 'password',
                required: true,
                wrapperCustomClassName: 'form-group pl-md-0',
            },
            {
                label: locales_es.newPassword,
                placeholder: locales_es.newPassword,
                id: 5,
                state: 'new_password',
                value: this.state.new_password,
                type: 'password',
                required: true,
                wrapperCustomClassName: 'form-group pl-md-0',
                advice: locales_es.passwordValidation
            },
            {
                label: locales_es.repeatPassword,
                placeholder: locales_es.repeatPassword,
                id: 6,
                state: 'new_password_confirmation',
                value: this.state.new_password_confirmation,
                type: 'password',
                required: true,
                wrapperCustomClassName: 'form-group pr-md-0',
                advice: locales_es.passwordValidation
            },
        ]

        return(
            <>
                <Subheader breadcrumbs={[
                    {
                        name: locales_es.changePassword,
                        href: HREF_PAGE_CHANGE_PASSWORD
                    }
                ]}/>

                {loading && <Loading />}
                <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app">
                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content">
                        <div className="col-md-9 offset-md-2">
                            <div className="kt-portlet">
                                <Form
                                    styles="kt-form"
                                    inputs={inputs}
                                    handleChange={this.handleChange}
                                    onSubmit={() => this.send()}
                                    onSubmitButtonText={locales_es.save}
                                    wrapper={true}
                                >
                                    <div className="kt-portlet__head">
                                        <div className="kt-portlet__head-label">
                                            <h3 className="kt-portlet__head-title">{locales_es.myProfile}</h3>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

}
