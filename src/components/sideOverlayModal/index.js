import React, {Component} from 'react';

export default class SideOverlayModal extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel" style={this.props.style || {}}>
				<div className="kt-offcanvas-panel__head">
					<h3 className="kt-offcanvas-panel__title">
						{this.props.title}
					</h3>
					<a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close">
						<i className="flaticon2-delete" /></a>
				</div>
				<div className="kt-offcanvas-panel__body kt-scroll ps ps--active-y">
					{this.props.children}
				</div>
			</div>
		)
	}
}
