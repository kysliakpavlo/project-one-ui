import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import _get from "lodash/get";

import "./SalesNotesAndFeesModal.scss";
//asset.auctionData.saleNote
const SalesNotesAndFeesModal = (props) => {
    const { show, onClose, asset } = props;
    return (
        <Modal size="lg" show={show} onHide={onClose} dialogClassName="sales-notes-fees-modal modal-dialog-scrollable">
            <Modal.Header closeButton>
                <Modal.Title>Sales Notes and Fees</Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <div>
                    <div className="description-detail">
                        {asset.auctionData.longDesc !== null ? (
                            <>
                                <h5>Buyer's Premium</h5>
                                <div
                                    className="description-bp"
                                    dangerouslySetInnerHTML={{
                                        __html: _get(asset.auctionData, "longDesc"),
                                    }}
                                ></div>
                            </>
                        ) : (
                            <h5>Description is not updated</h5>
                        )}
                    </div>

                    <div className="description-detail">
                        {asset.auctionData.inspection !== null ? (
                            <>
                                <h5>Inspection</h5>
                                <div
                                    className="description-bp"
                                    dangerouslySetInnerHTML={{
                                        __html: _get(asset.auctionData, "inspection"),
                                    }}
                                ></div>{" "}
                            </>
                        ) : (
                            <>
                                {" "}
                                <h5>Inspection is not updated</h5>{" "}
                            </>
                        )}
                    </div>
                    <div className="description-detail">
                        {asset.auctionData.delivery !== null ? (
                            <>
                                <h5>Delivery and Pick Up</h5>
                                <div
                                    className="description-bp"
                                    dangerouslySetInnerHTML={{
                                        __html: _get(asset.auctionData, "delivery"),
                                    }}
                                ></div>
                            </>
                        ) : (
                            <>
                                <h5>Delivery and pick up details are not updated</h5>{" "}
                            </>
                        )}
                    </div>
                    {(asset.auctionData.paymentType && asset.auctionData.paymentType !== null) &&
                        <div className="description-detail">
                            <>
                                <h5>Payment Type</h5>
                                <div
                                    className="description-bp"
                                    dangerouslySetInnerHTML={{
                                        __html: _get(asset.auctionData, "paymentType"),
                                    }}
                                ></div>
                            </>
                        </div>
                    }
                    <div className="description-detail">
                        <h5>Enquiries Please Email</h5>
                        {asset.auctionData.contact && (
                            <>
                                {asset.auctionData.contact.name !== null ? <div className="contact-name">Contact : {_get(asset.auctionData.contact, "name")} </div> : <> </>}
                                {asset.auctionData.contact.phone !== null ? <div className="contact-phone">Phone : {_get(asset.auctionData.contact, "phone")} </div> : <> </>}
                                {asset.auctionData.contact.mobile !== null ? <div className="contact-phone">Mobile : {_get(asset.auctionData.contact, "mobile")} </div> : <> </>}
                                {asset.auctionData.contact.email !== null ? (
                                    <div className="contact-mail">
                                        {" "}
                                        Email : <a href={`mailto:${_get(asset.auctionData.contact, "email")}`}>{_get(asset.auctionData.contact, "email")} </a>
                                    </div>
                                ) : (
                                    <> </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="description-detail">
                        <h5>Sales Notes</h5>
                        <div
                            className="dv-salesnote"
                            dangerouslySetInnerHTML={{
                                __html: asset.auctionData.saleNote,
                            }}
                        ></div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SalesNotesAndFeesModal;
