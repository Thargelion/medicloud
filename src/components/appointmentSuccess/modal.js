import React from 'react';
import Modal from 'react-modal';
import Button from "./button";

export default function CalendarModal({
                                          children,
                                          isOpen,
                                          onRequestClose,
                                      }) {
    return (
        <Modal
            className="woopi-calendar-modal"
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={true}
        >
            <h2>Add to Calendar</h2>
            <div>{children}</div>
            <Button onClick={onRequestClose}>Cancel</Button>
        </Modal>
    );
}
