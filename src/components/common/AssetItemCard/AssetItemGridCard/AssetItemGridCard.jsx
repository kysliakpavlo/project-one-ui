import React from "react";
import dayjs from "dayjs";
import _get from "lodash/get";
import { useHistory } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Visible from "../../Visible";
import NotifyMe from "../../NotifyMe";
import SvgComponent from "../../SvgComponent";
import CountdownTimer from "../../CountdownTimer";
import AssetCardImages from "../../AssetCardImages";
import DownloadAuctionDocuments from "../../DownloadAuctionDocuments";
import { ASSET_STATUS, ASSET_TYPE, AUCTION_TYPES_MAP, AUCTION_TYPES, MESSAGES } from "../../../../utils/constants";
import { isInRoom, toAmount, toUrlString, preventEvent, encrypt, getTimezoneName } from "../../../../utils/helpers";
import BidHistoryComponent from "../../BidHistory";

// UI Elements
import CardTitle from "../../../ui/CardTitle";
import CardTag from "../../../ui/CardTag";

import "./AssetItemGridCard.scss";

const AssetItemGridCard = ({
	className = "",
	item,
	onAddToWatchList,
	showMessage,
	isLoggedIn,
	toggleLogin,
	loggedInUser,
	notificationUpdate,
	onCompleteTimer,
	onCardShowAction,
	openAssetDetails,
	itemWonPage,
	onPayClick,
	getBidValues,
	paymentHistoryPage,
	searchCrietria,
	groupName,
	setDetailsAsset,
}) => {
	const history = useHistory();
	const closeTime = dayjs(item?.datetimeClose);
	const startTime = dayjs(item.auctionData?.datetimeOpen);
	const now = dayjs().add(2, "seconds");

	const isStarted = item && item.auctionData && dayjs(item.auctionData.datetimeOpen).diff(dayjs(), "milliseconds") <= 0;
	const isEOI = item && item.auctionData && item.auctionData.isEOI;
	const auctionType = _get(item, "auctionData.auctionType.name");
	const assetStatusClosed = item?.status === ASSET_STATUS.SOLD || item?.status === ASSET_STATUS.REFERRED || item?.status === ASSET_STATUS.PASSED_IN;
	const classes = [className];
	let statusTag;

	if (onCompleteTimer == true) {
		console.log("the truethhhh");
	}

	if (closeTime <= now || assetStatusClosed) {
		statusTag = "Closed";
		classes.push("closed-asset");
	} else if (!isStarted) {
		statusTag = "Opening Soon";
		classes.push("opening-soon-asset");
	} else if (item.isExtended && !assetStatusClosed) {
		classes.push("bonus-time-card");
	}
	const isNotifyAllowed = statusTag !== "Closed" && !(isStarted && AUCTION_TYPES_MAP[item.auctionData?.auctionType?.name] === AUCTION_TYPES.IN_ROOM);

	const joinLiveAuction = (e) => {
		preventEvent(e);
		const itemObj = toUrlString({
			auctionId: item.auctionData?.auctionId,
			timeZone: item.timezoneName,
			location: item.state?.name,
			auctionName: item.auctionName,
			auctionNumber: item.auctionNum,
			startDate: item.datetimeOpen,
			endDate: item.datetimeClose,
		});
		if (loggedInUser && loggedInUser.role === "Admin") {
			history.push(`/admin-console/${encrypt(item.auctionData?.auctionId)}`);
		} else if (!isLoggedIn) {
			toggleLogin(true, () => callTermsCondition(itemObj, item.termsAgreed, item.auctionData?.auctionId));
		} else {
			getBidValues({
				assetId: item.assetId,
				auctionId: item.auctionData?.auctionId,
			}).then((res) => {
				if (loggedInUser && !loggedInUser.cardExist) {
					showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
					history.push(`/profile?onComplete=/terms-condition?${itemObj}`);
				} else if (res && res.result && res.result.termsAgreed) {
					history.push(`/simulcast-auction/${encrypt(item.auctionData?.auctionId)}`);
				} else {
					callTermsCondition(itemObj, item.termsAgreed, item.auctionData?.auctionId);
				}
			});
		}
	};

	const callTermsCondition = (item, terms, auctionId) => {
		if (loggedInUser && loggedInUser.role === "Admin") {
			history.push(`/admin-console/${encrypt(auctionId)}`);
		} else if (loggedInUser && !loggedInUser.cardExist) {
			showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
			history.push(`/profile?onComplete=/terms-condition?${item}`);
		} else if (!terms) {
			history.push(`/terms-condition?${item}`);
		} else if (isLoggedIn) {
			history.push(`/simulcast-auction/${encrypt(auctionId)}`);
		}
	};

	return (
		<Card className={`assetGridCard asset-item-grid-card no-hover ${classes.join(" ")}`}>
			{/* <OverlayTrigger placement="top" overlay={<Tooltip>{item.title}</Tooltip>}>
                <Card.Header>{item.title}</Card.Header>
            </OverlayTrigger> */}

			<AssetCardImages
				image={item.assetImageUrl}
				totalImages={item.totalAssetImages}
				spinCar={item.spincar}
				assetId={item.assetId}
				isLoggedIn={isLoggedIn}
				toggleLogin={toggleLogin}
				isWatchListed={item.isWatchListed}
				addToWatchlist={onAddToWatchList}
				isExtended={item.isExtended}
				status={item.status}
				auctionNum={item?.auctionData?.auctionNum}
				consignmentNo={item?.consignmentNo}
				assetStatusClosed={assetStatusClosed}
				onClick={openAssetDetails}
				spincarClick={(e) => onCardShowAction(e, "spin-car", item)}
				searchCrietria={searchCrietria}
				groupName={groupName}
				setDetailsAsset={setDetailsAsset}
			/>

			<OverlayTrigger placement="top" overlay={<Tooltip>{item.title}</Tooltip>}>
				<CardTitle title={item.title} />
			</OverlayTrigger>

			<div className="asset-basic-details assetAttributes">
				<Visible when={_get(item, "transmission") || _get(item, "odoMeter")}>
					{/* <Row> */}
						<OverlayTrigger placement="top" overlay={<Tooltip>{item?.transmission}</Tooltip>}>
							{/* <Col xs={6} className="detail assetAttributes__item"> */}
								<div className="detail assetAttributes__item">
								<SvgComponent path="sync-alt" />
								{item?.transmission}
								</div>
							{/* </Col> */}
						</OverlayTrigger>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									KM: {Number(item?.odoMeter).toLocaleString()}
									{" Showing"}
								</Tooltip>
							}
						>
							{/* <Col xs={6} className="detail assetAttributes__item"> */}
							<div className="detail assetAttributes__item">

								<SvgComponent path="direction-car" />
								{Number(item?.odoMeter).toLocaleString()} KM
							</div>								
							{/* </Col> */}
						</OverlayTrigger>
					{/* </Row> */}
				</Visible>

				
				<Visible when={item.assetType !== ASSET_TYPE.BUY_NOW}>
					<OverlayTrigger placement="top" overlay={<Tooltip>Lot: {item?.lotNo}</Tooltip>}>
						<div className="assetAttributes__item detail">
							<SvgComponent path="lot-no" />
							Lot: {_get(item, "lotNo", "")}
						</div>
					</OverlayTrigger>
				</Visible>
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip>
							{item.assetSuburbState ? _get(item, "assetSuburbState", "") : `${_get(item, "city.name", "")}, ${_get(item, "state.name", "")}`}
							{/* {_get(item, "city.name", "")}, {_get(item, "state.name", "")} */}
						</Tooltip>
					}
				>
					<div className="assetAttributes__item detail">
						<SvgComponent path="location" />
						{/* {_get(item, "city.name", "")}, {_get(item, "state.name", "")} */}
						{item.assetSuburbState ? _get(item, "assetSuburbState", "") : `${_get(item, "city.name", "")}, ${_get(item, "state.name", "")}`}
					</div>
				</OverlayTrigger>
				

			</div>

			<div className="asset-action-section auctionAttributes">
				<Visible when={item.assetType !== ASSET_TYPE.BUY_NOW && !isEOI && !paymentHistoryPage}>
					<Card.Text as="div" className="time-remaining auctionAttributes__timer">
						<div className="timer-wrap auctionAttributes__timer-clock">
							<CountdownTimer 
								heading={"Auction Ends in:"}
								bonusTime={item.isExtended} 
								time={!assetStatusClosed ? item.datetimeClose : dayjs()} 
								onComplete={onCompleteTimer} 
							/>
						</div>
					</Card.Text>
				</Visible>
				<Visible when={!isEOI && !paymentHistoryPage}>
					{item.assetType === ASSET_TYPE.BUY_NOW ? null : closeTime <= now || item.currentBidAmount || item.startingBid ? (
						<div className="current-bid auctionAttributes__currentBid">
							{closeTime <= now || assetStatusClosed ? (
								<strong className="small-bold">
									Bidding Closed
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												This auction was closed at {dayjs(item.auctionData?.datetimeClose).format("hh:mm A")}{" "}
												{getTimezoneName(item.auctionData?.datetimeClose)} {dayjs(item.auctionData?.datetimeClose).format("DD MMM YYYY")}{" "}
											</Tooltip>
										}
									>
										<SvgComponent path="help_outline" />
									</OverlayTrigger>
								</strong>
							) : item.currentBidAmount ? (
								<>
									<div className="auctionAttributes__currentBid-label">
										Current Bid:
									</div>
									<div className="auctionAttributes__currentBid-amount">
										{toAmount(item.currentBidAmount)}
									</div>
								</>
							) : item.startingBid ? (
								<>
									<div className="auctionAttributes__currentBid-label">
										Starting Bid:
									</div>
									<div className="auctionAttributes__currentBid-amount">
										<div>
											{toAmount(item.startingBid)}
										</div>
										<div className="asset-actions auctionAttributes__actions">
											<Visible when={item.assetType !== ASSET_TYPE.BUY_NOW && !isEOI && !isInRoom(auctionType)}>
												<BidHistoryComponent
													className="dark-grey-button bid-history"
													loggedInUser={loggedInUser}
													auctionId={item?.auctionData?.auctionId}
													count="Bid History"
													assetId={item.assetId}
													hideText={true}
													key={item.assetId}
												/>
											</Visible>
											{/* <Button className="dark-grey-button bid-history" onClick={showBidHistoryPanel}>Bid History</Button> */}
											<Visible when={paymentHistoryPage}>
												<div className="receipt-block">
													<DownloadAuctionDocuments
														auctionId={item?.auctionData?.auctionId}
														assetId={item?.assetId}
														consignmentNo={item?.consignmentNo}
														auctionNum={item?.auctionData?.auctionNum}
														invoice={true}
													/>
												</div>
											</Visible>
										</div>
									</div>
								</>
							) : null}
						</div>
					) : null}
				</Visible>
				<Visible when={paymentHistoryPage}>
					<div className="current-bid">
						<strong>Current Bid: $000</strong>{" "}
					</div>
				</Visible>

				<Visible when={isEOI}>
					<DownloadAuctionDocuments assetId={item.assetId} auctionId={item.auctionData?.auctionId} />
				</Visible>
				<Visible when={itemWonPage}>
					<div className="overdiv-info">
						<div>
							{" "}
							<b>My highest bid:</b>{" "}
							{item.myHighestBid?.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
								minimumFractionDigits: 0,
							})}{" "}
						</div>
						<div className="item-won-cup">
							<SvgComponent path="emoji_events_black_24dp" /> Highest Bidder
						</div>
						<Visible when={item.paymentStatus}>
							<div className={item.paymentStatus === "PAID" ? "paid-status payment-info" : "payment-info"}>
								<div className="overdue-info">{item.paymentStatus ? item.paymentStatus : "UNPAID"}</div>
							</div>
						</Visible>
						<div className="contact-info">
							<DownloadAuctionDocuments
								auctionId={item?.auctionData?.auctionId}
								assetId={item?.assetId}
								auctionNum={item?.auctionData?.auctionNum}
								consignmentNo={item?.consignmentNo}
								invoice={true}
								label={window.screen.width < 1024 ? " " : "Invoice"}
							/>
							{item.auctionData.auctionAdmin?.mobile && (
								<a className="invoice-link" href={`tel:${item.auctionData.auctionAdmin?.mobile}`}>
									<span>
										<SvgComponent path="call_white_24dp" />{" "}
									</span>
								</a>
							)}
							<a className="invoice-link" href={`mailto:${item.auctionData.auctionAdmin?.email}?subject=Consignment No: ${item.consignmentNo}`}>
								<span>
									<SvgComponent path="email_white_24dp" />{" "}
								</span>
							</a>
						</div>
					</div>
				</Visible>
			</div>
			
			<Visible when={!isEOI && !assetStatusClosed && !isInRoom(auctionType) && startTime <= now && closeTime >= now}>
				<div className="place-bid placeBid">
					<Button className={"placeBid__bidNow"} variant="secondary" onClick={(e) => onCardShowAction(e, "placebid", item)}>
						Bid Now
					</Button>
					<Visible when={item.highestBidder}>
						<OverlayTrigger placement="auto" overlay={<Tooltip>You are currently the highest bidder.</Tooltip>}>
							<span className="highest-bidder-indicator">
								<SvgComponent path="gavel" />
							</span>
						</OverlayTrigger>
					</Visible>
					<Button onClick={openAssetDetails} className={"placeBid__viewDetails"}>View Details</Button>

					<Visible when={!isEOI && item.assetType !== ASSET_TYPE.BUY_NOW && isNotifyAllowed && !paymentHistoryPage}>
						<NotifyMe
							assetId={item.assetId}
							notifiedUser={item.isNotified}
							auctionId={item.auctionData?.auctionId}
							notificationUpdate={notificationUpdate}
							dataTimeClose={item.datetimeClose}
						/>
					</Visible>
				</div>
			</Visible>
			<Visible when={!isEOI && !assetStatusClosed && isInRoom(auctionType) && closeTime >= now}>
				<div className="place-bid">
					<Visible when={item?.displayJoinAuction}>
						<Button className="join-live-btn" variant="secondary" onClick={joinLiveAuction}>
							<SvgComponent path="gavel" />
							Join Live
						</Button>
					</Visible>
					<Visible when={startTime > now}>
						<Button onClick={openAssetDetails}>View Details</Button>
						<Button variant="secondary" className="absentee-bid" onClick={(e) => onCardShowAction(e, "placebid", item)}>
							Absentee Bid
						</Button>
					</Visible>
					<Visible when={!isEOI && item.assetType !== ASSET_TYPE.BUY_NOW && isNotifyAllowed && !paymentHistoryPage}>
						<NotifyMe
							assetId={item.assetId}
							notifiedUser={item.isNotified}
							auctionId={item.auctionData?.auctionId}
							notificationUpdate={notificationUpdate}
							dataTimeClose={item.datetimeClose}
						/>
					</Visible>
				</div>
			</Visible>

			{/* Display for Buy Now only at bottom of card */}
			<Visible when={!isEOI && !paymentHistoryPage}>
				{item.assetType === ASSET_TYPE.BUY_NOW ? (
					<div className="buy-now">
						<div className="current-bid">
							<strong>{toAmount(item.listedPrice)}</strong>
						</div>
						<Button className="btn-buy-now" variant="secondary" disabled={item.status === ASSET_STATUS.UNDER_OFFER} onClick={openAssetDetails}>
							<SvgComponent path="shopping-cart" />
							{item.status === ASSET_STATUS.UNDER_OFFER ? item.status : ASSET_STATUS.BUY_NOW}
						</Button>
					</div>
				) : closeTime <= now || item.currentBidAmount || item.startingBid ? (
					<div className="current-bid">{closeTime <= now || assetStatusClosed ? null : item.currentBidAmount ? null : item.startingBid ? null : null}</div>
				) : null}
			</Visible>
		</Card>
	);
};

export default AssetItemGridCard;
