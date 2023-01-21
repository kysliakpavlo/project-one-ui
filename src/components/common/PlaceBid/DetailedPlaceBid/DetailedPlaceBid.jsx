import React from "react";
import _get from "lodash/get";
import _has from "lodash/has";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import BidInput from "../BidInput";
import Visible from "../../Visible";
import NotifyMe from "../../NotifyMe";
import ReserveMet from "../../ReserveMet";
import SvgComponent from "../../SvgComponent";
import Confirmation from "../../Confirmation";
import CountdownTimer from "../../CountdownTimer";
import { BidHistoryTable } from "../../BidHistory";
import AssetCardImages from "../../AssetCardImages";
import { AssetDetailSlider } from "../../AssetItemCard";
import { TransportCalculatorTable } from "../../TransportCalculator";
import { ASSET_TYPE } from "../../../../utils/constants";
import { stringify } from "qs";
import { preventEvent, isInRoom, toUrlString, toAmount, toAmountDecimal, isOnline, getCalculatedBuyersPremiumFee, getCalculatedCardFee } from "../../../../utils/helpers";
import { MESSAGES } from "../../../../utils/constants";
import onClickOutside from "react-onclickoutside";
import "./DetailedPlaceBid.scss";
import dayjs from "dayjs";

class DetailedPlaceBid extends React.Component {
    state = {
        bidValues: {},
        nextBidAmount: 0,
        isBidAmountChanged: false,
        isTermsAgreed: false,
        buyersPremiumList: [],
        bidType: isInRoom(this.props.asset.auctionData.auctionType.name)
            ? "absentee-bid"
            : `${this.props.asset.incrementBy !== null && this.props.asset.incrementBy !== 0 ? "auto" : "current"}`,
        isConfirm: false,
        showConfirmation: false,
        disable: false,
        selectedDetails: "Details",
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
    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
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
            if (replaceHighestBid || loggedInUser.accountId !== asset.accountId || this.state.bidType === "auto") {
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
    handleClickOutside = (evt) => {
        if (evt.target?.nodeName !== "HTML") {
            const { showConfirmation } = this.state;
            if (!showConfirmation) {
                this.props.onCloseClick();
            }
        }
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
        const { asset, onCloseClick, className, loggedInUser, toggleLogin, notificationUpdate, creditCardPercentage, setDetailsAsset } = this.props;
        const { nextBidAmount, isBidAmountChanged, isTermsAgreed, bidType, showConfirmation, disable, selectedDetails, buyersPremiumList, bidValues } = this.state;
        const {
            assetId,
            currentBidAmount = 0,
            startingBid = 0,
            incrementBy = 1,
            auctionData: {
                auctionId,
                auctionType: { name: auctionType },
            },
        } = asset;
        const isLoggedIn = !!loggedInUser;
        const { gstApplicable } = bidValues;
        let calculatedPremium = 0;
        let calculatedCardFee = 0;
        let totalAmount = 0;
        let buyersPremium = 0;
        let flatCharge = 0;
        let nextMinBid;

        if (currentBidAmount) {
            nextMinBid = currentBidAmount + incrementBy;
        } else {
            nextMinBid = startingBid;
        }

        if (isLoggedIn || isBidAmountChanged) {
            // get Buyers Premium fee
            calculatedPremium = getCalculatedBuyersPremiumFee(buyersPremiumList, nextBidAmount, nextMinBid);
            // get credict card fee
            calculatedCardFee = getCalculatedCardFee(nextBidAmount, calculatedPremium, nextMinBid, creditCardPercentage);
            // Calculate total amount
            totalAmount = toAmountDecimal(parseFloat(nextBidAmount || nextMinBid) + parseFloat(calculatedPremium) + parseFloat(calculatedCardFee));
        }

        const onChangeTermsAgreed = (e) => {
            this.setState({ isTermsAgreed: e.target.checked });
        };

        const isEOI = asset && asset.auctionData && asset.auctionData.isEOI;
        const isDisabled = disable || !(isTermsAgreed && bidType && nextBidAmount && nextBidAmount >= nextMinBid);
        const groupName = _get(asset, "assetCategory.categoryGroup.groupName");
        const assetUrl = {
            pathname: `/asset`,
            search: stringify({
                auctionNum: asset.auctionData?.auctionNum,
                consignmentNo: asset.consignmentNo,
            }),
            state: { groupName },
        };
        // const detailTabs = ["Details", "Bidder History", "Freight Cal"];
        const detailTabs = ["Details", "Bidder History"];

        return (
            <Card className={`${className} detailed-place-bid`}>
                <Card.Title>
                    <span className="text-truncate">{asset.title}</span>
                    <div className="asset-basic-details">
                        <Visible when={_get(asset, "transmission")}>
                            <div className="detail">
                                <SvgComponent path="sync-alt" />
                                {_get(asset, "transmission", "")}
                            </div>
                        </Visible>
                        <Visible when={_get(asset, "odoMeter")}>
                            <div className="detail">
                                <SvgComponent path="direction-car" />
                                KM: {_get(asset, "odoMeter")}
                                {" Showing"}
                            </div>
                        </Visible>
                        <Visible when={_get(asset, "lotNo")}>
                            <div className="detail">
                                <SvgComponent path="lot-no" />
                                Lot: {_get(asset, "lotNo", "")}
                            </div>
                        </Visible>
                        <Visible when={_has(asset, "city.name") || _has(asset, "state.name")}>
                            <div className="detail">
                                <SvgComponent path="location" />
                                {_get(asset, "city.name", "")}, {_get(asset, "state.name", "")}
                            </div>
                        </Visible>
                        <Button variant="warning" className="close-btn" onClick={onCloseClick}>
                            <SvgComponent path="close" />
                        </Button>
                    </div>
                </Card.Title>
                <Row className="placebid-row">
                    <Col className="asset-details">
                        <AssetCardImages
                            image={asset.assetImageUrl}
                            totalImages={asset.totalAssetImages}
                            spinCar={asset.spincar}
                            assetId={assetId}
                            isLoggedIn={isLoggedIn}
                            toggleLogin={toggleLogin}
                            status={asset.status}
                            auctionNum={asset?.auctionData?.auctionNum}
                            consignmentNo={asset?.consignmentNo}
                            setDetailsAsset={setDetailsAsset}
                        />
                        <Visible when={asset.assetType !== ASSET_TYPE.BUY_NOW && !isEOI}>
                            <div className="current-bid-section">
                                {currentBidAmount > 0 ? (
                                    <p className="current-bid">
                                        Current Bid:
                                        <strong> {toAmount(currentBidAmount)}</strong>
                                    </p>
                                ) : (
                                    <p className="current-bid">
                                        Starting Bid:
                                        <strong> {toAmount(startingBid)}</strong>
                                    </p>
                                )}
                            </div>
                            <Card.Text as="div" className="time-remaining">
                                <CountdownTimer bonusTime={asset.isExtended} time={asset.datetimeClose} />
                            </Card.Text>
                        </Visible>
                        <div className="asset-actions">
                            <Visible when={!isEOI && asset.assetType !== ASSET_TYPE.BUY_NOW}>
                                <NotifyMe
                                    auctionId={auctionId}
                                    assetId={asset.assetId}
                                    notifiedUser={asset.isNotified}
                                    notificationUpdate={notificationUpdate}
                                    dataTimeClose={asset.datetimeClose}
									variant={'secondary'}
                                />
                            </Visible>
                            <Button as={Link} to={assetUrl}>
                                Full Details
                            </Button>
                        </div>
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
                        <Visible when={!asset.auctionData.isEOI && asset.showReserveOnSearch}>
                            <div className="reserve-met-section">
                                <p> {asset.reserveMet ? "Reserve Met" : "Reserve Not Met"}</p>
                                <ReserveMet percent={asset.reservePercentage} />
                            </div>
                        </Visible>
                    </Col>
                    <Col className="bid-amount-details">
                        <BidInput
                            bidType={bidType}
                            showCurrentBid={false}
                            currentBidAmount={currentBidAmount}
                            startingBid={startingBid}
                            auctionType={auctionType}
                            nextMinBid={nextMinBid}
                            nextBidAmount={nextBidAmount}
                            incrementBy={incrementBy}
                            onChangeAmount={this.onChangeAmount}
                            onChangeBidType={this.onChangeBidType}
                        />
                        <div className="fees-details d-none">
                            <div className="label">Buyer's premium %</div>
                            <div className="value ellipsis">
                                <strong>{this.getBPPercentage(buyersPremium)}</strong>
                            </div>
                        </div>
                        <OverlayTrigger placement="right" overlay={<Tooltip>{nextBidAmount && calculatedPremium > 0 ? toAmountDecimal(calculatedPremium) : "-"}</Tooltip>}>
                            <div className="fees-details">
                                <div className="label">Buyer's premium</div>
                                <div className="value ellipsis">
                                    <strong>{nextBidAmount && calculatedPremium > 0 ? toAmountDecimal(calculatedPremium) : "-"}</strong>
                                </div>
                            </div>
                        </OverlayTrigger>
                        <OverlayTrigger placement="right" overlay={<Tooltip>{nextBidAmount && calculatedCardFee > 0 ? toAmountDecimal(calculatedCardFee) : "-"}</Tooltip>}>
                            <div className="fees-details">
                                <div className="label">Credit card fee</div>
                                <div className="value ellipsis">
                                    <strong>{nextBidAmount && calculatedCardFee > 0 ? toAmountDecimal(calculatedCardFee) : "-"}</strong>
                                </div>
                            </div>
                        </OverlayTrigger>
                        <div className="total-fee">
                            <div className="amount">
                                <span>Total: </span>
                                <strong>{nextBidAmount > 0 ? toAmountDecimal(totalAmount) : "$0"}</strong>
                            </div>
                            <span className="inc-gst">{gstApplicable ? "Inc." : "Excl."} GST</span>
                        </div>
                        <Form.Label className="agree-terms">
                            Terms
                            <OverlayTrigger placement="top" overlay={<Tooltip>View full terms and conditions by clicking on the link below. </Tooltip>}>
                                <SvgComponent path="help_outline" />
                            </OverlayTrigger>
                        </Form.Label>
                        <Form.Group controlId={`termsNconditions${assetId}`}>
                            <Form.Check
                                value={true}
                                type="checkbox"
                                checked={isTermsAgreed}
                                name={`termsAgreed${assetId}`}
                                onChange={onChangeTermsAgreed}
                                label={
                                    <>
                                        <div className="accept">I have Read and Accepted</div>
                                        the{" "}
                                        <Link to="/accept-terms-conditions" target="_blank" className="terms-link">
                                            Terms and Conditions
                                        </Link>
                                        <div className="security-link">
                                            <a href={window.location.origin + "/files/Slattery_Information_Security_Policy.pdf"} target="_blank">
                                                View our Information Security Policy
                                            </a>
                                        </div>
                                    </>
                                }
                            />
                        </Form.Group>
                        <Visible when={isOnline(auctionType)}>
                            <Button variant="warning" className="confirm-placebid-btn" disabled={isDisabled} onClick={this.onConfirm} block>
                                <SvgComponent path="gavel" />
                                <span>Place Bid</span>
                            </Button>
                        </Visible>
                        <Visible when={isInRoom(auctionType) && dayjs(asset.auctionData?.datetimeOpen) > dayjs().add(2, "seconds")}>
                            <Button variant="warning" className="confirm-placebid-btn" disabled={isDisabled} onClick={this.onConfirm} block>
                                <SvgComponent path="gavel" />
                                <span>Absentee Bid</span>
                            </Button>
                        </Visible>
                    </Col>
                    <Col className="vertical-separator" />
                    <Col className="asset-details-tabs">
                        <ButtonGroup className="w-100">
                            {detailTabs.map((key) => (
                                <Button
                                    key={key}
                                    variant="light"
                                    onClick={() => this.setState({ selectedDetails: key })}
                                    className={selectedDetails === key ? "" : "slt-white"}
                                >
                                    {key}
                                </Button>
                            ))}
                        </ButtonGroup>
                        {selectedDetails === detailTabs[0] && <AssetDetailSlider assetId={assetId} auctionId={auctionId} />}
                        {selectedDetails === detailTabs[1] && (
                            <BidHistoryTable assetId={assetId} auctionId={auctionId} loggedInUser={loggedInUser} currentBidAmount={currentBidAmount} />
                        )}
                        {selectedDetails === detailTabs[2] && (
                            <TransportCalculatorTable
                                enquiry={true}
                                assetDetail={asset}
                                loggedInUser={loggedInUser}
                                fromLocation={asset?.city?.cityId}
                                showMessage={this.props.showMessage}
                                assetType={asset?.assetCategory?.recordTypeId}
                            />
                        )}
                    </Col>
                </Row>
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

export default withRouter(onClickOutside(DetailedPlaceBid));
