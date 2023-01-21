import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const Confirmation = ({ title = "Confirmation", message = "Are you sure", onClose, onConfirm, ...props }) => (
    <Modal {...props} size={"md"} show={true} onHide={onClose} id="place-bid-modal" className="place-bid-modal">
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">{message}</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
                Close
            </Button>
            <Button variant="primary" type="button" onClick={onConfirm}>
                Confirm
            </Button>
        </Modal.Footer>
    </Modal>
);

export default Confirmation;
