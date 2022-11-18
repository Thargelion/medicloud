import React, {Component} from 'react';
// import "./index.css";

export default class Modal extends Component {

    constructor(props) {
        super(props);
    }

    _show() {
        window.$(`#${this.props.modalId}`).modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        })
    }

    _showModal() {
        setTimeout(() => this._show(), 0);
        // this._show();
    }

    _hide() {
        window.$(`#${this.props.modalId}`).modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        })
    }

    _hideModal() {
        setTimeout(() => this._hide(), 0);
        // this._show();
    }

    render() {
        const {modalId, title, visible, actions = [], hideCloseButton} = this.props;

        return (
            <>
                <div id={modalId} className="modal hide" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{title}</h5>
                                {hideCloseButton ? null :
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                                }
                            </div>
                            <div className="modal-body">
                                {this.props.children}
                            </div>
                            {actions && actions.length &&
                            <div className="modal-footer">
                                {actions.map((action, index) => {
                                    return (
                                        <button key={`modal-action-${index}`}
                                                onClick={() => action.onClick()} type="button"
                                                className={action.className}
                                                data-dismiss="modal">
                                            {action.title}
                                        </button>
                                    )
                                })}
                            </div>
                            }
                        </div>
                    </div>
                </div>
                {visible ? this._showModal() : this._hideModal()}
            </>
        )
    }
}
