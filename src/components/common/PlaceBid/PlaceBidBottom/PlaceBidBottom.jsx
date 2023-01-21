import React from "react";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Visible from "../../Visible";
import SvgComponent from "../../SvgComponent";
import PlaceBid from "../";
import { preventEvent, encrypt, toUrlString, isInRoom, isOnline } from "../../../../utils/helpers";
import { MESSAGES } from "../../../../utils/constants";
import { withRouter } from "react-router";
import "./PlaceBidBottom.scss";
import dayjs from "dayjs";
import onClickOutside from "react-onclickoutside";
class PlaceBidBottom extends React.Component {

	state = {
		activeEventKey: "0",
		width: window.innerWidth,
		removePlaceBid: true,
		isShown: this.props.isShown
	};

	componentDidMount() {
		window.addEventListener("resize", this.updateDimensions);
	}

	componentDidUpdate(prevState) {
		if(prevState.isShown !== this.props.isShown) {
			if(this.props.isShown) {
				this.setState({ activeEventKey: null });
			}
		}
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	}

	handleClickOutside = (evt) => {
		if (evt.target?.nodeName !== "HTML") {
			const placeBidModal = document.getElementById("place-bid-modal")?.className?.includes("modal-dialog");
			const accordionId = document.getElementById("place-bid-accordion")?.className?.includes("show");
			if (accordionId && !placeBidModal) {
				this.setState({ removePlaceBid: false });
				setTimeout(() => {
					this.setState({ removePlaceBid: true });
				}, 1);
			}
		}
	};
	
	updateDimensions = () => {
		this.setState({ width: window.innerWidth });
	};

	onPlaceBidConfirm = (data) => {
		this.props
			.confirmBid(data)
			.then((res) => {
				this.props.showMessage({
					message: (
						<div>
							<div>
								{data.bidType === "absentee-bid" ? (
									<span>{MESSAGES.ABSENTEE_BID}</span>
								) : data.bidType === "auto" ? (
									<span>{MESSAGES.AUTO_BID}</span>
								) : (
									<span>{MESSAGES.BID_PLACED}</span>
								)}
							</div>
						</div>
					),
					messageId: "absenteeBid",
				});
				this.onPlaceBidClose();
				this.setState({ removePlaceBid: false });
				setTimeout(() => {
					this.setState({ removePlaceBid: true });
				}, 1);
			})
			.catch((err) => {
				this.props.showMessage({ message: err.message, type: "error" });
			});
	};

	onPlaceBidClose = () => {
		this.setState({ placeBidAsset: null });
	};
	notificationUpdate = (message) => {
		const { showMessage } = this.props;
		showMessage({ message });
	};
	handleClickToggle = () => {
		this.setState({ activeEventKey: "" });
	};
	handleClickShow = () => {
		if (!this.props.loggedInUser) {
			this.setState({ activeEventKey: "" });
			this.props.toggleLogin(true, () =>
			setTimeout(() => {
				this.setState({ activeEventKey: "0" });
				this.setState({ isShown: !this.state.isShown });
			}, 100)
			);
		} else {
			this.setState({ activeEventKey: "0" });
			this.setState({ isShown: !this.state.isShown });
		}
	};

	joinLiveAuction = (e) => {
		preventEvent(e);
		const itemObj = toUrlString({
			auctionId: this.props.asset.auctionData?.auctionId,
			timeZone: this.props.asset.auctionData?.timezoneName,
			location: this.props.asset.auctionData?.state?.name,
			auctionName: this.props.asset.auctionData?.auctionName,
			auctionNumber: this.props.asset.auctionData?.auctionNum,
			startDate: this.props.asset.auctionData?.datetimeOpen,
			endDate: this.props.asset.auctionData?.datetimeClose,
		});
		if ((this.props.loggedInUser && this.props.loggedInUser.role === "Admin") || this.props.asset.auctionData?.termsAgreed) {
			this.callTermsCondition(itemObj, true, this.props.asset.auctionData?.auctionId);
		} else if (!this.props.isLoggedIn) {
			this.props.toggleLogin(true, () => this.callTermsCondition(itemObj, this.props.asset.auctionData?.termsAgreed, this.props.asset.auctionData?.auctionId));
		} else {
			this.callTermsCondition(itemObj, this.props.asset.auctionData?.termsAgreed, this.props.asset.auctionData?.auctionId);
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

	render() {
		const { asset, loggedInUser, toggleLogin, showMessage, creditCardPercentage } = this.props;
		const { activeEventKey, removePlaceBid } = this.state;

		return (
			<div className="div-PlaceBids">
				{removePlaceBid && (
					<Accordion>
						<Card>
							<Card.Header>
								<Visible when={asset?.displayJoinAuction}>
									<Button
										className={`join-live-btn ${isInRoom(asset.auctionData.auctionType.name) && asset?.auctionData?.currentlyLive ? "position-center" : ""}`}
										variant="warning"
										onClick={this.joinLiveAuction}
									>
										<SvgComponent path="gavel" />
										{this.state.width > 767 ? "Join Live Auction" : "Join Live"}
									</Button>
								</Visible>
								<Visible when={isOnline(asset.auctionData.auctionType.name)}>
									<Accordion.Toggle
										as={Button}
										className={asset?.displayJoinAuction ? "place-bid-btn two-btn" : "place-bid-btn"}
										variant="link"
										onClick={() => this.handleClickShow()}
										eventKey={activeEventKey}
									>
										Bid Now
										<Visible when={asset.highestBidder}>
											<div className="div-gavel-svg">
												<SvgComponent path="gavel" />
											</div>
										</Visible>
									</Accordion.Toggle>
								</Visible>
								<Visible when={isInRoom(asset.auctionData.auctionType.name) && dayjs(asset.auctionData?.datetimeOpen) > dayjs().add(2, "seconds")}>
									<Accordion.Toggle
										as={Button}
										className={asset?.displayJoinAuction ? "place-bid-btn two-btn" : "place-bid-btn"}
										variant="link"
										onClick={() => this.handleClickShow()}
										eventKey={activeEventKey}
									>
										{this.state.width > 767 ? " Place Absentee Bid" : "Absentee Bid"}
										<Visible when={asset.highestBidder}>
											<div className="div-gavel-svg">
												<SvgComponent path="gavel" />
											</div>
										</Visible>
									</Accordion.Toggle>
								</Visible>
								<Accordion.Toggle
									as={Button}
									className={""}
									variant="link"
									onClick={() => this.handleClickShow()}
									eventKey={activeEventKey}
								>
									<div className="close-div">
										{" "}
										<SvgComponent path="cancel-black" />
									</div>
								</Accordion.Toggle>
							</Card.Header>
							<Accordion.Collapse
								id={"place-bid-accordion"}
								eventKey={activeEventKey}
							>
								<Card.Body>
									<Container>
										<PlaceBid
											asset={asset}
											onPlaceBidConfirm={this.onPlaceBidConfirm}
											onCloseClick={this.onPlaceBidClose}
											loggedInUser={loggedInUser}
											toggleLogin={toggleLogin}
											closebutton
											notificationUpdate={this.notificationUpdate}
											showMessage={showMessage}
											creditCardPercentage={creditCardPercentage}
										/>
									</Container>
								</Card.Body>
							</Accordion.Collapse>
						</Card>
					</Accordion>
				)}
			</div>
		);
	}
}
export default withRouter(onClickOutside(PlaceBidBottom));
