import React, { lazy, Suspense } from "react";
import dayjs from "dayjs";
import _isEmpty from "lodash/isEmpty";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Visible from "../Visible";
import { getTimezoneName } from "../../../utils/helpers";
import SvgComponent from "../SvgComponent";
import CountdownTimer, { TextRenderer } from "../CountdownTimer";
import { encrypt, toUrlString, isInRoom, constructImageUrl } from "../../../utils/helpers";
import { AUCTION_TYPES_MAP, AUCTION_TYPES, AUCTION_SITE_TYPE, LIVE, DEFAULT_IMAGE, ONE_YEAR, MESSAGES } from "../../../utils/constants";

// UI Elements
import CardTitle from "../../ui/CardTitle";
import CardTag from "../../ui/CardTag";

import "./AuctionCard.scss";

const NotifyMe = lazy(() => import("../../common/NotifyMe"));
const DownloadAuctionDocuments = lazy(() => import("../../common/DownloadAuctionDocuments"));

class AuctionCard extends React.Component {
	state = {
		auction: {},
		isAuctionClosed: false,
		width: 0,
		asset: null,
		noImages: true,
		imageUrl: null,
		imageIndex: 0,
		auctionImages: [],
	};
	componentDidMount() {
		if (this.props.auction) {
			this.setState({
				auction: this.props.auction,
				imageUrl: this.props.auction?.auctionImageUrl,
				width: window.innerWidth,
			});
			if (this.props.liveComponent) {
				this.setState({
					imageUrl: this.props.auction?.auctionImageUrl,
				});
			}
			window.addEventListener("resize", this.updateDimensions);
		}
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	}

	updateDimensions = () => {
		this.setState({ width: window.innerWidth });
	};

	onCompleteTimer = () => {
		this.setState({ isAuctionClosed: true });
	};

	notificationUpdate = (message) => {
		this.props.showMessage({ message: message });
		const tempAuction = { ...this.state.auction, isNotified: true };
		this.setState({ auction: tempAuction });
	};

	validateUser = (e, item) => {
		e.stopPropagation();
		e.preventDefault();
		const itemObj = toUrlString({
			auctionId: item.auctionId,
			timeZone: item.timezoneName,
			location: item.state.name,
			auctionName: item.auctionName,
			auctionNumber: item.auctionNum,
			startDate: item.datetimeOpen,
			endDate: item.datetimeClose,
		});
		if ((this.props.loggedInUser && this.props.loggedInUser.role === "Admin") || item.termsAgreed) {
			this.callTermsCondition(itemObj, true, item.auctionId);
		} else if (!this.props.isLoggedIn) {
			this.props.toggleLogin(true, () => this.callTermsCondition(itemObj, item.termsAgreed, item.auctionId));
		} else {
			this.callTermsCondition(itemObj, item.termsAgreed, item.auctionId);
		}
	};

	callTermsCondition = (item, terms, auctionId) => {
		if (this.props.loggedInUser && this.props.loggedInUser.role === "Admin") {
			this.props.history.push(`/admin-console/${encrypt(auctionId)}`);
		} else if (this.props.loggedInUser && !this.props.loggedInUser.cardExist) {
			this.props.showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
			this.props.history.push(`/profile?onComplete=/terms-condition?${item}`);
		} else if (!terms) {
			this.props.history.push(`/terms-condition?${item}`);
		} else if (this.props.isLoggedIn) {
			this.props.history.push(`/simulcast-auction/${encrypt(auctionId)}`);
		}
	};

	navigateToAuctionCatalog = (buttonClick) => {
		if (this.props.location.pathname === "/" || this.props.location.pathname === "/home") {
			this.props.setHomeAuction(this.state.auction.auctionId);
		} else {
			this.props.setDetailsAuction(this.state.auction.auctionId);
		}
		if (this.state.auction?.isEOI && buttonClick) {
			this.props.history.push(`/expression-of-interest-catalogue/${this.state.auction?.auctionNum}`);
		} else if (buttonClick) {
			this.props.history.push(`/auction-catalogue/${this.state.auction?.auctionNum}`);
		}
		this.props.liveComponent && this.props.handleScrollConflicts();
	};
	getUrlForCard = () => {
		let url = "";
		if (this.state.auction?.isEOI) {
			url = `/expression-of-interest-catalogue/${this.state.auction?.auctionNum}`;
		} else {
			url = `/auction-catalogue/${this.state.auction?.auctionNum}`;
		}
		return url.trim(" ");
	};
	getImages = () => {
		if (_isEmpty(this.state.auctionImages) && parseInt(this.state.auction?.totalAuctionImages) > 1) {
			this.props.getAuctionImages({ auctionId: this.state.auction?.auctionId }).then((res) => {
				this.setState({ auctionImages: res.result });
			});
		}
	};

