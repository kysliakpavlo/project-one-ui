import React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Visible from "../../Visible";
import BidInput from "../BidInput";
import SvgComponent from "../../SvgComponent";
import Confirmation from "../../Confirmation";
import { BidHistoryTable } from "../../BidHistory";
import { AssetDetailSlider } from "../../AssetItemCard";
import { TransportCalculatorTable } from "../../TransportCalculator";
import { preventEvent, isInRoom, toAmount, isOnline, toAmountDecimal, getCalculatedBuyersPremiumFee, getCalculatedCardFee } from "../../../../utils/helpers";
import { MESSAGES } from "../../../../utils/constants";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import "./MobilePlaceBid.scss";
import dayjs from "dayjs";

class MobilePlaceBid extends React.Component {
    state = {
        bidValues: {},
        nextBidAmount: 0,
        isBidAmountChanged: false,
        isTermsAgreed: false,
        bidType: isInRoom(this.props.asset.auctionData.auctionType.name)
            ? "absentee-bid"
            : `${this.props.asset.incrementBy !== null && this.props.asset.incrementBy !== 0 ? "auto" : "current"}`,
        isConfirm: false,
        showConfirmation: false,
        disable: false,
        selectedDetails: "Bid",
        buyersPremiumList: [],
    };

    componentDidMount() {
        const { asset, loggedInUser } = this.props;

        if (loggedInUser) {
            this.props
                .getBidValues({
                    assetId: asset.assetId,
                    auctionId: asset.auctionData.auctionId,
                })
                .then((res) => {
                    if (res.result) {
                        this.setState({
                            bidValues: res.result,
                            isTermsAgreed: res.result.termsAgreed,
                            buyersPremiumList: res.result.buyersPremium,
                        });
                    }
                });
        }

        const updatedState = {
            isTermsAgreed: asset.termsAgreed,
            bidValues: {
                ...this.state.bidValues,
                termsAgreed: asset.termsAgreed ? asset.termsAgreed : false,
            },
        };
        if (this.state.nextBidAmount !== 0) {
            updatedState.nextBidAmount = null;
        }
        if (!isInRoom(asset.auctionData.auctionType.name)) {
            updatedState.bidType = asset.incrementBy !== null && asset.incrementBy !== 0 ? "auto" : "current";
        }
        this.setState(updatedState);
    }

    onConfirm = (e, replaceHighestBid = false) => {
        preventEvent(e);
        this.setState({ disable: true });
        const { loggedInUser, asset, onPlaceBidConfirm } = this.props;
        const isLoggedIn = !!loggedInUser;
        if (loggedInUser && (!loggedInUser.cardExist || (loggedInUser.overrideCardCheck && loggedInUser.cardExist))) {
            this.props.showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
            this.props.history.push("/profile?onComplete");
        } else if (isLoggedIn && loggedInUser) {
            if (replaceHighestBid || loggedInUser.accountId !== asset.accountId) {
                onPlaceBidConfirm({
                    assetId: asset.assetId,
                    bidType: this.state.bidType,
                    auctionId: asset.auctionData.auctionId,
                    termsAgreed: this.state.isTermsAgreed,
                    bidAmount: this.state.nextBidAmount,
                });
                this.setState({ showConfirmation: false });
            } else {
                this.setState({ showConfirmation: true });
            }
        } else {
            this.props.toggleLogin(true, () => this.onConfirm(e, replaceHighestBid));
        }
        setTimeout(() => {
            this.setState({ disable: false });
        }, 2000);
    };

    onChangeAmount = (nextBidAmount) => {
        this.setState({ nextBidAmount, isBidAmountChanged: true });
    };

    onChangeBidType = (bidType) => {
        this.setState({ bidType });
    };

    getBPPercentage = (buyersPremium) => {
        if (buyersPremium > 0) {
            return buyersPremium + "%";
        }
        return "0%";
    };

