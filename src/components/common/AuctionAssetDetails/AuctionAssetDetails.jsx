import React from 'react';
import { Link } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import _has from 'lodash/has';
import Button from 'react-bootstrap/Button';
import dayjs from 'dayjs';
import {
	ASSET_TYPE,
	ASSET_STATUS,
	LIVE,
	SOCKET,
	ONE_YEAR,
} from '../../../utils/constants';
import { Scrollable } from '../Scrollable';
import SvgComponent from '../SvgComponent';
import Visible from '../Visible';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';

import {
	isInRoom,
	isOnline,
	toAmount,
	toUrlString,
	getTimezoneName,
} from '../../../utils/helpers';
import DownloadAuctionDocuments from '../DownloadAuctionDocuments';
import './AuctionAssetDetails.scss';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

class AuctionAssetDetails extends React.Component {
	constructor(props) {
		super(props);

		this.selectorRef = React.createRef(null);
		this.BonusRef = React.createRef(null);
	}
	state = {
		width: window.innerWidth,
		showKeyContact: false,
		showBonusPopover: false,
		showAbsenteePopover: false,
		totalWatchers: '',
		totalPageViews: '',
		totalBidsAuction: '',
		targetContact: null,
		targetBonus: null,
		showSalesFeesModal: false,
	};

	componentDidMount() {
		this.openSocket();
		this.setState({
			totalWatchers: this.props.auctionData.totalWatchers,
			totalPageViews: this.props.auctionData.totalPageViews,
			totalBidsAuction: this.props.auctionData.totalBidsAuction,
		});
		window.addEventListener('resize', this.updateDimensions);
	}

	componentWillUnmount() {
		this.closeSocket();
		window.removeEventListener('resize', this.updateDimensions);
	}
	updateDimensions = () => {
		this.setState({ width: window.innerWidth });
	};

	printBuyerCard = () => {
		const { auctionData } = this.props;
		if (auctionData.termsAgreed) {
			this.props.history.push(`/buyer-card/${auctionData.auctionId}`);
		} else {
			if (this.props.isLoggedIn) {
				this.props
					.auctionTerms({ auctionId: auctionData.auctionId })
					.then((res) => {
						if (res.result) {
							const itemObj = toUrlString({
								auctionId: auctionData.auctionId,
								auctionName: auctionData.auctionName,
								auctionNumber: auctionData.auctionNum,
								startDate: auctionData.datetimeOpen,
								endDate: auctionData.datetimeClose,
							});
							if (res.result.isTermsAccepted) {
								this.props.history.push(
									`/buyer-card/${auctionData.auctionId}`
								);
							} else {
								this.callAppTermsCondition(
									itemObj,
									auctionData.termsAgreed
								);
							}
						}
					});
			} else {
				this.props.toggleLogin(true, () =>
					this.printBuyerCard(auctionData)
				);
			}
		}
	};

	callAppTermsCondition = (item, terms) => {
		if (!terms) {
			this.props.history.push(`/accept-terms-conditions?${item}`);
		} else if (this.props.isLoggedIn) {
			this.props.history.push(`/buyer-card/${item.auctionId}`);
		}
	};

	onKeyContact = (e) => {
		const { targetContact, showKeyContact } = this.state;
		this.setState({
			showKeyContact: !this.state.showKeyContact,
		});
		!targetContact && this.setState({ targetContact: e.target });
	};

	onBonusTime = (e) => {
		const { targetBonus } = this.state;
		this.setState({
			showBonusPopover: !this.state.showBonusPopover,
		});
		!targetBonus && this.setState({ targetBonus: e.target });
	};

	onAbsenteePopover = () => {
		this.setState({ showAbsenteePopover: !this.state.showAbsenteePopover });
	};

