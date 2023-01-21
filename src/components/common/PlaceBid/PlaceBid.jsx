import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Visible from '../Visible';
import Confirmation from '../Confirmation';
import {
	preventEvent,
	isInRoom,
	toAmount,
	isOnline,
	toAmountDecimal,
	getCalculatedBuyersPremiumFee,
	getCalculatedCardFee,
} from '../../../utils/helpers';
import { MESSAGES } from '../../../utils/constants';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import SvgComponent from '../SvgComponent';
import BidInput from './BidInput';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import onClickOutside from 'react-onclickoutside';
import dayjs from 'dayjs';
import './PlaceBid.scss';
class PlaceBid extends React.Component {
	state = {
		bidValues: {},
		nextBidAmount: 0,
		isBidAmountChanged: false,
		isTermsAgreed: false,
		bidType: isInRoom(this.props.asset.auctionData.auctionType.name)
			? 'absentee-bid'
			: `${
					this.props.asset.incrementBy !== null &&
					this.props.asset.incrementBy !== 0
						? 'auto'
						: 'current'
			  }`,
		isConfirm: false,
		showConfirmation: false,
		disable: false,
		buyersPremiumList: [],
	};

	componentDidMount() {
		const { asset, loggedInUser, getBidValues } = this.props;

		if (loggedInUser) {
			getBidValues({
				assetId: asset.assetId,
				auctionId: asset.auctionData.auctionId,
			}).then((res) => {
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
			updatedState.bidType =
				asset.incrementBy !== null && asset.incrementBy !== 0
					? 'auto'
					: 'current';
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
		if (
			loggedInUser &&
			(!loggedInUser.cardExist ||
				(loggedInUser.overrideCardCheck && loggedInUser.cardExist))
		) {
			this.props.showMessage({
				message: MESSAGES.CARD_MISSING,
				type: 'error',
			});
			this.props.history.push('/profile?onComplete');
			this.props.liveComponent && this.props.handleScrollConflicts();
		} else if (isLoggedIn && loggedInUser) {
			if (
				replaceHighestBid ||
				!asset.highestBidder ||
				this.state.bidType === 'auto'
			) {
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
			this.props.toggleLogin(true, () =>
				this.onConfirm(e, replaceHighestBid)
			);
		}
		setTimeout(() => {
			this.setState({ disable: false });
		}, 2000);
	};
	handleClickOutside = (evt) => {
		if (evt.target?.nodeName !== 'HTML') {
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
			return buyersPremium + '%';
		}
		return '0%';
	};

	render() {
		const {
			asset,
			onCloseClick,
			className,
			loggedInUser,
			fromMyAccountPage,
			creditCardPercentage,
		} = this.props;
		const {
			nextBidAmount,
			isBidAmountChanged,
			isTermsAgreed,
			bidType,
			showConfirmation,
			disable,
			bidValues,
			buyersPremiumList,
		} = this.state;

		const {
			assetId,
			currentBidAmount = 0,
			startingBid = 0,
			incrementBy = 1,
			auctionData: {
				auctionType: { name: auctionType },
			},
		} = asset;
		const { gstApplicable } = bidValues;
		const isLoggedIn = !!loggedInUser;
		// const { termsAgreed } = bidValues;
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

		let testbuyersPremiumList = [
			{
				assetId: null,
				assetProvidedBy: null,
				assetType: 'Motor Vehicle',
				auctionId: null,
				chargeRate: 0,
				chargeRateFlat: 440,
				chargeType: 'Buyer Charge',
				isStandard: true,
				name: 'CP-0149',
				priority: 4,
				salesPriceLowerBound: 0,
				salesPriceUpperBound: 2999.99,
			},
			{
				assetId: null,
				assetProvidedBy: null,
				assetType: 'Motor Vehicle',
				auctionId: null,
				chargeRate: 1.1,
				chargeRateFlat: 0,
				chargeType: 'Buyer Charge',
				isStandard: true,
				name: 'CP-9451',
				priority: 4,
				salesPriceLowerBound: 3000,
				salesPriceUpperBound: 39999.99,
			},
		];

		if (isLoggedIn || isBidAmountChanged) {
			// get Buyers Premium fee
			calculatedPremium = getCalculatedBuyersPremiumFee(
				buyersPremiumList,
				nextBidAmount,
				nextMinBid
			);
			// get credict card fee
			calculatedCardFee = getCalculatedCardFee(
				nextBidAmount,
				calculatedPremium,
				nextMinBid,
				creditCardPercentage
			);
			// Calculate total amount
			totalAmount = toAmountDecimal(
				parseFloat(nextBidAmount || nextMinBid) +
					parseFloat(calculatedPremium) +
					parseFloat(calculatedCardFee)
			);
		}

		const onChangeTermsAgreed = (e) => {
			this.setState({ isTermsAgreed: e.target.checked });
		};

		const isDisabled =
			disable ||
			!(
				isTermsAgreed &&
				bidType &&
				nextBidAmount &&
				nextBidAmount >= nextMinBid
			);

		return (
			<Card className={`${className ? className : ''} place-bid`}>
				{/* <Button
					variant="warning"
					className="close-btn"
					onClick={onCloseClick}
				>
					<SvgComponent path="close" />
				</Button> */}
				<Visible when={asset.highestBidder}>
					<div className="current-bid-section">
						<div className="current-bid highest-bidder">
							{' '}
							<span className="highest-bidder-indicator">
								<SvgComponent path="gavel" />{' '}
							</span>{' '}
							You are the highest bidder
						</div>
					</div>
				</Visible>
				<div className="placebid-row">
					<div className="bid-amount-section">
						<BidInput
							bidType={bidType}
							currentBidAmount={currentBidAmount}
							startingBid={startingBid}
							auctionType={auctionType}
							nextMinBid={nextMinBid}
							nextBidAmount={nextBidAmount}
							incrementBy={incrementBy}
							onChangeAmount={this.onChangeAmount}
							onChangeBidType={this.onChangeBidType}
						/>
					</div>
					<div className="fees-premium-section">
						<p className="fees-premium-label">Fees and Premiums</p>
						<Row className="fees-details">
							<p>Current Bid</p>
							<strong>
								{(nextBidAmount > 0
									? toAmount(nextBidAmount)
									: `$` + Number(0)) ||
									(nextMinBid > 0
										? toAmount(nextMinBid)
										: `$0`)}
							</strong>
						</Row>
						<Row className="fees-details d-none">
							<p>Buyer's premium %</p>
							<div>
								<strong>
									{this.getBPPercentage(buyersPremium)}
								</strong>
							</div>
						</Row>
						<Row className="fees-details">
							<p>Buyer's premium</p>
							<strong>
								{nextBidAmount && calculatedPremium > 0
									? toAmountDecimal(calculatedPremium)
									: '-'}
							</strong>
						</Row>
						<Row className="fees-details">
							<p>Credit card fee</p>
							<strong>
								{nextBidAmount && calculatedCardFee > 0
									? toAmountDecimal(calculatedCardFee)
									: '-'}
							</strong>
						</Row>
						<div className="total-fee">
							<div className="amount">
								<span>Total: </span>
								<strong>
									{nextBidAmount > 0
										? toAmountDecimal(totalAmount)
										: '$0'}
								</strong>
							</div>
							<span className="inc-gst">
								{gstApplicable ? 'Inc.' : 'Excl.'} GST
							</span>
						</div>
					</div>
					<Visible when={!fromMyAccountPage}>
						<div className="terms-conditions-section">
							<Form.Label>
								Terms
								<OverlayTrigger
									placement="bottom"
									overlay={
										<Tooltip className="fixed-tooltip">
											View full terms and conditions by
											clicking on the link below.{' '}
										</Tooltip>
									}
								>
									<SvgComponent path="help_outline" />
								</OverlayTrigger>
								{/* <SvgComponent path="help_outline" /> */}
							</Form.Label>
							<Form.Group
								controlId={`termsNconditions${assetId}`}
							>
								<Form.Check
									value={true}
									name={`termsAgreed${assetId}`}
									type="checkbox"
									checked={isTermsAgreed}
									onChange={onChangeTermsAgreed}
									label={
										<>
											<div className="accept">
												I have Read and Accepted the
											</div>
											<Link
												to="/accept-terms-conditions"
												target="_blank"
												className="terms-link"
											>
												Terms and Conditions
											</Link>
											<div>
												<a
													href={
														window.location.origin +
														'/files/Slattery_Information_Security_Policy.pdf'
													}
													target="_blank"
												>
													View our Information
													Security Policy
												</a>
											</div>
										</>
									}
								/>
							</Form.Group>
							<Visible when={isOnline(auctionType)}>
								<Button
									variant="warning"
									disabled={isDisabled}
									onClick={this.onConfirm}
									className="place-bid-btn"
									block
								>
									<SvgComponent path="gavel" />
									Place Bid
								</Button>
							</Visible>
							<Visible
								when={
									isInRoom(auctionType) &&
									dayjs(asset.auctionData?.datetimeOpen) >
										dayjs().add(2, 'seconds')
								}
							>
								<Button
									variant="warning"
									disabled={isDisabled}
									onClick={this.onConfirm}
									className="place-bid-btn"
									block
								>
									<SvgComponent path="gavel" />
									Absentee Bid
								</Button>
							</Visible>
						</div>
					</Visible>
				</div>
				<Visible when={fromMyAccountPage}>
					<Form.Label className="account-page-terms">
						Terms
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip className="fixed-tooltip">
									View full terms and conditions by clicking
									on the link below.{' '}
								</Tooltip>
							}
						>
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
									<div className="accept">
										I have Read and Accepted the{' '}
										<Link
											to="/accept-terms-conditions"
											target="_blank"
											className="terms-link"
										>
											Terms and Conditions
										</Link>
									</div>
									<div>
										<a
											href={
												window.location.origin +
												'/files/Slattery_Information_Security_Policy.pdf'
											}
											target="_blank"
										>
											View our Information Security Policy
										</a>
									</div>
								</>
							}
						/>
					</Form.Group>
					<div className="accountPage-placebid">
						<Visible
							when={
								isInRoom(auctionType) &&
								dayjs(asset.auctionData?.datetimeOpen) >
									dayjs().add(2, 'seconds')
							}
						>
							<Button
								variant="warning"
								disabled={isDisabled}
								onClick={this.onConfirm}
								block
							>
								<SvgComponent path="gavel" />
								<span>Absentee Bid</span>
							</Button>
						</Visible>
						<Visible when={isOnline(auctionType)}>
							<Button
								variant="warning"
								disabled={isDisabled}
								onClick={this.onConfirm}
								block
							>
								<SvgComponent path="gavel" />
								<span>Place Bid</span>
							</Button>
						</Visible>
					</div>
				</Visible>
				<Visible when={showConfirmation}>
					<Confirmation
						onConfirm={(e) => this.onConfirm(e, true)}
						onClose={() =>
							this.setState({ showConfirmation: false })
						}
						message=" You are the highest bidder on this asset, are you sure you still want to place a bid?"
					/>
				</Visible>
			</Card>
		);
	}
}

export default withRouter(onClickOutside(PlaceBid));
