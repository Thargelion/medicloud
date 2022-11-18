import React, {Component} from 'react';
import locales_es from "../../locales/es";
import Form from "../form";

export default class PriceModal extends Component {

    constructor(props) {
        super(props);

        const price = this.props.price && this.props.price !== true ? this.props.price : null;

        this.state = {
            index: price ? price.index : null,
            id: price ? price.id : null,
            price: price ? price.price : '',
            title: price ? price.title : '',
            description: price ? price.description : '',
        }
    }

    handleChange = state => ev => {
        this.setState({[state]: ev.target.value});
    };

    render() {
        const {onSave, onCancel} = this.props;

        const priceTemplate = [
            {
                label: locales_es.price,
                placeholder: locales_es.pricePlaceholder,
                id: 1,
                state: 'price',
                value: this.state.price,
                type: 'number',
                min: 1,
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.priceTitle,
                placeholder: locales_es.priceTitlePlaceholder,
                id: 2,
                state: 'title',
                value: this.state.title,
                type: 'text',
                required: true,
                wrapperCustomClassName: 'form-group col-md-6 float-left pl-md-0',
            },
            {
                label: locales_es.priceDescription,
                placeholder: locales_es.priceDescriptionPlaceholder,
                id: 3,
                state: 'description',
                value: this.state.description,
                type: 'text',
                required: false,
                wrapperCustomClassName: 'form-group col-md-12 float-left pl-md-0',
            }
        ];

        return (
            <>
                <div className="woopi-overlay">
                    <div className="woopi-overlay-content">
                        <div className="row justify-content-center">
                            <div className="col-lg-9">
                                <h4 className="mt-3 mb-5 text-center">{locales_es.addPrice}</h4>

                                <Form
                                  inputs={priceTemplate}
                                  handleChange={this.handleChange}
                                  onSubmit={() => {
                                      onSave && onSave(this.state)
                                  }}
                                  onSubmitButtonText={locales_es.save}
                                  onClickSecondaryButton={onCancel}
                                  secondaryButtonText={locales_es.cancel}
                                  buttonWrapperStyle="text-center"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
