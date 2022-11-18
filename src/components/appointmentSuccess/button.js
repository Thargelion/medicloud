import React from 'react';

export default function Button({ children, onClick }) {
    return (
        <button type="button" className="btn btn-focus btn-elevate btn-pill"
            onClick={onClick}
        ><i className="flaticon2-calendar-5"></i> {children}
        </button>
    );
}