	onLeftArrow = (e) => {
		e.stopPropagation();
		e.preventDefault();
		this.getImages();
		const nextIndex = this.state.imageIndex - 1;
		this.setState({
			imageIndex: nextIndex < 0 ? parseInt(this.state.auction?.totalAuctionImages) - 1 : nextIndex,
		});
	};

	onRightArrow = (e) => {
		e.stopPropagation();
		e.preventDefault();
		this.getImages();
		const nextIndex = this.state.imageIndex + 1;
		this.setState({
			imageIndex: nextIndex >= parseInt(this.state.auction?.totalAuctionImages) ? 0 : nextIndex,
		});
	};

	render() {
		const { auction, width } = this.state;
		const startTime = dayjs(auction?.datetimeOpen);
		const closeTime = dayjs(auction?.datetimeClose);
		const now = dayjs();
		let statusClass;

		let statusTag;
		let dateTag;
		let timeTag;
		let endDateTag;
		let endTimeTag;
		let isNextYear = false;
		const diff = closeTime - now;

		if (diff > ONE_YEAR) {
			isNextYear = true;
		}

		if (startTime <= now && closeTime > now) {
			statusTag = "Open Now";
			statusClass = "auction-now-open";
			dateTag = closeTime.format("DD MMM");
			timeTag = `Ends : ${closeTime.format("hh:mm A")} ${getTimezoneName(closeTime)}`;
		} else if (startTime <= now && closeTime <= now) {
			statusTag = "Closed";
			statusClass = "auction-closed";
			dateTag = closeTime.format("DD MMM");
			timeTag = `Ends : ${closeTime.format("hh:mm A")} ${getTimezoneName(closeTime)}`;
		} else if (startTime > now) {
			statusTag = `Opening Soon`;
			dateTag = startTime.format("DD MMM");
			timeTag = `Starts : ${startTime.format("hh:mm A")} ${getTimezoneName(startTime)}`;
			endDateTag = closeTime.format("DD MMM YYYY");
			endTimeTag = `${closeTime.format("hh:mm A")} ${getTimezoneName(startTime)}`;
			statusClass = "auction-open-soon";
		}

		if (auction?.auctionType?.name === AUCTION_TYPES.EOI) {
			statusClass = "status-eoi";
			statusTag = "Expression of Interest";
			auction.isEOI = true;
		}

		const isNotifyAllowed =
			statusTag !== "Auction Closed" &&
			AUCTION_TYPES_MAP[auction?.auctionType?.name] !== AUCTION_TYPES.EOI &&
			!(statusTag === "Auction now open" && AUCTION_TYPES_MAP[auction?.auctionType?.name] === AUCTION_TYPES.IN_ROOM);

		return (
			<Suspense>
				<div className="auction-card auctionCard">
					{/* <Visible when={width <= 1180}>
                        <OverlayTrigger placement="top" overlay={<Tooltip>{auction?.auctionName}</Tooltip>}>
                            <CardTitle title={auction?.auctionName} />
                        </OverlayTrigger>
                    </Visible> */}
					<Card className={`${auction?.currentlyLive && statusTag !== "Auction Closed" ? "live-card" : ""}`}>
						<Card.Body>
							<div className="auctionCard__image">
								<Link to={this.getUrlForCard}>
									<Card.Img
										onClick={() => this.navigateToAuctionCatalog}
										loading="lazy"
										src={
											_isEmpty(this.state.auctionImages)
												? this.state.imageUrl
													? this.state.imageUrl
													: DEFAULT_IMAGE
												: this.state.auctionImages[this.state.imageIndex].imageUrl
										}
										onLoad={(e) =>
											constructImageUrl(
												_isEmpty(this.state.auctionImages)
													? this.state.imageUrl
														? this.state.imageUrl
														: DEFAULT_IMAGE
													: this.state.auctionImages[this.state.imageIndex].imageUrl,
												e.target
											)
										}
										alt={auction?.auctionName}
									/>
								</Link>
								{!_isEmpty(this.props.auction?.totalAuctionImages) && this.props.auction?.totalAuctionImages > 1 && (
									<>
										<span
											className="navigate-prev-btn"
											onClick={(e) => this.onLeftArrow(e)}
										>
											<SvgComponent path="arrow-prev" />
										</span>
										<span
											className="navigate-next-btn"
											onClick={(e) => this.onRightArrow(e)}
										>
											<SvgComponent path="arrow-next" />
										</span>
									</>
								)}
							</div>

							<div className="details-block auctionCard__details">
								<CardTag
									statusClass={statusClass}
									statusTag={statusTag}
								/>

								<OverlayTrigger
									placement="top"
									overlay={<Tooltip>{auction?.auctionName}</Tooltip>}
								>
									<CardTitle title={auction?.auctionName} />
								</OverlayTrigger>

								{/* <Visible when={width > 1024}> */}
								<div className="location-detals assetAttributes">
									<div className="assetAttributes__item">
										{/* <div className="label">Location</div> */}
										<div className="address-details">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="14"
												height="20"
												viewBox="0 0 14 20"
												fill="none"
											>
												<path
													d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 3.13 10.87 0 7 0ZM2 7C2 4.24 4.24 2 7 2C9.76 2 12 4.24 12 7C12 9.88 9.12 14.19 7 16.88C4.92 14.21 2 9.85 2 7Z"
													fill="var(--cta-color-1)"
												/>
												<path
													d="M7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9Z"
													fill="var(--cta-color-1)"
												/>
											</svg>
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														{auction?.auctionSuburbState
															? auction?.auctionSuburbState
															: `${auction?.city ? auction?.city.name : ""}, ${auction?.state ? auction?.state.name : ""}`}
													</Tooltip>
												}
											>
												<p>
													{auction?.auctionSuburbState
														? auction?.auctionSuburbState
														: `${auction?.city ? auction?.city.name : ""}, ${auction?.state ? auction?.state.name : ""}`}
												</p>
											</OverlayTrigger>
										</div>
									</div>

									<div className="assetAttributes__item">
										{/* online bidding */}
										<div className="bid-type">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="19"
												height="19"
												viewBox="0 0 19 19"
												fill="none"
											>
												<path
													d="M10.8211 17.2171V19H0V17.2171H10.8211ZM11.3495 0L18.3634 6.93356L17.0883 8.19583L16.1324 7.88027L13.8988 10.0857L19 15.1285L17.7249 16.389L12.6246 11.3462L10.4568 13.4892L10.712 14.4983L9.43598 15.7587L2.42212 8.82519L3.6981 7.5647L4.71709 7.81608L10.3927 2.2063L10.0744 1.26138L11.3495 0ZM11.987 3.15211L5.61073 9.45454L8.79843 12.6066L15.1748 6.30421L11.987 3.15211Z"
													fill="var(--cta-color-1)"
												/>
											</svg>
											<p>
												{isInRoom(auction?.auctionType?.name) ? LIVE : auction?.auctionType?.name}
												&nbsp; Bidding
											</p>
										</div>
									</div>
								</div>

								{/* <div class="row">

                  </div> */}

								<div className="row bidding-details">
									<div className="col-4 pt-3">
										<div className="label">
											<p>Auction Ends:</p>
										</div>
										<span className="date-tag"> {dateTag} </span>
									</div>
									<div className="col-8 pt-3 countdown-1">
										<Visible when={!auction?.isEOI || (auction?.isEOI && !isNextYear)}>
											<Visible when={!auction?.isEOI || (auction?.isEOI && !isNextYear)}>
												{/* <p>
                            {statusTag === "Opening Soon"
                              ? `Ending:`
                              : `Time Remaining:`}
                          </p> */}

												{statusTag !== "Opening Soon" && (
													<CountdownTimer
														// renderer={TextRenderer}
														time={closeTime}
														onComplete={this.onCompleteTimer}
														heading={statusTag === "Opening Soon" ? `Ending:` : `Time Remaining:`}
														//   bonusTime={item.isExtended}
													/>
												)}
												{statusTag === "Opening Soon" && (
													<>
														<strong>
															<span>{endDateTag} </span>
															<span>{endTimeTag}</span>
														</strong>
													</>
												)}
											</Visible>
										</Visible>
									</div>
									{/* 
                    <div className="col-4 pt-3 countdown-2">
                      {statusTag !== "Opening Soon" && (
                        <CountdownTimer
                          // renderer={TextRenderer}
                          time={closeTime}
                          onComplete={this.onCompleteTimer}
                        />
                      )}
                    </div> */}
								</div>
								{/* </Visible> */}

								<div className="img-bottom">
									<Button
										className="view-btn"
										onClick={() => this.navigateToAuctionCatalog(true)}
									>
										View {this.state.auction?.totalAssets} {this.state.auction?.totalAssets > 1 ? "listings" : "listing"}
									</Button>
									{isNotifyAllowed && !this.props.liveComponent && (
										<NotifyMe
											auctionId={this.state.auction?.auctionId}
											dataTimeClose={auction?.datetimeClose}
											notificationUpdate={this.notificationUpdate}
											notifiedUser={this.state.auction?.isNotified}
										/>
									)}
								</div>
							</div>
						</Card.Body>
					</Card>
				</div>
			</Suspense>
		);
	}
}

export default withRouter(AuctionCard);
