import React from "react";
import { withRouter, Link } from "react-router-dom";
import _get from 'lodash/get';
import _findIndex from "lodash/findIndex";
import dayjs from "dayjs";
import Container from "react-bootstrap/Container";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from 'react-bootstrap/InputGroup';
import { CSSTransition } from 'react-transition-group';
import Visible from "../Visible";
import { toUrlString, preventEvent, setAppTitle, toAmount } from "../../../utils/helpers";
import { SOCKET, ASSET_STATUS, MESSAGES } from "../../../utils/constants";
import CurrentAssetDetails from "../CurrentAssetDetails";
import SvgComponent from "../SvgComponent";
import ImportantNotes from "../ImportantNotes";
import MyActivities from "../MyActivities";
import CarouselAssets from "../CarouselAssets";
import BiddingLogs from "../BiddingLogs";
import Webinar from "../WebinarComponent/WebinarComponent";
import './PublicConsole.scss';

class PublicConsole extends React.Component {
    state = {
        isLoggedIn: false,
        currentAsset: null,
        assetList: [],
        auctionAssets: [],
        auctionDetails: {},
        accountId: null,
        customBidValue: 0,
        impNotes: [],
        biddingLogs: [],
        totalBiddingLogs: 0,
        myActivities: [],
        totalMyActivities: 0,
        bidderMsg: '',
        lastBid: null,
        isOutBidden: false,
        mute: false,
        showVideo: false,
        isLowerBidIncDisabled: false,
        width: window.innerWidth,
        isYoutubeVideo: false,
        showOtherVideo: false
    }
    mobileVideoRef = React.createRef();

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.props.setLoading(false);
        if (this.props.loggedInUser && this.props.loggedInUser.accountId) {
            setAppTitle("Bidding Console", this.props.vendor.name);
            this.setState({
                width: window.innerWidth,
                isLoggedIn: true, auctionId: this.props.auctionId,
                accountId: this.props.loggedInUser.accountId, isLowerBidIncDisabled: this.props.islowerBidDisabled
            }, () => {
                this.getAssets();
            });
        } else {
            this.setState({ isLoggedIn: false });
            this.toggleAdminLogin();
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        this.setState({ width: window.innerWidth });
    };

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.loggedInUser && prevState.isLoggedIn) {
            this.setState({ isLoggedIn: false });
        } else if (this.props.loggedInUser && !prevState.isLoggedIn && !this.state.isLoggedIn) {
            this.setState({ isLoggedIn: true }, () => {
                this.getAssets();
            });
        }
    }

    toggleAdminLogin = () => {
        this.props.toggleLogin(true, () => {
            if (this.props.loggedInUser) {
                this.setState({
                    isLoggedIn: true, auctionId: this.props.auctionId,
                    accountId: this.props.loggedInUser.accountId, isLowerBidIncDisabled: this.props.islowerBidDisabled
                });
            } else {
                this.setState({ isLoggedIn: false });
                this.displayMessage("Login with credentials");
                this.toggleAdminLogin();
            }
        });
    }

    connectToBiddingLogSocket = (assetId) => {
        const { socket } = this.props;
        if (socket && socket.on) {
            socket.on(`${SOCKET.BIDDINGLOG_ON_ASSETID}${assetId}`, (res) => {
                if (res?.biddingLog) {
                    if (res?.biddingLog.isBiddingLog) {
                        this.getBiddingLogs(assetId);
                    } else {
                        this.getMyactivities(assetId);
                    }
                }
            })
        }
    }

    connectToImpNotesSocket = (auctionId) => {
        const { socket } = this.props;
        if (socket && socket.on) {
            socket.on(`${SOCKET.IMPORTANT_NOTE_AUCTION}${auctionId}`, (res) => {
                const msg = res.importantNote;
                this.setState({ impNotes: [...this.state.impNotes, msg] });
            })
        }
    }

    connectToAssetSocket = () => {
        const { socket } = this.props;
        if (socket && socket.on) {
            socket.on(`${SOCKET.ON_ASSET_CHANGE}`, (res) => {
                if (this.state.currentAsset && res?.asset && res.asset.assetId === this.state.currentAsset.assetId && (this.state.customBidValue === (this.state.currentAsset.currentBidAmount + this.state.currentAsset.incrementBy))) {
                    this.setState({ customBidValue: res.asset.lastPlacedBid + res.asset.incrementBy });
                }
                if (res && res?.asset && this.state.currentAsset && res.asset.assetId === this.state.currentAsset.assetId && res.asset.accountId === this.state.accountId && res.asset.status === ASSET_STATUS.SOLD) {
                    this.props.showMessage({
                        message: <div> <span>{MESSAGES.AUCTION_LOT_WON}{res.asset.lotNo}.</span></div>,
                        duration: 10 * 1000
                    });
                } else if (res && res?.asset && this.state.currentAsset && res.asset.assetId === this.state.currentAsset.assetId && (res.asset.status === ASSET_STATUS.SOLD || res.asset.status === ASSET_STATUS.PASSED_IN || res.asset.status === ASSET_STATUS.REFERRED)) {
                    this.props.showMessage({
                        message: <div> <span>Lot No:{this.state.currentAsset?.lotNo} {res.asset.title} is {res.asset.status}</span></div>
                    })
                }
                if (res && res.asset && ((res.asset.assetId === this.state.currentAsset?.assetId))) {
                    if (!res.asset.isReset) {
                        const asset = { ...this.state.currentAsset, ...res.asset };
                        let custBidVal = 0;
                        if (this.state.customBidValue > res.asset.lastPlacedBid) {
                            custBidVal = parseFloat(this.state.customBidValue);
                        } else if (this.state.customBidValue <= res.asset.lastPlacedBid) {
                            custBidVal = parseFloat(_get(res.asset, 'lastPlacedBid') || 0) + parseFloat(_get(res.asset, 'incrementBy') || 0);
                        }
                        if (this.state.currentAsset?.currentBidAmount && res.asset.currentBidAmount < this.state.currentAsset?.currentBidAmount) {
                            custBidVal = parseFloat(_get(res.asset, 'currentBidAmount') || 0) + parseFloat(_get(res.asset, 'incrementBy') || 0);
                            this.getAssetDetails(res.asset.assetId);
                        }
                        this.setState({ currentAsset: asset, customBidValue: custBidVal });
                    }
                    else {
                        this.getAssetDetails(res.asset.assetId);
                        this.getBiddingLogs(res.asset.assetId);
                        this.getMyactivities(res.asset.assetId);
                        this.setState({ customBidValue: parseFloat(_get(res.asset, 'lastPlacedBid') || 0) + parseFloat(_get(res.asset, 'incrementBy') || 0) });
                    }
                }
                if (res.asset.assetId !== this.state.currentAsset?.assetId) {
                    const assetIdx = _findIndex(this.state.auctionAssets, { assetId: res?.asset.assetId });
                    if (assetIdx > -1) {
                        this.getAssetDetails(res.asset.assetId);
                        this.setState({ customBidValue: parseFloat(_get(res.asset, 'lastPlacedBid') || 0) + parseFloat(_get(res.asset, 'incrementBy') || 0) });
                    }
                }
                if (res && res.asset && res.asset.isCurrent && (res.asset.assetId !== this.state.currentAsset?.assetId)) {
                    const assetIndex = _findIndex(this.state.auctionAssets, { assetId: res?.asset.assetId });
                    if (assetIndex > -1) {
                        this.getAssets();
                    }
                }
            });
            socket.on(SOCKET.LAST_CALL, (res) => {
                this.props.showMessage({
                    message: <div><span>{MESSAGES.AUCTION_LAST_CALL} {this.state.currentAsset.lotNo} {this.state.currentAsset.title}</span></div>
                })
            })
            socket.on(SOCKET.ON_AUCTION_CHANGE, (res) => {
                if (res.auction.auctionId === this.state.auctionId) {
                    const tempAuction = { ...this.state.auctionDetails, ...res.auction }
                    this.setState({ auctionDetails: tempAuction })
                    this.props.showMessage({
                        message: <div>
                            <Visible when={res.auction.status === "Suspended"}>
                                <div><span>{MESSAGES.AUCTION_SUSPEND}</span></div>
                            </Visible>
                            <Visible when={res.auction.status === "Open"}>
                                <div><span>{MESSAGES.AUCTION_RESUME}</span></div>
                            </Visible>
                        </div >,
                        type: 'warning'
                    });
                }
            });
            socket.on(`${SOCKET.BID_ADMTTED_RESPONSE}`, (res) => {
                if (res.bidAdmitted.accountId === this.state.accountId) {
                    const asset = { ...this.state.currentAsset };
                    asset.highestBidder = true;
                    this.setState({ isBidNowDisabled: true, isLowerBidIncDisabled: true, currentAsset: asset, isOutBidden: false });
                    const value = `Bid: ${res.bidAdmitted.currentBidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} Accepted`
                    const req = {
                        assetId: this.state.currentAsset.assetId,
                        auctionId: this.state.auctionId,
                        message: value,
                        isBiddingLog: false,
                        label: 'Bid',
                        type: 'bid'
                    };
                    this.props.addPublicBidddingLog(req).then(() => { });
                    this.props.showMessage({
                        type: 'success',
                        message: <div>
                            <Visible when={res.bidAdmitted.bidAdmitted}>
                                <div>
                                    <span>{`${MESSAGES.AUCTION_HIGHEST_BID} ${res.bidAdmitted.currentBidAmount} `}</span></div>
                            </Visible>
                        </div >
                    });
                }
            });

            socket.on(`${SOCKET.CHANGE_BID_INC_REQUEST}`, (res) => {
                this.setState({ isLowerBidIncDisabled: true });
                this.props.disableLowerBidBtn(true);
            });

            socket.on(SOCKET.ENABLE_LOW_BID_BTN, (res) => {
                this.setState({ isLowerBidIncDisabled: true });
                this.props.disableLowerBidBtn(true);
                setTimeout(() => {
                    this.setState({ isLowerBidIncDisabled: false });
                    this.props.disableLowerBidBtn(false);
                }, 10000)
            });
            if (this.props.loggedInUser) {
                let encodeUserstr = `${this.props.loggedInUser.accountId}`;
                socket.on(`${SOCKET.OUTBID_FUNCTIONALITY}${encodeUserstr}`, (outBidResponse) => {
                    if (this.props.loggedInUser && this.props.loggedInUser.accountId && outBidResponse.asset.assetId === this.state.currentAsset.assetId) {
                        const tempAsset = { ...this.state.currentAsset };
                        tempAsset.outbidDetails = outBidResponse.asset.outbidDetails;
                        tempAsset.highestBidder = false;
                        this.setState({ currentAsset: tempAsset, isBidNowDisabled: false, isOutBidden: true });
                        this.props.showMessage({
                            type: 'error',
                            duration: 7000,
                            message:
                                <div>{MESSAGES.AUCTION_OUTBID} {outBidResponse.asset.title}</div>
                        });
                        const value = `Bid: ${outBidResponse.asset.currentBidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} Outbid`
                        const req = {
                            assetId: outBidResponse.asset.assetId,
                            auctionId: this.state.auctionId,
                            message: value,
                            isBiddingLog: false,
                            label: 'Bid',
                            type: 'bid'
                        };
                        this.props.addPublicBidddingLog(req).then(() => { });
                    }
                });
            }
        }
    }

    displayMessage = (msg) => {
        this.props.showMessage({
            message: <span>{msg} </span>,
            type: 'warning'
        });
    }


    getAssets = () => {
        const { location, socket } = this.props;
        if (!this.state.auctionId) {
            this.setState({ auctionId: this.props.auctionId });
        }
        this.props.getPublicConsoleAssets({ auctionId: this.props.auctionId, sort: 'lotNo' }).then(res => {
            const auctionAssets = [...res.result.assets];
            const assets = res.result.assets;
            this.props.setLoading(false);
            if (assets && assets.length) {
                const curIdx = _findIndex(assets, { isCurrent: true });
                const nextIdx = _findIndex(assets, { status: ASSET_STATUS.RELEASED, isCurrent: false });
                if (nextIdx > -1) {
                    assets[nextIdx].nextAsset = true;
                };
                if (curIdx > -1) {
                    const asset = assets[curIdx];
                    this.getAssetDetails(asset?.assetId);
                    this.getBiddingLogs(asset?.assetId);
                    this.getMyactivities(asset?.assetId);
                    assets.splice(curIdx, 1);
                }
                this.setState({ assetList: assets, auctionAssets });
                this.getAuctionDetails(this.state.auctionId);
                this.getBiddingImpNotes(this.state.auctionId);
                if (socket && socket.on) {
                    socket.off(`${SOCKET.IMPORTANT_NOTE_AUCTION}${this.state.auctionId}`);
                }
                this.connectToImpNotesSocket(this.state.auctionId);
                if (location.state) {
                    const item = [];
                    for (let i = 0; i < assets.length; i++) {
                        item.push(assets[i].assetId)
                    }
                    const index = item.indexOf(location.state.asset);
                    this.setState({ indexofAsset: index });
                    this.setState({ isNavigateAssetCard: location.state.asset });
                }

            } else {
                this.setState({ isLoggedIn: false })
            }
        })
    }

    getAuctionDetails = (auctionId) => {
        this.props.getPublicAuctionDetails(auctionId).then(res => {
            if (res.result) {
                const itemObj = toUrlString({
                    auctionId: res.result.auctionId,
                    // timeZone: item.timezoneName, 
                    location: res.result.state.name,
                    auctionName: res.result.auctionName,
                    auctionNumber: res.result.auctionNum,
                    startDate: res.result.datetimeOpen,
                    endDate: res.result.datetimeClose
                });
                if (!res.result.termsAgreed) {
                    this.props.history.push(`/terms-condition?${itemObj}`);
                }
                this.setState({ auctionDetails: res.result, isYoutubeVideo: res.result.webinarUrl && res.result.webinarUrl.includes('https://www.youtube.com/') ? true : false });
                let encodeUserstr = `${this.props.loggedInUser.accountId}`;
                const { socket } = this.props;
                if (socket && socket.on) {
                    socket.off(`${SOCKET.ON_ASSET_CHANGE}`);
                    socket.off(`${SOCKET.ON_AUCTION_CHANGE}`);
                    socket.off(`${SOCKET.BID_ADMTTED_RESPONSE}`);
                    socket.off(`${SOCKET.CHANGE_BID_INC_REQUEST}`);
                    socket.off(`${SOCKET.ENABLE_LOW_BID_BTN}`);
                    socket.off(`${SOCKET.OUTBID_FUNCTIONALITY}${encodeUserstr}`);
                    socket.off(`${SOCKET.LAST_CALL}`);
                }
                this.connectToAssetSocket();
            }
        })
    }

    getAssetDetails = (assetId) => {
        this.props.getPublicAssetDetails({ assetId, auctionId: this.state.auctionId }).then(res => {
            const data = res.result;
            let custBidVal = 0;
            if (this.state.customBidValue > data.lastPlacedBid) {
                custBidVal = parseFloat(this.state.customBidValue);
            } else if (this.state.customBidValue <= data.lastPlacedBid) {
                custBidVal = parseFloat(_get(data, 'lastPlacedBid') || 0) + parseFloat(_get(data, 'incrementBy') || 0);
            }
            if (this.state.currentAsset?.currentBidAmount && data.currentBidAmount < this.state.currentAsset?.currentBidAmount) {
                custBidVal = parseFloat(_get(data, 'currentBidAmount') || 0) + parseFloat(_get(data, 'incrementBy') || 0);
            }
            let outbid = false;
            if (res.outbidDetails) {
                outbid = true;
            }
            this.setState({ currentAsset: data, customBidValue: custBidVal, isOutBidden: outbid }, () => {
                const { socket } = this.props;
                if (socket && socket.on) {
                    socket.off(`${SOCKET.BIDDINGLOG_ON_ASSETID}${assetId}`);
                }
                this.connectToBiddingLogSocket(assetId);
                this.getMyLastBid(data);
            })
        })
    }

    getMyLastBid = (asset) => {
        const req = {
            assetId: asset.assetId,
            auctionId: this.state.auctionId
        }
        this.props.getPublicLastBid(req).then(res => {
            if (res.result) {
                if (res.result.outbidAt) {
                    this.setState({ isBidNowDisabled: false, lastBid: res.result });
                } else {
                    this.setState({ isBidNowDisabled: true, lastBid: res.result });
                }
            } else {
                this.setState({ isBidNowDisabled: false });
            }
        });
    }

    getBiddingImpNotes = (auctionId) => {
        this.props.getImpNotes({ auctionId }).then((res) => {
            if (res.result) {
                this.setState({ impNotes: res.result })
            };
        })
    }

    getBiddingLogs = (assetId, offset = 0) => {
        this.props.getPublicBiddingLogs({ auctionId: this.state.auctionId, assetId, limit: 20, offset, isBiddingLog: 1 }).then(res => {
            const totalBiddingLogs = res.totalRecords ? res.totalRecords : 0;
            if (res.result.length && offset) {
                this.setState({ biddingLogs: [...this.state.biddingLogs, ...res.result], totalBiddingLogs });
            } else if (res.result.length) {
                this.setState({ biddingLogs: res.result, totalBiddingLogs });
            } else {
                this.setState({ biddingLogs: [], totalBiddingLogs });
            }
        });
    }

    onLogsScrollToEnd = () => {
        if (this.state.totalBiddingLogs > this.state.biddingLogs.length) {
            this.getBiddingLogs(this.state.currentAsset?.assetId, this.state.biddingLogs.length);
        }
    }

    getMyactivities = (assetId, offset = 0) => {
        this.props.getPublicBiddingLogs({ auctionId: this.state.auctionId, assetId, limit: 10, offset, isBiddingLog: 0 }).then(res => {
            const totalMyActivities = res.totalRecords ? res.totalRecords : 0;
            if (res.result.length && offset) {
                this.setState({ myActivities: [...this.state.myActivities, ...res.result], totalMyActivities });
            } else if (res.result.length) {
                this.setState({ myActivities: res.result, totalMyActivities });
            } else {
                this.setState({ myActivities: [], totalMyActivities });
            }
        });
    }

    onScrollAvtivitiesToEnd = () => {
        if (this.state.totalMyActivities > this.state.myActivities.length) {
            this.getMyactivities(this.state.currentAsset?.assetId, this.state.myActivities.length);
        }
    }

    setCustomBidValue = (val) => {
        this.setState({ customBidValue: val });
    }

    onIncrement = () => {
        this.setCustomBidValue(this.state.customBidValue + this.state.currentAsset.incrementBy);
    }

    onDecrement = () => {
        if ((this.state.customBidValue - this.state.currentAsset.incrementBy) > this.state.currentAsset.currentBidAmount) {
            this.setCustomBidValue(this.state.customBidValue - this.state.currentAsset.incrementBy);
        }
    }

    confirmBid = () => {
        const payload = {
            assetId: this.state.currentAsset.assetId,
            bidType: "current",
            auctionId: this.state.auctionId,
            termsAgreed: true,
            bidAmount: this.state.customBidValue
        }
        this.props.publicConfirmBid(payload).then((res) => {
            this.props.showMessage({
                message: <span>{res.message}</span>
            });
            if (res.message !== 'Bid of same amount is already placed') {
                const req = {
                    assetId: this.state.currentAsset.assetId,
                    auctionId: this.state.auctionId,
                    message: "Bid: " + payload.bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
                    isBiddingLog: false,
                    label: 'Bid',
                    type: 'bid'
                };
                this.props.addPublicBidddingLog(req).then(() => { });
            } else {
                const req = {
                    assetId: this.state.currentAsset.assetId,
                    auctionId: this.state.auctionId,
                    message: res.message,
                    isBiddingLog: false,
                    label: 'Bid',
                    type: 'bid'
                };
                this.props.addPublicBidddingLog(req).then(() => { });
            }
            this.setState({ isBidNowDisabled: true });
        }).catch(err => {
            this.props.showMessage({
                message: <div><span>{err.message}</span></div>
            });
            this.setState({ isBidNowDisabled: false });
        })
    }

    sendLowerBidIncrementReq = () => {
        this.props.requestLowerBidIncrement({ assetId: this.state.currentAsset.assetId, auctionId: this.state.auctionId }).then(res => {
            this.setState({ isLowerBidIncDisabled: true })
            this.props.disableLowerBidBtn(true);
            const req = {
                assetId: this.state.currentAsset.assetId,
                auctionId: this.state.auctionId,
                message: `Request placed for lower Bid increment`,
                isBiddingLog: false,
                label: 'Lower Bid',
                type: 'lowerBid'
            };
            this.props.addPublicBidddingLog(req).then(() => {
                this.props.showMessage({
                    type: 'success',
                    message: <div>
                        <div><span>{`${MESSAGES.AUCTION_LOWER_BID} ${res.result.asset.title} `}</span></div>
                    </div >
                });
            });

        })
    };

    addBiddingLog = (assetId, message, isBidder, event) => {
        preventEvent(event);
        const req = {
            assetId,
            auctionId: this.state.auctionId,
            message,
            type: 'bidder-msg',
            label: 'Online'
        }
        this.props.addPublicBidddingLog({ isBiddingLog: true, ...req }).then(() => {
            if (isBidder) {
                this.setState({ bidderMsg: '' });
            }
        })
        this.props.addPublicBidddingLog({ isBiddingLog: false, ...req }).then(() => {
            if (isBidder) {
                this.setState({ bidderMsg: '' });
            }
        })
    };

    changeBidderMsg = (value) => {
        this.setState({ bidderMsg: value });
    }

    navigateToHelp = () => {
        this.props.history.push('/terms-condition');
    }

    scrollToVideo = () => {
        this.setState({ showVideo: !this.state.showVideo });
        if (!this.state.showVideo) {
            this.mobileVideoRef.current.scrollIntoView({ behavior: 'smooth', block: "start" });
        }
    }
    scrollToOtherVideo = () => {
        this.setState({ showOtherVideo: true });
        this.mobileVideoRef.current.scrollIntoView({ behavior: 'smooth', block: "start" });
    }
    closeWebinar = () => {
        this.setState({ showOtherVideo: false })
    }

    handleHeader = (hide) => {
        this.props.hidePublicHeader(hide);
    }

    render() {
        const { loggedInUser } = this.props;
        const { isLoggedIn, accountId, currentAsset, auctionDetails, impNotes, biddingLogs, myActivities, assetList, bidderMsg, customBidValue,
            isLowerBidIncDisabled, isBidNowDisabled, lastBid, isOutBidden, mute, showVideo, width, isYoutubeVideo, showOtherVideo } = this.state;
        const placeholder = currentAsset?.currentBidAmount && `Enter ${toAmount(currentAsset?.currentBidAmount)} or more`;
        return (
            <div className='public-console'>
                <Container>
                    <Visible when={width > 1023}>
                        <div className="header-wrapper" onMouseEnter={e => { this.handleHeader(false) }} ></div>
                        <div className="row mx-0" onMouseEnter={e => { this.handleHeader(true) }}>
                            <div className="asset-block">
                                <div className="row mx-0">
                                    <div className="asset-details-block">
                                        <CurrentAssetDetails asset={currentAsset} />
                                    </div>
                                    <div className="asset-carousel-block">
                                        <div className="auction-details row mx-0">
                                            <div className="auction-no col-3 px-1">
                                                <div className="auction-label">Auction No </div>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>{auctionDetails.auctionNum}</Tooltip>
                                                    }
                                                >
                                                    <div className="val">{auctionDetails.auctionNum}</div>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="auction-name col-4 px-1">
                                                <div className="auction-label">Auction Name </div>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>{auctionDetails.auctionName}</Tooltip>
                                                    }
                                                >
                                                    <div className="val">{auctionDetails.auctionName}</div>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="auction-loc col-5 px-1">
                                                <div className="auction-label">Auction Location </div>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>{_get(auctionDetails, 'city.address') === null ? _get(auctionDetails, 'city.name') : _get(auctionDetails, 'city.address')}</Tooltip>
                                                    }
                                                >
                                                    <div className="val">{_get(auctionDetails, 'city.address') === null ? _get(auctionDetails, 'city.name') : _get(auctionDetails, 'city.address')}</div>
                                                </OverlayTrigger>
                                            </div>
                                        </div>
                                        <Visible when={!showVideo && isYoutubeVideo}>
                                            <div className="youtube-video-hide">
                                                <iframe title="webinar-youtube"
                                                    src={auctionDetails?.webinarUrl && `${auctionDetails?.webinarUrl}?autoplay=1&controls=0&mute=${mute ? '1' : '0'}`} >
                                                </iframe>
                                            </div>
                                        </Visible>
                                        <CSSTransition
                                            timeout={350}
                                            in={auctionDetails?.webinarUrl && ((showVideo && isYoutubeVideo))}
                                            unmountOnExit
                                            appear>
                                            <div className="youtube-video">
                                                <Visible when={showVideo && isYoutubeVideo}>
                                                    <iframe title="webinar-youtube"
                                                        src={auctionDetails?.webinarUrl && `${auctionDetails?.webinarUrl}?autoplay=1&controls=0&mute=${mute ? '1' : '0'}`} >
                                                    </iframe>
                                                </Visible>
                                            </div>
                                        </CSSTransition>
                                        <Visible when={showOtherVideo && !isYoutubeVideo}>
                                            <Webinar closeWebinar={this.closeWebinar} showOtherVideo={showOtherVideo} webKey={auctionDetails?.webinarUrl} />
                                        </Visible>
                                        <CarouselAssets assetList={assetList} />
                                    </div>
                                </div>
                                <BiddingLogs logs={biddingLogs} onScrollToEnd={this.onLogsScrollToEnd} accountId={accountId} incrementBy={currentAsset?.incrementBy} currentBidAmount={currentAsset?.currentBidAmount} loggedInUser={loggedInUser} />
                                <div className="bidding-block">
                                    <div className="row mx-0">
                                        <div className="place-bid-section">
                                            <div className="label">Next Bid Available</div>
                                            <Visible when={auctionDetails && !auctionDetails?.showCustomBid}>
                                                <div className="next-bid-val">
                                                    {customBidValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                                                </div>
                                            </Visible>
                                            <Visible when={auctionDetails?.showCustomBid}>
                                                <InputGroup className="bid-input-group">
                                                    <Form.Control
                                                        placeholder={placeholder}
                                                        value={`${customBidValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`}
                                                    />
                                                    <InputGroup.Append>
                                                        <Button type="button" variant="light" onClick={this.onIncrement} disabled={(auctionDetails?.status === 'Suspended')}>
                                                            <SvgComponent path="add" />
                                                        </Button>
                                                        <Button type="button" variant="light" onClick={this.onDecrement} disabled={(auctionDetails?.status === 'Suspended')}>
                                                            <SvgComponent path="remove" />
                                                        </Button>
                                                    </InputGroup.Append>
                                                </InputGroup>
                                            </Visible>
                                            <Button variant="warning" className="place-bid" onClick={this.confirmBid} disabled={(auctionDetails?.status === 'Suspended') || !_get(currentAsset, 'isCurrent') || !_get(currentAsset, 'incrementBy') || !_get(currentAsset, 'currentBidAmount') || isBidNowDisabled}> <SvgComponent path='gavel' />Place Bid</Button>
                                        </div>
                                        <div className="change-bid-inc-section">
                                            <div className="label">Current Bid Increment</div>
                                            <div className="bid-inc">{currentAsset ? toAmount(currentAsset.incrementBy) : toAmount(0)}</div>
                                            <div className="label">{width > 1199 ? 'Request to lower Bid Increment' : 'Request to lower Bid'}</div>
                                            <Button className="request-btn" disabled={isLowerBidIncDisabled || auctionDetails?.status === 'Suspended' || !currentAsset || !currentAsset?.incrementBy} onClick={this.sendLowerBidIncrementReq} >Request</Button>
                                        </div>
                                        <Visible when={currentAsset?.highestBidder}>
                                            <div className={`winning-section ${(currentAsset?.highestBidder && currentAsset?.status !== ASSET_STATUS.SOLD) ? 'highest-bidder' : ''}`}>
                                                <div className="row mx-0">
                                                    <Visible when={currentAsset?.highestBidder && currentAsset?.status === ASSET_STATUS.SOLD}>
                                                        <div className="text">Congratulations on winning the auction with the following bid:</div>
                                                    </Visible>
                                                    <Visible when={currentAsset?.highestBidder && currentAsset?.status !== ASSET_STATUS.SOLD}>
                                                        <div className="text">You are currently the highest bidder</div>
                                                    </Visible>
                                                    <div className="svg-block">
                                                        <Visible when={currentAsset?.highestBidder && currentAsset?.status === ASSET_STATUS.SOLD}>
                                                            <SvgComponent path="emoji_events_black_24dp" />
                                                        </Visible>
                                                        <Visible when={currentAsset?.highestBidder && currentAsset?.status !== ASSET_STATUS.SOLD}>
                                                            <SvgComponent path="gavel" />
                                                        </Visible>
                                                    </div>
                                                </div>
                                                <div className="user-name">{loggedInUser?.firstName ? loggedInUser.firstName : ''} {loggedInUser?.lastName ? loggedInUser.lastName : ''}</div>
                                                <div className="winning-bid">
                                                    <SvgComponent path="face_black" />
                                                    <span className="val">{lastBid?.amount && toAmount(lastBid?.amount)}</span>
                                                </div>
                                                <div className="alias-container">
                                                    <span className="alias-name">{lastBid?.assetBidAlias?.alias}</span>
                                                    <span className="bid-time">{dayjs(lastBid?.createdAt).format('HH:mm A')}</span>
                                                </div>
                                            </div>
                                        </Visible>
                                        <Visible when={(isOutBidden || currentAsset?.outbidDetails?.amount) && !currentAsset?.highestBidder}>
                                            <div className="winning-section outbid-section">
                                                <div className="row mx-0">
                                                    <div className="text">You have been outbid by</div>
                                                    <div className="svg-block">
                                                        <SvgComponent path="trending-down" />
                                                    </div>
                                                </div>
                                                <div className="user-name">{currentAsset?.outbidDetails?.bidderType}</div>
                                                <div className="winning-bid">
                                                    <SvgComponent path="face_black" />
                                                    <span className="val">{currentAsset?.outbidDetails?.amount && toAmount(currentAsset?.outbidDetails?.amount)}</span>
                                                </div>
                                                <div className="alias-container">
                                                    <Visible when={currentAsset?.outbidDetails?.bidderType !== 'Room Bidder'}>
                                                        <span className="alias-name">{currentAsset?.outbidDetails?.assetBidAlias?.alias}</span>
                                                    </Visible>
                                                    <span className={`bid-time ${currentAsset?.outbidDetails?.bidderType === 'Room Bidder' ? 'ml-66' : ''}`}>{dayjs(currentAsset?.outbidDetails?.outbidAt).format('HH:mm A')}</span>
                                                </div>
                                            </div>
                                        </Visible>
                                    </div>
                                </div>
                            </div>
                            <div className="imp-notes-block">
                                <div className="actions">
                                    <div>
                                        Help:{" "}<SvgComponent className="cursor" onClick={this.navigateToHelp} path="help" />
                                    </div>
                                    <Visible when={isYoutubeVideo && auctionDetails?.webinarUrl}>
                                        <div>
                                            <span onClick={() => { this.setState({ showVideo: !showVideo }) }} role="button" >
                                                <SvgComponent path={`${!showVideo ? 'play_circle_filled' : 'stop-circle'}`} />
                                            </span>
                                            <span onClick={() => { this.setState({ mute: !mute }) }} role="button" >
                                                <SvgComponent path={`${!mute ? 'volume-up' : 'volume-off'}`} />
                                            </span>
                                        </div>
                                    </Visible>
                                    <Visible when={!isYoutubeVideo && auctionDetails?.webinarUrl}>
                                        <div className="ml-2">
                                            <span onClick={() => { this.setState({ showOtherVideo: true }) }} role="button" >
                                                Live audio:{" "}<SvgComponent path="volume-up" />
                                            </span>
                                        </div>
                                    </Visible>
                                </div>
                                <div className="activity-block">
                                    <ImportantNotes impNotesList={impNotes} />
                                    <MyActivities accountId={accountId} list={myActivities} onScrollToEnd={this.onScrollAvtivitiesToEnd} />
                                    <div className="msg-block">
                                        <Form noValidate autoComplete="off">
                                            <Form.Group controlId="publicConsoleMsg">
                                                <Form.Control value={bidderMsg} onChange={e => this.changeBidderMsg(e.target.value)}
                                                    onKeyPress={event => { if (event.key === 'Enter') { this.addBiddingLog(currentAsset.assetId, bidderMsg, true, event) } }}
                                                    placeholder="Send message to auction team..." as="textarea" rows={6} />
                                            </Form.Group>
                                            <Button variant="primary" disabled={auctionDetails?.status === 'Suspended'} className="w-100 mt-2" type="submit" onClick={(e) => this.addBiddingLog(currentAsset.assetId, bidderMsg, true, e)}>
                                                Send Message
                                            </Button>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Visible>
                    <Visible when={width <= 1023}>
                        <div className="mobile-view">
                            <div className="actions">
                                <div>
                                    Help:{" "}<SvgComponent className="cursor" onClick={this.navigateToHelp} path="help" />
                                </div>
                                <Visible when={isYoutubeVideo && auctionDetails?.webinarUrl}>
                                    <div>
                                        <span onClick={this.scrollToVideo} role="button" >
                                            <SvgComponent path={`${!showVideo ? 'play_circle_filled' : 'stop-circle'}`} />
                                        </span>
                                    </div>
                                </Visible>
                                <Visible when={isYoutubeVideo && auctionDetails?.webinarUrl}>
                                    <div>
                                        <span onClick={() => { this.setState({ mute: !mute }) }} role="button" >
                                            <SvgComponent path={`${!mute ? 'volume-up' : 'volume-off'}`} />
                                        </span>
                                    </div>
                                </Visible>
                                <Visible when={!isYoutubeVideo && auctionDetails?.webinarUrl}>
                                    <div className="ml-2">
                                        <span onClick={this.scrollToOtherVideo} role="button" >
                                            <SvgComponent path="volume-up" />
                                        </span>
                                    </div>
                                </Visible>
                            </div>
                            <div className="auction-details row mx-0">
                                <div className="auction-no col-4 px-2">
                                    <div className="auction-label">Auction No </div>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>{auctionDetails.auctionNum}</Tooltip>
                                        }
                                    >
                                        <div className="val">{auctionDetails.auctionNum}</div>
                                    </OverlayTrigger>
                                </div>
                                <div className="auction-name col-4 px-2">
                                    <div className="auction-label">Auction Name </div>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>{auctionDetails.auctionName}</Tooltip>
                                        }
                                    >
                                        <div className="val">{auctionDetails.auctionName}</div>
                                    </OverlayTrigger>
                                </div>
                                <div className="auction-loc col-4 px-2">
                                    <div className="auction-label">Auction Location </div>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>{_get(auctionDetails, 'city.address') === null ? _get(auctionDetails, 'city.name') : _get(auctionDetails, 'city.address')}</Tooltip>
                                        }
                                    >
                                        <div className="val">{_get(auctionDetails, 'city.address') === null ? _get(auctionDetails, 'city.name') : _get(auctionDetails, 'city.address')}</div>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <CurrentAssetDetails asset={currentAsset} />
                            <div className="bidding-block">
                                <div className="place-bid-section">
                                    <div className="label">Next Bid Available</div>
                                    <Visible when={auctionDetails && !auctionDetails?.showCustomBid}>
                                        <div className="next-bid-val">
                                            {customBidValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                                        </div>
                                    </Visible>
                                    <Visible when={auctionDetails?.showCustomBid}>
                                        <InputGroup className="bid-input-group">
                                            <Form.Control
                                                placeholder={placeholder}
                                                value={`${customBidValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`}
                                            />
                                            <InputGroup.Append>
                                                <Button type="button" variant="light" onClick={this.onIncrement} disabled={(auctionDetails?.status === 'Suspended')}>
                                                    <SvgComponent path="add" />
                                                </Button>
                                                <Button type="button" variant="light" onClick={this.onDecrement} disabled={(auctionDetails?.status === 'Suspended')}>
                                                    <SvgComponent path="remove" />
                                                </Button>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Visible>
                                    <Button variant="warning" className="place-bid" onClick={this.confirmBid} disabled={(auctionDetails?.status === 'Suspended') || !_get(currentAsset, 'isCurrent') || !_get(currentAsset, 'incrementBy') || !_get(currentAsset, 'currentBidAmount') || isBidNowDisabled}> <SvgComponent path='gavel' />Place Bid</Button>
                                </div>
                                <div className="change-bid-inc-section">
                                    <div className="label mt-0">Current Bid Increment</div>
                                    <div className="bid-inc">{currentAsset ? toAmount(currentAsset.incrementBy) : toAmount(0)}</div>
                                    <div className="label">{width > 1199 ? 'Request to lower Bid Increment' : 'Request to lower Bid'}</div>
                                    <Button className="request-btn" disabled={isLowerBidIncDisabled || auctionDetails?.status === 'Suspended' || !currentAsset} onClick={this.sendLowerBidIncrementReq} >Request</Button>
                                </div>
                                <Visible when={currentAsset?.highestBidder}>
                                    <div className={`winning-section ${(currentAsset?.highestBidder && currentAsset?.status !== ASSET_STATUS.SOLD) ? 'highest-bidder' : ''}`}>
                                        <div className="row mx-0">
                                            <Visible when={currentAsset?.highestBidder && currentAsset?.status === ASSET_STATUS.SOLD}>
                                                <div className="text">Congratulations on winning the auction with the following bid:</div>
                                            </Visible>
                                            <Visible when={currentAsset?.highestBidder && currentAsset?.status !== ASSET_STATUS.SOLD}>
                                                <div className="text">You are currently the highest bidder</div>
                                            </Visible>
                                            <div className="svg-block">
                                                <Visible when={currentAsset?.highestBidder && currentAsset?.status === ASSET_STATUS.SOLD}>
                                                    <SvgComponent path="emoji_events_black_24dp" />
                                                </Visible>
                                                <Visible when={currentAsset?.highestBidder && currentAsset?.status !== ASSET_STATUS.SOLD}>
                                                    <SvgComponent path="gavel" />
                                                </Visible>
                                            </div>
                                        </div>
                                        <div className="user-name">{loggedInUser?.firstName ? loggedInUser.firstName : ''} {loggedInUser?.lastName ? loggedInUser.lastName : ''}</div>
                                        <div className="winning-bid">
                                            <SvgComponent path="face_black" />
                                            <span className="val">{lastBid?.amount && toAmount(lastBid?.amount)}</span>
                                        </div>
                                        <div className="alias-container">
                                            <span className="alias-name">{lastBid?.assetBidAlias?.alias}</span>
                                            <span className="bid-time">{dayjs(lastBid?.createdAt).format('HH:mm A')}</span>
                                        </div>
                                    </div>
                                </Visible>
                                <Visible when={(isOutBidden || currentAsset?.outbidDetails?.amount) && !currentAsset?.highestBidder}>
                                    <div className="winning-section outbid-section">
                                        <div className="row mx-0">
                                            <div className="text">You have been outbid by</div>
                                            <div className="svg-block">
                                                <SvgComponent path="trending-down" />
                                            </div>
                                        </div>
                                        <div className="user-name">{currentAsset?.outbidDetails?.bidderType}</div>
                                        <div className="winning-bid">
                                            <SvgComponent path="face_black" />
                                            <span className="val">{currentAsset?.outbidDetails?.amount && toAmount(currentAsset?.outbidDetails?.amount)}</span>
                                        </div>
                                        <div className="alias-container">
                                            <Visible when={currentAsset?.outbidDetails?.bidderType !== 'Room Bidder'}>
                                                <span className="alias-name">{currentAsset?.outbidDetails?.assetBidAlias?.alias}</span>
                                            </Visible>
                                            <span className={`bid-time ${currentAsset?.outbidDetails?.bidderType === 'Room Bidder' ? 'ml-66' : ''}`}>{dayjs(currentAsset?.outbidDetails?.outbidAt).format('HH:mm A')}</span>
                                        </div>
                                    </div>
                                </Visible>
                            </div>
                            <BiddingLogs logs={biddingLogs} onScrollToEnd={this.onLogsScrollToEnd} accountId={accountId} incrementBy={currentAsset?.incrementBy} currentBidAmount={currentAsset?.currentBidAmount} loggedInUser={loggedInUser} />
                            <div className="asset-list-block" ref={this.mobileVideoRef}>
                                <Visible when={!showVideo && isYoutubeVideo}>
                                    <div className="youtube-video-hide">
                                        <iframe title="webinar-youtube"
                                            src={auctionDetails?.webinarUrl && `${auctionDetails?.webinarUrl}?autoplay=1&controls=0&mute=${mute ? '1' : '0'}`} >
                                        </iframe>
                                    </div>
                                </Visible>
                                <CSSTransition
                                    timeout={350}
                                    in={auctionDetails?.webinarUrl && ((showVideo && isYoutubeVideo))}
                                    unmountOnExit
                                    appear>
                                    <div className="youtube-video">
                                        <Visible when={showVideo && isYoutubeVideo}>
                                            <iframe title="webinar-youtube"
                                                src={auctionDetails?.webinarUrl && `${auctionDetails?.webinarUrl}?autoplay=1&controls=0&mute=${mute ? '1' : '0'}`} >
                                            </iframe>
                                        </Visible>
                                    </div>
                                </CSSTransition>
                                <Visible when={showOtherVideo && !isYoutubeVideo}>
                                    <Webinar closeWebinar={this.closeWebinar} showOtherVideo={showOtherVideo} webKey={auctionDetails?.webinarUrl} />
                                </Visible>
                                <CarouselAssets assetList={assetList} />
                            </div>
                            <div className="imp-notes-block">
                                <div className="activity-block">
                                    <ImportantNotes impNotesList={impNotes} />
                                    <MyActivities accountId={accountId} list={myActivities} onScrollToEnd={this.onScrollAvtivitiesToEnd} />
                                    <div className="msg-block">
                                        <Form noValidate autoComplete="off">
                                            <Form.Group controlId="publicConsoleMsg">
                                                <Form.Control value={bidderMsg} onChange={e => this.changeBidderMsg(e.target.value)}
                                                    onKeyPress={event => { if (event.key === 'Enter') { this.addBiddingLog(currentAsset.assetId, bidderMsg, true, event) } }}
                                                    placeholder="Send message to auction team..." as="textarea" rows={6} />
                                            </Form.Group>
                                            <Button variant="primary" disabled={auctionDetails?.status === 'Suspended'} className="w-100 mt-2" type="submit" onClick={(e) => this.addBiddingLog(currentAsset.assetId, bidderMsg, true, e)}>
                                                Send Message
                                            </Button>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Visible>

                </Container>
                <div className={`${(auctionDetails && auctionDetails?.status === 'Suspended') ? 'suspended' : 'd-none'} `}>
                    <span>Auction has been suspended due to some reason. It will be resumed soon.  <Link to="/"> Go To Homepage. </Link></span>
                </div>
                <div className={`${isLoggedIn ? 'd-none' : 'suspended'} `}></div>
            </div >
        );
    }
}

export default withRouter(PublicConsole);