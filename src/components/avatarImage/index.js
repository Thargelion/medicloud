import React, {Component} from 'react';
import locales_es from "./../../locales/es";
import ProfileImageDefault from './../../images/profile_image_default.jpg';
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import Rodal from "rodal";

export default class AvatarImage extends Component {

    constructor(props) {
        super(props);
        this.state = {

            // Initially, no file is selected
            selectedFile: null
        };

        this.api = new APIService();
        this.helpers = new Helpers();
    }

    // On file select (from the pop up)
    onFileChange = event => {

        // Update the state
        this.setState({ selectedFile: event.target.files[0] },
            () => {
            console.log(this.state.selectedFile);
            this.api.uploadProfileImage(this.state.selectedFile).then(() => {
                this.showModal(locales_es.successModal.title, locales_es.successModal.profileImageUploaded);
            }).catch(err => {
                this.showModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            })
        });

    };

    /* MODAL Functions */
    showModal(title, content) {
        this.setState({modalTitle: title});
        this.setState({modalContent: content});
        const regex = /Failed to fetch/igm;
        regex.test(content) ? window.showFailedToFetchModal() : this.show();
    }

    show() {
        this.setState({visible: true});
    }

    hide() {
        this.setState({visible: false});
        window.location.reload();
    }

    //

    render() {
        const {profileImage, enableUpload} = this.props;
        return (
            <>
                {!enableUpload ?
                    <img src={profileImage || ProfileImageDefault} alt=""/>
                    :
                    <div className="kt-avatar kt-avatar--outline kt-avatar--danger kt-avatar--circle"
                         id="kt_profile_avatar_4">
                        <div className="kt-avatar__holder"
                             style={{
                                 backgroundImage: `url(${profileImage || ProfileImageDefault})`
                             }} />
                        <label className="kt-avatar__upload" data-toggle="kt-tooltip" title=""
                               data-original-title={locales_es.changeProfileImage}>
                            <i className="fa fa-pen"/>
                            <input onChange={this.onFileChange} type="file" name="profile_avatar" accept=".png, .jpg, .jpeg"/>
                        </label>
                    </div>
                }

                <Rodal width={window.screen && window.screen.availWidth ? window.screen.availWidth * 0.7 : '300'}
                       visible={this.state.visible} onClose={() => this.hide()}>
                    <h4 className="rodal-title">{this.state.modalTitle}</h4>
                    <div className="rodal-body">{this.state.modalContent}</div>
                    <div className="rodal-footer">
                        <button className="btn btn-primary" type="button"
                                onClick={() => this.hide()}>{locales_es.accept}
                        </button>
                    </div>
                </Rodal>
            </>
        );
    }
}