	openSocket = () => {
		const { socket, auctionData } = this.props;
		if (socket && socket.on) {
			socket.on(
				`on-auction-change-${this.props.auctionData.auctionId}`,
				({ auction }) => {
					if (!_isEmpty(auction)) {
						if (_has(auction, 'totalWatchers')) {
							auctionData['totalWatchers'] =
								auction.totalWatchers;
							this.setState({
								totalWatchers: auction.totalWatchers,
							});
						}
						if (_has(auction, 'totalPageViews')) {
							auctionData['totalPageViews'] =
								auction.totalPageViews;
							this.setState({
								totalPageViews: auction.totalPageViews,
							});
						}
						if (_has(auction, 'totalBidsAuction')) {
							auctionData['totalBidsAuction'] =
								auction.totalBidsAuction;
							this.setState({
								totalBidsAuction: auction.totalBidsAuction,
							});
						}
						this.props.updateAuction(auctionData);
					}
				}
			);
		}
	};

	closeSocket = () => {
		const { socket } = this.props;
		if (socket && socket.off) {
			socket.off(
				`${SOCKET.ON_AUCTION_CHANGE}-${this.props.auctionData.auctionId}`
			);
		}
	};

	render() {
		const {
			width,
			showKeyContact,
			showBonusPopover,
			showAbsenteePopover,
			totalWatchers,
			totalPageViews,
			totalBidsAuction,
			targetContact,
			targetBonus,
		} = this.state;

		const {
			assetType,
			assetTitle,
			buyNowClick,
			status,
			listedPrice,
			city,
			state,
			description,
			auctionData,
			gstApplicable,
			isExtended,
			assetContact,
			fromAssetPage,
			assetId,
			className,
		} = this.props;

		const contact = assetContact ? assetContact : auctionData?.contact;
		return (
			<>
				{/* <div className="auction-details-row">
                    <div className={`auction-asset-details ${auctionData?.isEOI ? "eoi-hight" : ""}`}>
                        <OverlayTrigger placement="top" overlay={<Tooltip>{assetType === ASSET_TYPE.BUY_NOW ? assetTitle : auctionData?.auctionName}</Tooltip>}>
                            <h1 className="path-name">{assetType === ASSET_TYPE.BUY_NOW ? assetTitle : auctionData?.auctionName}</h1>
                        </OverlayTrigger>
                        <div className="auction-captions">
                            Sale {auctionData?.auctionNum ? auctionData.auctionNum : assetType} {" | "}
                            {gstApplicable === undefined ? `` : `GST Included ${gstApplicable ? "YES" : "NO"} | `}
                            {auctionData.auctionAddress}
                        </div>
                        <div className="location">
                            <SvgComponent path="location" className="loc-span" />
                            {auctionData?.auctionAddress ? auctionData?.auctionAddress : city?.address}
                        </div>
                        {assetType === ASSET_TYPE.BUY_NOW ? (
                            ""
                        ) : (
                            <div className="date-time">
                                <div className="col-open">
                                    <label>
                                        {" "}
                                        <span>{auctionData?.isEOI ? "EOI" : "Auction"}</span> Opens{" "}
                                    </label>
                                    <Button variant="outline-primary" className="no-pointer">
                                        {dayjs(auctionData?.datetimeOpen).format("hh:mm A")} {getTimezoneName(auctionData?.datetimeOpen)}{" "}
                                        {dayjs(auctionData?.datetimeOpen).format("DD MMM YYYY")}
                                    </Button>
                                </div>
                                <Visible when={!auctionData?.isEOI || (auctionData?.isEOI && !(dayjs(auctionData?.datetimeClose) - dayjs() > ONE_YEAR))}>
                                    <div className="col-close">
                                        <label>
                                            <span>{auctionData?.isEOI ? "EOI" : "Auction"}</span> Ends{" "}
                                        </label>
                                        <Button variant={isExtended ? "primary" : "outline-primary"} className="no-pointer">
                                            {dayjs(auctionData?.datetimeClose).format("hh:mm A")} {getTimezoneName(auctionData?.datetimeClose)}{" "}
                                            {dayjs(auctionData?.datetimeClose).format("DD MMM YYYY")}{" "}
                                        </Button>
                                    </div>
                                </Visible>
                            </div>
                        )}
                    </div>
                    <Visible when={assetType === ASSET_TYPE.BUY_NOW && width <= 767}>
                        <div></div>
                    </Visible>
                    <Visible when={assetType !== ASSET_TYPE.BUY_NOW && width > 767}>
                        <div className="auction-popovers">
                            <div className="online-bidding-block row">
                                <div className="online-svg">
                                    <Visible when={isOnline(auctionData?.auctionType?.name)}>
                                        <SvgComponent path="online"></SvgComponent>
                                    </Visible>
                                    <Visible when={isInRoom(auctionData?.auctionType?.name)}>
                                        <SvgComponent path="Traditional"></SvgComponent>
                                    </Visible>
                                </div>
                                <div className="bid-type">{isInRoom(auctionData?.auctionType?.name) ? LIVE : auctionData?.auctionType?.name}</div>
                            </div>
                            <div className="auction-details">
                                <div className="row mt-2">
                                    <div className="col-6 label">
                                        <span>{auctionData?.isEOI ? "EOI" : "Auction"}</span> No.
                                    </div>
                                    <div className="col-6 val">{assetType === ASSET_TYPE.BUY_NOW ? `#${assetType}` : auctionData?.auctionNum}</div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6 label">Quantity</div>
                                    <div className="col-6 val">{auctionData?.totalAssets ? auctionData?.totalAssets : 0}</div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6 label">Key Contact</div>
                                    <div className="col-6 val">
                                        {auctionData?.contact && auctionData?.contact.name ? (
                                            <>
                                                <Overlay
                                                    trigger="click"
                                                    placement="bottom"
                                                    show={showKeyContact}
                                                    target={targetContact}
                                                    rootClose
                                                    container={this.selectorRef.current}
                                                    containerPadding={20}
                                                    onHide={(e) => this.onKeyContact(e)}
                                                >
                                                    <Popover className="contact-popup">
                                                        <Popover.Title as="h3">
                                                            Key Contacts
                                                            <div className="close-btn" onClick={(e) => this.onKeyContact(e)}>
                                                                <SvgComponent path="close" />
                                                            </div>
                                                        </Popover.Title>
                                                        <Popover.Content>
                                                            {auctionData?.contact?.name && (
                                                                <div className="row mt-2">
                                                                    <div className="col-4 label">Name</div>
                                                                    <div className="col-8 val">{contact.name}</div>
                                                                </div>
                                                            )}
                                                            {auctionData?.contact?.phone && (
                                                                <div className="row mt-2">
                                                                    <div className="col-4 label">Phone</div>
                                                                    <div className="col-8 val">
                                                                        <a href={"tel:" + contact.phone}>{contact.phone}</a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {contact?.mobile && (
                                                                <div className="row mt-2">
                                                                    <div className="col-4 label">Mobile</div>
                                                                    <div className="col-8 val">
                                                                        <a href={"tel:" + contact.mobile}>{contact.mobile}</a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {contact?.email && (
                                                                <div className="row mt-2">
                                                                    <div className="col-4 label">Email</div>
                                                                    <div className="col-8 val">
                                                                        <a href={"mailto:" + contact.email}>{contact.email}</a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Popover.Content>
                                                    </Popover>
                                                </Overlay>
                                                <span className="key-contact" onClick={(e) => this.onKeyContact(e)}>
                                                    {contact?.name}
                                                </span>
                                            </>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                                <Visible when={auctionData?.totalWatchers >= auctionData?.minimumWatchersTreshold}>
                                    <div className="row mt-2">
                                        <div className="col-6 label">Total Watchers</div>
                                        <div className="col-6 val">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Total number of watchers for {auctionData?.isEOI ? "EOI " : "auction "}"
                                                        <strong>{assetType === ASSET_TYPE.BUY_NOW ? assetTitle : auctionData?.auctionName}</strong>"
                                                    </Tooltip>
                                                }
                                            >
                                                <div className="col-6 view-count">
                                                    <span>{totalWatchers ? totalWatchers.toLocaleString() : 0}</span>
                                                </div>
                                            </OverlayTrigger>
                                        </div>
                                    </div>
                                </Visible>
                                <div className="row mt-2">
                                    <Visible when={auctionData?.totalPageViews >= auctionData?.pageViewsThreshold}>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip>
                                                    Total number of views for {ASSET_TYPE.EOI ? "EOI" : "auction"} "
                                                    <strong>{assetType === ASSET_TYPE.BUY_NOW ? assetTitle : auctionData?.auctionName}</strong>"
                                                </Tooltip>
                                            }
                                        >
                                            <div className="col-6 view-count">
                                                <SvgComponent path="visibility_black_24dp" />
                                                <span>{totalPageViews ? totalPageViews.toLocaleString() : "0"} Views</span>
                                            </div>
                                        </OverlayTrigger>
                                    </Visible>
                                    <Visible
                                        when={
                                            auctionData?.totalBidsAuction >= auctionData?.minimumBidsTreshold &&
                                            !auctionData?.isEOI &&
                                            assetType !== ASSET_TYPE.BUY_NOW &&
                                            width > 767
                                        }
                                    >
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip>
                                                    Total number of bids for auction "<strong>{assetType === ASSET_TYPE.BUY_NOW ? assetTitle : auctionData?.auctionName}</strong>"
                                                </Tooltip>
                                            }
                                        >
                                            <div className="col-6 bids-count">
                                                <SvgComponent path="gavel" />
                                                <span>{totalBidsAuction ? totalBidsAuction.toLocaleString() : "0"} Bids</span>
                                            </div>
                                        </OverlayTrigger>
                                    </Visible>
                                </div>
                            </div>
                        </div>
                    </Visible>
                    <Visible when={!auctionData?.isEOI && assetType === ASSET_TYPE.BUY_NOW && width > 767}>
                        <div className="buy-now-options">
                            <div className="current-bid">
                                <Button className="slt-dark bid-amt">
                                    <strong>{listedPrice && toAmount(listedPrice)}</strong>
                                </Button>
                            </div>
                            <Button disabled={status === ASSET_STATUS.UNDER_OFFER} className="btn-buy-now" variant="warning" onClick={buyNowClick}>
                                <SvgComponent path="shopping-cart" /> {status === ASSET_STATUS.UNDER_OFFER ? status : ASSET_STATUS.BUY_NOW}
                            </Button>
                        </div>
                    </Visible>
                </div> */}
				{/* <Visible when={assetType === ASSET_TYPE.BUY_NOW}>
                    <div className="buy-now-asset-detalis">
                        <div className="title">Buy Now</div>
                        <div className="desc">{description}</div>
                        <div className="buy-now-options">
                            <div className="current-bid">
                                <Button className="slt-dark bid-amt">
                                    <strong>{listedPrice && toAmount(listedPrice)}</strong>
                                </Button>
                            </div>
                            <Button disabled={status === ASSET_STATUS.UNDER_OFFER} className="btn-buy-now" variant="warning" onClick={buyNowClick}>
                                <SvgComponent path="shopping-cart" /> {status === ASSET_STATUS.UNDER_OFFER ? status : ASSET_STATUS.BUY_NOW}
                            </Button>
                        </div>
                    </div>
                </Visible> */}

				{/* <Visible when={assetType !== ASSET_TYPE.BUY_NOW}>
                    <div className="auction-buttons-row">
                        <Scrollable>
                            <div className="align-left">
                                <Visible when={auctionData?.isEOI}>
                                    <DownloadAuctionDocuments auctionId={auctionData?.auctionId} assetId={fromAssetPage ? assetId : null} />
                                </Visible>
                                <Visible when={!auctionData?.isEOI}>
                                    <DownloadAuctionDocuments auctionId={auctionData?.auctionId} auctionNum={auctionData?.auctionNum} />
                                </Visible>
                                <Visible when={isInRoom(auctionData?.auctionType?.name)}>
                                    <Button className="btn-call-to-action" onClick={this.printBuyerCard}>
                                        <SvgComponent path="print" /> Print Buyer Card
                                    </Button>
                                </Visible>
                                <Button as={Link} to="/finance" className="btn-call-to-action">
                                    <SvgComponent path="dollor" />
                                    See Finance Options
                                </Button>
                                <Button className="btn-call-to-action" onClick={() => this.setState({ showSalesFeesModal: true })}>
                                    <SvgComponent path="notepad_white" className="sml-icon" />
                                    Sales Notes and Fees
                                </Button>
                            </div>
                            <SalesNotesAndFeesModal show={this.state.showSalesFeesModal} onClose={() => this.setState({ showSalesFeesModal: false })} asset={this.props} />
                            <div className="align-right">
                                <Visible when={isOnline(auctionData?.auctionType?.name)}>
                                    <Overlay
                                        trigger="click"
                                        placement="bottom"
                                        show={showBonusPopover}
                                        target={targetBonus}
                                        rootClose
                                        container={this.BonusRef.current}
                                        containerPadding={20}
                                        onHide={(e) => this.onBonusTime(e)}
                                    >
                                        <Popover id={`popover-positioned-bottom`} className="contact-popup">
                                            <Popover.Title as="h3">
                                                Bonus Time
                                                <div className="close-btn" onClick={(e) => this.onBonusTime(e)}>
                                                    <SvgComponent path="close" />
                                                </div>
                                            </Popover.Title>
                                            <Popover.Content>
                                                <p>
                                                    <strong>What is Bonus time and how does it work?</strong>
                                                </p>
                                                <p>
                                                    The Auction will close at the end of the specified time if there are no successful bids during the 5 minutes preceding the end
                                                    of the time specified. If there are any successful bids within the last 5 minutes of the auction ('bonus time period'), the
                                                    auction will be extended until there are no more bids within the Bonus Time period.
                                                </p>
                                                <p>
                                                    <strong>Why is Bonus time needed?</strong>
                                                </p>
                                                <p>
                                                    Bonus time is a system that is in place to give every buyer a fair chance at winning an item. It is designed to mimic a live
                                                    auction to ensure a bidder has a chance to offer a counter bid. All items are sold. Typical internet-only auctions (think eBay)
                                                    are suspectible to a practice called sniping. Auction sniping is the practice of a bidder waiting until the very last second to
                                                    place a winning bid on an item with the hope that other bidders do not have time to raise their bid. This type of bidding is
                                                    suspectible to sniping bots where user can have a computer program place a bid in a the last millisecond so there is no fair
                                                    chance for the bidder to offer a counter bid.
                                                </p>
                                            </Popover.Content>
                                        </Popover>
                                    </Overlay>
                                    <Button className="btn-call-to-action" onClick={(e) => this.onBonusTime(e)}>
                                        Bonus Time <SvgComponent path="help_outline" />
                                    </Button>
                                </Visible>
                                <Visible when={isInRoom(auctionData?.auctionType?.name) && dayjs(auctionData?.datetimeOpen) > dayjs().add(2, "seconds")}>
                                    <OverlayTrigger
                                        trigger="click"
                                        placement="bottom"
                                        show={showAbsenteePopover}
                                        overlay={
                                            <Popover id={`popover-positioned-bottom`} className="contact-popup">
                                                <Popover.Title as="h3">
                                                    Absentee Bid
                                                    <div className="close-btn" onClick={this.onAbsenteePopover}>
                                                        <SvgComponent path="close" />
                                                    </div>
                                                </Popover.Title>
                                                <Popover.Content>
                                                    <p>
                                                        An absentee bid is only for live/simulcast auctions and is asset-based. This was previously all done manually by phone and
                                                        paper forms where bidders can provide their details and highest bid for a particular item.
                                                    </p>
                                                    <p>
                                                        The new functionally would allow a bidder to enter an absentee bid for live and simulcast auctions only. Users would need to
                                                        be registered so we have their name, email and phone number along with credit card. The user should be able to select an
                                                        item and set a maximum bid they are happy to go to. This would work very similar to an auto bid in online timed auctions
                                                        with the auctioneer bidding on the user's behalf during the live/simulcast auction. The absentee bid will need to be added
                                                        to the sales sheets for auctioneer to view when live bidding commneces.
                                                    </p>
                                                </Popover.Content>
                                            </Popover>
                                        }
                                    >
                                        <Button className="btn-call-to-action" onClick={this.onAbsenteePopover}>
                                            Absentee Bid
                                            <SvgComponent path="help_outline" />
                                        </Button>
                                    </OverlayTrigger>
                                </Visible>
                            </div>
                        </Scrollable>
                    </div>
                </Visible> */}

				{/* ****************************************************** EDIT STARTS ****************************************************** */}

				{/* <div style={{ height: "6em" }}></div> */}

				<div
					className={`auction-details-section assetDetails__infoPanel ${
						className ? className : ''
					}`}
				>
					<div className="assetDetails__infoPanel-wrapper">
						<div className="assetDetails__infoPanel-row">
							<div className="assetDetails__infoPanel-header">
								<Row>
									<Col sm={11}>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{assetType ===
													ASSET_TYPE.BUY_NOW
														? assetTitle
														: auctionData?.auctionName}
												</Tooltip>
											}
										>
											<h2 className="assetDetails__infoPanel-title">
												{assetType ===
												ASSET_TYPE.BUY_NOW
													? assetTitle
													: auctionData?.auctionName}
											</h2>
										</OverlayTrigger>
										<div className="assetDetails__infoPanel-location">
											{auctionData?.auctionAddress
												? auctionData?.auctionAddress
												: city?.address}
										</div>
									</Col>
									<Col sm={1}>
										<div className="online-bidding-block row">
											<div className="online-svg">
												<Visible
													when={isOnline(
														auctionData?.auctionType
															?.name
													)}
												>
													<SvgComponent path="online"></SvgComponent>
												</Visible>

												<div className="bid-type">
													{isInRoom(
														auctionData?.auctionType
															?.name
													)
														? LIVE
														: auctionData
																?.auctionType
																?.name}
												</div>

												<Visible
													when={isInRoom(
														auctionData?.auctionType
															?.name
													)}
												>
													<SvgComponent path="Traditional"></SvgComponent>
												</Visible>
											</div>
											{/* <div className="bid-type">
												{isInRoom(
													auctionData?.auctionType
														?.name
												)
													? LIVE
													: auctionData?.auctionType
															?.name}
											</div> */}
										</div>
									</Col>
								</Row>
							</div>
						</div>

						<div className="assetDetails__infoPanel-row">
							{assetType === ASSET_TYPE.BUY_NOW ? (
								''
							) : (
								<div className="date-time auctionSchedule">
									<Row>
										<Col xl={6}>
											<div className="auctionSchedule__open">
												<label>
													{' '}
													<span>
														{auctionData?.isEOI
															? 'EOI'
															: 'Auction'}
													</span>{' '}
													Opens{' '}
												</label>
												<div className="auctionSchedule__time">
													{dayjs(
														auctionData?.datetimeOpen
													).format('hh:mm A')}{' '}
													{getTimezoneName(
														auctionData?.datetimeOpen
													)}{' '}
													{dayjs(
														auctionData?.datetimeOpen
													).format('DD MMM YYYY')}
												</div>
											</div>
										</Col>
										<Visible
											when={
												!auctionData?.isEOI ||
												(auctionData?.isEOI &&
													!(
														dayjs(
															auctionData?.datetimeClose
														) -
															dayjs() >
														ONE_YEAR
													))
											}
										>
											<Col xl={6}>
												<div className="col-close auctionSchedule__close">
													<label>
														<span>
															{auctionData?.isEOI
																? 'EOI'
																: 'Auction'}
														</span>{' '}
														Ends{' '}
													</label>
													<div
														className={`auctionSchedule__time ${
															isExtended
																? 'primary'
																: 'outline-primary'
														}}`}
													>
														{dayjs(
															auctionData?.datetimeClose
														).format(
															'hh:mm A'
														)}{' '}
														{getTimezoneName(
															auctionData?.datetimeClose
														)}{' '}
														{dayjs(
															auctionData?.datetimeClose
														).format(
															'DD MMM YYYY'
														)}{' '}
													</div>
												</div>
											</Col>
										</Visible>
										<Visible
											when={isOnline(
												auctionData?.auctionType?.name
											)}
										>
											<Col>
												<Overlay
													trigger="click"
													placement="bottom"
													show={showBonusPopover}
													target={targetBonus}
													rootClose
													container={
														this.BonusRef.current
													}
													containerPadding={20}
													onHide={(e) =>
														this.onBonusTime(e)
													}
												>
													<Popover
														id={`popover-positioned-bottom`}
														className="contact-popup"
													>
														<Popover.Title as="h3">
															Bonus Time
															<div
																className="close-btn"
																onClick={(e) =>
																	this.onBonusTime(
																		e
																	)
																}
															>
																<SvgComponent path="close" />
															</div>
														</Popover.Title>
														<Popover.Content>
															<p>
																<strong>
																	What is
																	Bonus time
																	and how does
																	it work?
																</strong>
															</p>
															<p>
																The Auction will
																close at the end
																of the specified
																time if there
																are no
																successful bids
																during the 5
																minutes
																preceding the
																end of the time
																specified. If
																there are any
																successful bids
																within the last
																5 minutes of the
																auction ('bonus
																time period'),
																the auction will
																be extended
																until there are
																no more bids
																within the Bonus
																Time period.
															</p>
															<p>
																<strong>
																	Why is Bonus
																	time needed?
																</strong>
															</p>
															<p>
																Bonus time is a
																system that is
																in place to give
																every buyer a
																fair chance at
																winning an item.
																It is designed
																to mimic a live
																auction to
																ensure a bidder
																has a chance to
																offer a counter
																bid. All items
																are sold.
																Typical
																internet-only
																auctions (think
																eBay) are
																suspectible to a
																practice called
																sniping. Auction
																sniping is the
																practice of a
																bidder waiting
																until the very
																last second to
																place a winning
																bid on an item
																with the hope
																that other
																bidders do not
																have time to
																raise their bid.
																This type of
																bidding is
																suspectible to
																sniping bots
																where user can
																have a computer
																program place a
																bid in a the
																last millisecond
																so there is no
																fair chance for
																the bidder to
																offer a counter
																bid.
															</p>
														</Popover.Content>
													</Popover>
												</Overlay>
												<Button
													className="btn-call-to-action bonus-btn"
													onClick={(e) =>
														this.onBonusTime(e)
													}
												>
													Bonus Time{' '}
													<SvgComponent path="help_outline" />
												</Button>
											</Col>
										</Visible>
									</Row>
								</div>
							)}
						</div>

						<div className="third-col assetDetails__infoPanel-row">
							<div className="auction-details assetDetails__infoPanel-auctionData">
								<div className="row">
									<div className="col-6 label">
										<span>
											{auctionData?.isEOI
												? 'EOI'
												: 'Auction'}
										</span>{' '}
										No.
									</div>
									<div className="col-6 val">
										{assetType === ASSET_TYPE.BUY_NOW
											? `#${assetType}`
											: auctionData?.auctionNum}
									</div>
								</div>
								<div className="row">
									<div className="col-6 label">Quantity</div>
									<div className="col-6 val">
										{auctionData?.totalAssets
											? auctionData?.totalAssets
											: 0}
									</div>
								</div>
								<div className="row">
									<div className="col-6 label">
										Key Contact
									</div>
									<div className="col-6 val">
										{auctionData?.contact &&
										auctionData?.contact.name ? (
											<>
												<Overlay
													trigger="click"
													placement="bottom"
													show={showKeyContact}
													target={targetContact}
													rootClose
													container={
														this.selectorRef.current
													}
													containerPadding={20}
													onHide={(e) =>
														this.onKeyContact(e)
													}
												>
													<Popover className="contact-popup">
														<Popover.Title as="h3">
															Key Contacts
															<div
																className="close-btn"
																onClick={(e) =>
																	this.onKeyContact(
																		e
																	)
																}
															>
																<SvgComponent path="close" />
															</div>
														</Popover.Title>
														<Popover.Content>
															{auctionData
																?.contact
																?.name && (
																<div className="row mt-2">
																	<div className="col-4 label">
																		Name
																	</div>
																	<div className="col-8 val">
																		{
																			contact.name
																		}
																	</div>
																</div>
															)}
															{auctionData
																?.contact
																?.phone && (
																<div className="row mt-2">
																	<div className="col-4 label">
																		Phone
																	</div>
																	<div className="col-8 val">
																		<a
																			href={
																				'tel:' +
																				contact.phone
																			}
																		>
																			{
																				contact.phone
																			}
																		</a>
																	</div>
																</div>
															)}
															{contact?.mobile && (
																<div className="row mt-2">
																	<div className="col-4 label">
																		Mobile
																	</div>
																	<div className="col-8 val">
																		<a
																			href={
																				'tel:' +
																				contact.mobile
																			}
																		>
																			{
																				contact.mobile
																			}
																		</a>
																	</div>
																</div>
															)}
															{contact?.email && (
																<div className="row mt-2">
																	<div className="col-4 label">
																		Email
																	</div>
																	<div className="col-8 val">
																		<a
																			href={
																				'mailto:' +
																				contact.email
																			}
																		>
																			{
																				contact.email
																			}
																		</a>
																	</div>
																</div>
															)}
														</Popover.Content>
													</Popover>
												</Overlay>
												<span
													className="key-contact"
													onClick={(e) =>
														this.onKeyContact(e)
													}
												>
													{contact?.name}
												</span>
											</>
										) : (
											''
										)}
									</div>
								</div>
								<Visible
									when={
										auctionData?.totalWatchers >=
										auctionData?.minimumWatchersTreshold
									}
								>
									<div className="row">
										<div className="col-6 label">
											Total Watchers
										</div>
										<div className="col-6 val">
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														Total number of watchers
														for{' '}
														{auctionData?.isEOI
															? 'EOI '
															: 'auction '}
														"
														<strong>
															{assetType ===
															ASSET_TYPE.BUY_NOW
																? assetTitle
																: auctionData?.auctionName}
														</strong>
														"
													</Tooltip>
												}
											>
												<div className="col-6 view-count">
													<span>
														{totalWatchers
															? totalWatchers.toLocaleString()
															: 0}
													</span>
												</div>
											</OverlayTrigger>
										</div>
									</div>
								</Visible>
							</div>
						</div>

						<div className="fourth-col assetDetails__infoPanel-row">
							<div className="assetDetails__infoPanel-meta">
								<Row>
									<Visible
										when={
											auctionData?.totalPageViews >=
											auctionData?.pageViewsThreshold
										}
									>
										<Col sm={4}>
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														Total number of views
														for{' '}
														{ASSET_TYPE.EOI
															? 'EOI'
															: 'auction'}{' '}
														"
														<strong>
															{assetType ===
															ASSET_TYPE.BUY_NOW
																? assetTitle
																: auctionData?.auctionName}
														</strong>
														"
													</Tooltip>
												}
											>
												<div className="view-count">
													<SvgComponent path="visibility_black_24dp" />
													<span>
														{totalPageViews
															? totalPageViews.toLocaleString()
															: '0'}{' '}
														Views
													</span>
												</div>
											</OverlayTrigger>
										</Col>
									</Visible>
									<Visible
										when={
											auctionData?.totalBidsAuction >=
												auctionData?.minimumBidsTreshold &&
											!auctionData?.isEOI &&
											assetType !== ASSET_TYPE.BUY_NOW &&
											width > 767
										}
									>
										<Col sm={4}>
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														Total number of bids for
														auction "
														<strong>
															{assetType ===
															ASSET_TYPE.BUY_NOW
																? assetTitle
																: auctionData?.auctionName}
														</strong>
														"
													</Tooltip>
												}
											>
												<div className="bids-count">
													<SvgComponent path="gavel2" />
													<span>
														{totalBidsAuction
															? totalBidsAuction.toLocaleString()
															: '0'}{' '}
														Bids
													</span>
												</div>
											</OverlayTrigger>
										</Col>
									</Visible>
								</Row>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
}
export default AuctionAssetDetails;
