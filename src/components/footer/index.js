import React, {Component} from 'react';

export default class Footer extends Component {
    render() {
        const year = new Date().getFullYear();
        return (
            <div className="kt-footer kt-grid__item p-5" id="kt_footer">
                <div className="kt-container ">
                    <div className="kt-footer__copyright">
                        {year}&nbsp;©&nbsp;Powered by&nbsp;<a href="https://medicloud.com.ar" target="_blank" rel="noreferrer" className="kt-link">MediCloud</a>
                    </div>
                    {/*<div className="kt-footer__menu">
                        <a href="http://keenthemes.com/keen" target="_blank" className="kt-link">About</a>
                        <a href="http://keenthemes.com/keen" target="_blank" className="kt-link">Team</a>
                        <a href="http://keenthemes.com/keen" target="_blank" className="kt-link">Contact</a>
                    </div>*/}
                    <div className="kt-footer__copyright">v{process.env.REACT_APP_VERSION}</div>
                </div>
            </div>
        )
    }
}
