import React from 'react';

export default function Button({ children, onContinue, paymentMethod, onBankTransferClick, onMercadoPagoClick }) {

    let buttonClassName = 'btn-focus';
    let iconClassName = 'flaticon2-calendar-5';
    let onClick = onContinue;

    switch (paymentMethod.payment_method.tag) {
        case "manual":
            buttonClassName = 'btn-brand';
            iconClassName = 'la la-calendar-check-o';
            break;
        case "bank_transfer":
            buttonClassName = 'btn-success';
            iconClassName = 'la la-bank';
            onClick = onBankTransferClick;
            break;
        case "mercado_pago":
            buttonClassName = 'btn-info';
            iconClassName = 'la la-credit-card';
            onClick = onMercadoPagoClick;
            break;
    }

    return (
        <button type="button" className={'btn btn-elevate btn-pill m-1 ' + buttonClassName}
            onClick={onClick}
        ><i className={iconClassName}></i> {children}
        </button>
    );
}