    render() {
        const { asset, onCloseClick, className, loggedInUser, fromMyAccountPage } = this.props;
        let { nextBidAmount, isBidAmountChanged, isTermsAgreed, bidType, showConfirmation, disable, selectedDetails, buyersPremiumList, finalPriceOfAsset = 0 } = this.state;
        const {
            assetId,
            currentBidAmount = 0,
            startingBid = 0,
            incrementBy = 1,
            auctionData: {
                auctionType: { name: auctionType },
            },
        } = asset;

        const isLoggedIn = !!loggedInUser;
        let calculatedPremium = 0;
        let calculatedCardFee = 0;
        let totalAmount = 0;
        let buyersPremium = 0;
        let flatCharge = 0;
        let nextMinBid;
        let bpCharges = [];

        if (currentBidAmount) {
            nextMinBid = currentBidAmount + incrementBy;
        } else {
            nextMinBid = startingBid;
        }

        if (isLoggedIn || isBidAmountChanged) {
            // get Buyers Premium fee
            calculatedPremium = getCalculatedBuyersPremiumFee(buyersPremiumList, nextBidAmount, nextMinBid);
            // get credict card fee
            calculatedCardFee = getCalculatedCardFee(nextBidAmount, calculatedPremium, nextMinBid, this.props.creditCardPercentage);
            // Calculate total amount
            totalAmount = toAmountDecimal(parseFloat(nextBidAmount || nextMinBid) + parseFloat(calculatedPremium) + parseFloat(calculatedCardFee));
        }

        const onChangeTermsAgreed = (e) => {
            this.setState({ isTermsAgreed: e.target.checked });
        };

        const isDisabled = disable || !(isTermsAgreed && bidType && nextBidAmount && nextBidAmount >= nextMinBid);
        const detailTabs = ["Bid", "Details", "Bidder History"];
        // const detailTabs = ["Bid", "Details", "Bidder History", "Freight Cal"];

        return (
            <Card className={`${className} mobile-place-bid`}>
                <Button variant="warning" className="close-btn" onClick={onCloseClick}>
                    <SvgComponent path="close" />
                </Button>
                <Visible when={asset.highestBidder}>
                    <div className="current-bid-section">
                        <div className="current-bid highest-bidder">
                            {" "}
                            <span className="highest-bidder-indicator">
                                <SvgComponent path="gavel" />{" "}
                            </span>{" "}
                            You are the highest bidder
                        </div>
                    </div>
                </Visible>
                <ButtonGroup className="view-tabs">
                    {detailTabs.map((key) => (
                        <Button key={key} variant="light" onClick={() => this.setState({ selectedDetails: key })} className={selectedDetails === key ? "slt-dark" : "slt-white"}>
                            {key}
                        </Button>
                    ))}
                </ButtonGroup>
                {selectedDetails === detailTabs[0] && (
                    <Row className="placebid-row">
                        <Col sm={4} className="bid-amount-section">
                            <BidInput
                                bidType={bidType}
                                startingBid={startingBid}
                                currentBidAmount={currentBidAmount}
                                auctionType={auctionType}
                                nextMinBid={nextMinBid}
                                nextBidAmount={nextBidAmount}
                                incrementBy={incrementBy}
                                onChangeAmount={this.onChangeAmount}
                                onChangeBidType={this.onChangeBidType}
                            />
                        </Col>
                        <Col sm={4} className="fees-premium-section">
                            <p className="fees-premium-label">Fees and Premiums</p>
                            <Row className="fees-details">
                                <Col>Current Bid</Col>
                                <Col>
                                    <strong>{(nextBidAmount > 0 ? toAmount(nextBidAmount) : `$` + Number(0)) || (nextMinBid > 0 ? toAmount(nextMinBid) : `$0`)}</strong>
                                </Col>
                            </Row>
                            <Row className="fees-details">
                                <Col>Buyer's premium %</Col>
                                <Col>
                                    <strong>{this.getBPPercentage(buyersPremium)}</strong>
                                </Col>
                            </Row>
                            <Row className="fees-details">
                                <Col>Buyer's premium</Col>
                                <Col>
                                    <strong>{nextBidAmount > 0 ? toAmountDecimal(calculatedPremium) : "0%"}</strong>
                                </Col>
                            </Row>
                            <Row className="fees-details">
                                <Col>Credit card fee</Col>
                                <Col>
                                    <strong>{nextBidAmount > 0 ? toAmountDecimal(calculatedCardFee) : "-"}</strong>
                                </Col>
                            </Row>
                            <div className="total-fee">
                                <div className="amount">
                                    <span>Total: </span>
                                    <strong>{nextBidAmount > 0 ? toAmountDecimal(totalAmount) : "$0"}</strong>
                                </div>
                                <span className="inc-gst">Inc. GST</span>
                            </div>
                        </Col>
                        <Visible when={!fromMyAccountPage}>
                            <Col sm={4} className="terms-conditions-section">
                                <Form.Label>
                                    Terms
                                    <OverlayTrigger placement="top" overlay={<Tooltip>View full terms and conditions by clicking on the link below. </Tooltip>}>
                                        <SvgComponent path="help_outline" />
                                    </OverlayTrigger>
                                </Form.Label>
                                <Form.Group controlId={`termsNconditions${assetId}`}>
                                    <Form.Check
                                        value={true}
                                        name={`termsAgreed${assetId}`}
                                        type="checkbox"
                                        checked={isTermsAgreed}
                                        onChange={onChangeTermsAgreed}
                                        label={
                                            <>
                                                <div className="accept">I have Read and Accepted </div>
                                                the{" "}
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
                                    />
                                </Form.Group>
                                <Visible when={isOnline(auctionType)}>
                                    <Button variant="warning" disabled={isDisabled} onClick={this.onConfirm} block>
                                        <SvgComponent path="gavel" />
                                        <span>Place Bid</span>
                                    </Button>
                                </Visible>
                                <Visible when={isInRoom(auctionType) && dayjs(asset.auctionData?.datetimeOpen) > dayjs().add(2, "seconds")}>
                                    <Button variant="warning" disabled={isDisabled} onClick={this.onConfirm} block>
                                        <SvgComponent path="gavel" />
                                        <span>Place Absentee Bid</span>
                                    </Button>
                                </Visible>
                            </Col>
                        </Visible>
                        <Visible when={fromMyAccountPage}>
                            <div className="accountPage-placebid">
                                <Visible when={!isInRoom(auctionType)}>
                                    <Button variant="warning" disabled={isDisabled} onClick={this.onConfirm} block>
                                        <SvgComponent path="gavel" />
                                        <span>Place Bid</span>
                                    </Button>
                                </Visible>
                                <Visible when={isInRoom(auctionType) && dayjs(asset.auctionData?.datetimeOpen) > dayjs().add(2, "seconds")}>
                                    <Button variant="warning" disabled={isDisabled} onClick={this.onConfirm} block>
                                        <SvgComponent path="gavel" />
                                        <span>Place Absentee Bid</span>
                                    </Button>
                                </Visible>
                            </div>
                        </Visible>
                    </Row>
                )}
                {selectedDetails === detailTabs[1] && <AssetDetailSlider assetId={assetId} auctionId={asset?.auctionData?.auctionId} />}
                {selectedDetails === detailTabs[2] && <BidHistoryTable assetId={assetId} auctionId={asset?.auctionData?.auctionId} loggedInUser={loggedInUser} />}
                {selectedDetails === detailTabs[3] && (
                    <TransportCalculatorTable
                        enquiry={true}
                        loggedInUser={loggedInUser}
                        assetDetail={asset}
                        fromLocation={asset?.city?.cityId}
                        showMessage={this.props.showMessage}
                        assetType={asset?.assetCategory?.recordTypeId}
                    />
                )}
                <Visible when={showConfirmation}>
                    <Confirmation
                        onConfirm={(e) => this.onConfirm(e, true)}
                        onClose={() => this.setState({ showConfirmation: false })}
                        message=" You are the highest bidder on this asset, are you sure you still want to place a bid?"
                    />
                </Visible>
            </Card>
        );
    }
}

export default withRouter(MobilePlaceBid);
