import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { ASSET_STATUS } from "../../../utils/constants";
import { toAmount, toAmountDecimal, getCalculatedBuyersPremiumFee, getCalculatedCardFee } from "../../../utils/helpers";

import "./BuyNowTermsModal.scss";

const BuyNowTermsModal = (props) => {
    const [buyersPremiumList, setBuyerPremiumList] = useState(props.buyersPremium);
    const [calBuyersPremium, setCalBuyerPremium] = useState(0);
    const [buyersPremium, setBuyerPremium] = useState(0);
    const [calCreditCardFee, setCalCreditCardFee] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [flatCharge, setFlatCharge] = useState(0);
    useEffect(() => {
        let calculatedPremium = 0;
        let calculatedCardFee = 0;
        let totalAmount = 0;
        let buyersPremium = 0;
        let flatCharge = 0;
        let nextMinBid = 0; // review props

        // get Buyers Premium fee
        calculatedPremium = getCalculatedBuyersPremiumFee(buyersPremiumList, props?.listedPrice, nextMinBid);
        // get credict card fee
        calculatedCardFee = getCalculatedCardFee(props?.listedPrice, calculatedPremium, nextMinBid, props.creditCardPercentage);
        // Calculate total amount
        totalAmount = toAmountDecimal(parseFloat(props?.listedPrice || nextMinBid) + parseFloat(calculatedPremium) + parseFloat(calculatedCardFee));
        

        setBuyerPremium(buyersPremium);
        setCalBuyerPremium(calculatedPremium);
        setCalCreditCardFee(calculatedCardFee);
        setTotalAmount(totalAmount);
    }, [props.buyersPremium]);
    return (
        <Modal size="sm" show={props.showBuyNowModal} onHide={props.handleBuyNowClose} dialogClassName="buy-now-terms">
            <Modal.Header closeButton>
                <Modal.Title> Buy Now </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <div className="bid-details mb-2">
                    <div className="row mx-0">
                        <div className="col-7 px-0">Price</div>
                        <div className="col-5 px-0 rt-aln">{toAmount(props?.listedPrice)}</div>
                    </div>
                    <div className="row mx-0 d-none">
                        <div className="col-7 px-0">Buyers premium %</div>
                        <div className="col-5 px-0 rt-aln">
                            {buyersPremium} {`%`}
                        </div>
                    </div>
                    <div className="row mx-0">
                        <div className="col-7 px-0">Buyers premium</div>
                        <div className="col-5 px-0 rt-aln">{toAmount(calBuyersPremium)}</div>
                    </div>
                    <div className="row mx-0">
                        <div className="col-7 px-0">Credit card fee</div>
                        <div className="col-5 px-0 rt-aln">{toAmount(calCreditCardFee)}</div>
                    </div>
                    <div className="row mx-0 buy-now-total">
                        <div className="col-7 px-0">Total price</div>
                        <div className="col-5 px-0 ">{toAmount(totalAmount)}</div>
                    </div>
                </div>
                <div className="inc-gst">{props.gstApplicable ? "Inc." : "Excl."} GST</div>
                <Form.Group controlId="accept" className="accept-button">
                    <Form.Check
                        key={props.assetId + "auto"}
                        type="checkbox"
                        label={
                            <>
                                <div className="accept">I have Read and Accepted </div>
                                <Link to="/accept-terms-conditions" target="_blank" className="terms-link">
                                    Terms and Conditions
                                </Link>
                                <div>
                                    <a href={window.location.origin + "/files/Slattery_Information_Security_Policy.pdf"} target="_blank">
                                        View our Information Security Policy
                                    </a>
                                </div>
                            </>
                        }
                        name={`bidtype_${props.assetId}`}
                        value="auto"
                        checked={props.termsAgreed}
                        onChange={(e) => props.acceptTerm(e)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                {props.status === ASSET_STATUS.UNDER_OFFER ? (
                    <Button variant="warning" className="buy-now-button">
                        Under Offer
                    </Button>
                ) : (
                    <Button variant="warning" disabled={!props.termsAgreed} className="buy-now-button" onClick={props.buyNowClick}>
                        Buy now
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default BuyNowTermsModal;
