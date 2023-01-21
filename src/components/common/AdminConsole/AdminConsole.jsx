import React from "react";
import { withRouter } from "react-router";
import _get from 'lodash/get';
import _findIndex from "lodash/findIndex";
import _find from "lodash/find";
import dayjs from "dayjs";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Modal from 'react-bootstrap/Modal';
import { stringify } from 'qs';
import { SOCKET, ASSET_STATUS, MESSAGES } from "../../../utils/constants";
import soundUrl from '../../../utils/sounds/arpeggio-467.mp3'
import BiddingLogs from "../BiddingLogs/BiddingLogs";
import OnlineBids from '../OnlineBids'
import SvgComponent from '../SvgComponent';
import { toAmount } from '../../../utils/helpers';
import CurrentAssetDetails from "../CurrentAssetDetails";
import CarouselAssets from "../CarouselAssets";
import Visible from "../Visible";
import { getItem } from '../../../utils/storage';
import "./AdminConsole.scss";

let changeBidInc = [
    { "value": 50, "label": "$50", "isCurrentInc": false },
    { "value": 100, "label": "$100", "isCurrentInc": false },
    { "value": 250, "label": "$250", "isCurrentInc": false },
    { "value": 500, "label": "$500", "isCurrentInc": false },
    { "value": 1000, "label": "$1000", "isCurrentInc": false },
    { "value": 2000, "label": "$2000", "isCurrentInc": false },
    { "value": 2500, "label": "$2500", "isCurrentInc": false },
    { "value": 5000, "label": "$5000", "isCurrentInc": false },
    { "value": 5, "label": "$5", "isCurrentInc": false },
    { "value": 10, "label": "$10", "isCurrentInc": false },
    { "value": 20, "label": "$20", "isCurrentInc": false },
    { "value": 25, "label": "$25", "isCurrentInc": false },
    { "value": 200, "label": "$200", "isCurrentInc": false },
    { "value": 10000, "label": "$10,000", "isCurrentInc": false },
    { "value": 25000, "label": "$25,000", "isCurrentInc": false },
    { "value": 50000, "label": "$50,000", "isCurrentInc": false }
];
class AdminConsole extends React.Component {

    state = {
        auctionDetails: null,
        assetList: [],
        auctionAssets: [],
        currentAsset: null,
        onLoadCall: 0,
        accountId: null,
        auctionId: null,
        biddingLogs: [],
        adminMsg: '',
        isChangeBidInc: false,
        showSold: false,
        onlineBids: [],
        initialBid: '',
        isLoggedIn: false,
        isUserAdmin: false,
        changeBidincrements: changeBidInc,
        isOnlineBidsDisable: false,
        mute: false,
        handleClose: false,
        showAdminAlert: false,
        adminMessage: "",
        assetHigestBidderDetails: null,
        assetWinnerDetails: null,
        winningAssetNo: 1,
        disableBidIncrement: false
    };

    componentDidMount() {
        this.props.setLoading(false);
        if (this.props.loggedInUser && this.props.loggedInUser.accountId && this.props.loggedInUser.role === 'Admin') {
            this.setState({ isLoggedIn: true, isUserAdmin: true, auctionId: this.props.auctionId, accountId: this.props.loggedInUser.accountId }, () => {
                this.getAdminAssets();
                this.getAuctionDetails(this.state.auctionId);
            });
        } else {
            this.setState({ isLoggedIn: false, isUserAdmin: false });
            this.toggleAdminLogin();
            setTimeout(() => {
                this.props.setLoading(false);
            }, 500);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.loggedInUser && prevState.isLoggedIn) {
            this.setState({ isLoggedIn: false, isUserAdmin: false });
        } else if (this.props.loggedInUser && !prevState.isLoggedIn && !this.state.isLoggedIn && this.props.loggedInUser.role === 'Admin') {
            this.setState({ isLoggedIn: true, isUserAdmin: true }, () => {
                this.getAdminAssets();
                this.getAuctionDetails(this.state.auctionId);
            });
        } else if (this.props.loggedInUser && !prevState.isLoggedIn && !this.state.isLoggedIn && this.props.loggedInUser.role !== 'Admin') {
            this.setState({ isLoggedIn: true, isUserAdmin: false }, () => {
                this.toggleAdminLogin();
            });
        }
    }

    toggleAdminLogin = () => {
        this.props.toggleLogin(true, () => {
            if (this.props.loggedInUser && this.props.loggedInUser.role === 'Admin') {
                this.setState({ isLoggedIn: true, isUserAdmin: true, auctionId: this.props.auctionId, accountId: this.props.loggedInUser.accountId }, () => {
                    this.getAdminAssets();
                    this.getAuctionDetails(this.state.auctionId);
                });
            } else {
                this.setState({ isLoggedIn: false, isUserAdmin: false });
                this.toggleAdminLogin();
            }
        });
    }

    componentWillUnmount() {
        const { socket } = this.props;
        if (socket && socket.on) {
            socket.off(`${SOCKET.BIDDINGLOG_ON_ASSETID}${this.state.currentAsset?.assetId}`);
            socket.off(`${SOCKET.ADMIN_ASSET}${this.state.currentAsset?.assetId}`);
            socket.off(`${SOCKET.ADMIN_ON_ASSET_CHANGE}${this.state.currentAsset?.assetId}`);
            socket.off(`${SOCKET.CHANGE_BID_INC_REQUEST}`);
            socket.off(`${SOCKET.ON_ASSET_CHANGE}`);
        }
    }

    connectToBidIncReqSocket = () => {
        const { socket } = this.props;
        if (socket && socket.on) {
            socket.on(`${SOCKET.CHANGE_BID_INC_REQUEST}`, (res) => {
                if (res) {
                    this.props.disableLowerBidBtn(true);
                }
            })
            socket.on(`${SOCKET.ON_ASSET_CHANGE}`, (res) => {
                if (!this.state.currentAsset) {
                    this.getAdminAssets();
                } else {
                    if (res && res.asset && res.asset.assetId !== this.state.currentAsset?.assetId && res.asset.isCurrent) {
                        const assetIdx = _findIndex(this.state.auctionAssets, { assetId: res?.asset.assetId });
                        if (assetIdx > -1) {
                            this.getAdminAssets();
                        }
                    }
                    if (res && res.asset.assetId === this.state.currentAsset?.assetId) {
                        const tempAsset = { ...this.state.currentAsset, ...res.asset }
                        this.setState({ currentAsset: tempAsset });
                        if (res.asset.status && res.asset.status !== ASSET_STATUS.RELEASED) {
                            this.moveToNextReleasedAsset(res.asset);
                        }
                    }
                }

            })
        }
    }

    connectToAssetSocket = (assetId) => {
        const { socket } = this.props;
        if (socket && socket.on) {
            socket.on(`${SOCKET.BIDDINGLOG_ON_ASSETID}${assetId}`, (res) => {
                if (res?.biddingLog.isBiddingLog) {
                    this.getBiddingLogs(assetId);
                }
            })
            socket.on(`${SOCKET.ADMIN_ASSET}${assetId}`, (result) => {
                this.getOnlineBids(assetId);
                this.setState({ showSold: false });
                if (!this.state.mute && result?.accountAssetBid?.amount > this.state.currentAsset.currentBidAmount) {
                    const audio = new Audio(soundUrl);
                    audio.muted = false;
                    audio.play();
                }
            })
            socket.on(`${SOCKET.ADMIN_ON_ASSET_CHANGE}${assetId}`, (res) => {
                if (res.result) {
                    if (res.result.assetId === this.state.currentAsset.assetId) {
                        this.setState({ assetHigestBidderDetails: res.result });
                    }
                    if (res.result.assetId === this.state.assetWinnerDetails?.assetId) {
                        this.setState({ assetWinnerDetails: res.result });
                    }
                }
            })
        }
    }

    getAdminAssets = () => {
        this.props.getAdminConsoleAssets({ auctionId: this.state.auctionId, sort: 'lotNo' }).then(res => {
            this.props.setLoading(false);
            const assets = [...res.result.assets];
            if (assets && assets.length) {
                this.setState({ auctionAssets: res.result.assets });
                const curIdx = _findIndex(assets, { isCurrent: true });
                const nextIdx = _findIndex(assets, { status: ASSET_STATUS.RELEASED, isCurrent: false });
                if (nextIdx > -1) {
                    assets[nextIdx].nextAsset = true;
                };
                if (curIdx > -1) {
                    const asset = assets[curIdx];
                    this.getAssetDetails(asset?.assetId);
                    this.getBiddingLogs(asset?.assetId);
                    this.getOnlineBids(asset?.assetId);
                    assets.splice(curIdx, 1);
                    this.setState({ winningAssetNo: curIdx + 1 })
                }
                this.setState({ assetList: assets });
            }
        })
    }

    getAuctionDetails = (auctionId) => {
        this.props.getAdminAuctionDetails(auctionId).then(res => {
            if (res.result) {
                const browserId = getItem('UNIQUE_BROWSER_ID');
                this.setState({ auctionDetails: res.result })
                if (res.result.lastActionAccount) {
                    this.setState({ showAdminAlert: true });
                    let content = '';
                    if (res.result.lastActionAccount.accountId === this.props.loggedInUser.accountId) {
                        content = `Another admin user with same user id "${res.result.lastActionAccount.firstName}" is already working on auction. Do u like to continue?`;
                    } else {
                        content = `Another admin user "${res.result.lastActionAccount.firstName}" is already working on auction. Do u like to continue?`;
                    }
                    this.setState({ adminMessage: content });
                }
                const { socket } = this.props;
                if (socket && socket.on) {
                    socket.off(`${SOCKET.BIDDINGLOG_ON_ASSETID}${this.state.currentAsset?.assetId}`);
                    socket.off(`${SOCKET.ADMIN_ASSET}${this.state.currentAsset?.assetId}`);
                    socket.off(`${SOCKET.ADMIN_ON_ASSET_CHANGE}${this.state.currentAsset?.assetId}`);
                    socket.off(`${SOCKET.CHANGE_BID_INC_REQUEST}`);
                    socket.off(`${SOCKET.ON_ASSET_CHANGE}`);
                }
                this.connectToBidIncReqSocket();
                if (socket && socket.on) {
                    socket.on(`${SOCKET.ADMIN_ALERT}${res.result.auctionId}-${this.props.loggedInUser.accountId}-${browserId}`, (response) => {
                        this.props.showMessage({
                            message: <div>{response.adminData.accountId === this.props.loggedInUser.accountId ? <span>{MESSAGES.ANOTHER_ADMIN}</span> : <span>Another admin user {response.adminData.name} joined this auction</span>}</div>,
                            autohide: false,
                            type: 'info'
                        })
                    })
                }
            }
        })
    }

    getAssetDetails = (assetId) => {
        this.props.getAdminAssetDetails({ assetId, auctionId: this.state.auctionId }).then(res => {
            const data = res.result;
            const { socket } = this.props;
            if (socket && socket.on) {
                socket.off(`${SOCKET.BIDDINGLOG_ON_ASSETID}${assetId}`);
                socket.off(`${SOCKET.ADMIN_ASSET}${assetId}`);
                socket.off(`${SOCKET.ADMIN_ON_ASSET_CHANGE}${assetId}`);
            }
            this.connectToAssetSocket(assetId);
            this.getAssetHighestBidder(assetId, true);
            this.setState({ currentAsset: data });
            this.updateAssetList(data);
            if (data.incrementBy || data.incrementBy === 0) {
                this.resetChangeBidInc(data.incrementBy);
            }
            if (!data.isCurrent) {
                this.setState({ isOnlineBidsDisable: true })
            }
        })
    }

    getAssetHighestBidder = (assetId, isWinner) => {
        this.props.getHighestBidder({ assetId, auctionId: this.state.auctionId }).then(res => {
            if (isWinner || !this.state.assetWinnerDetails || this.state.assetWinnerDetails?.assetId === assetId) {
                this.setState({ assetWinnerDetails: res.result, assetHigestBidderDetails: res.result });
            } else {
                this.setState({ assetHigestBidderDetails: res.result });
            }
        });
    }

    changeInitialBid = (value) => {
        this.setState({ initialBid: value })
    }

    changeAdminMsg = (value) => {
        this.setState({ adminMsg: value });
    }
    getBiddingLogs = (assetId, offset = 0) => {
        this.props.getAdminBiddingLogs({ auctionId: this.state.auctionId, assetId, limit: 20, offset, isBiddingLog: 1 }).then(res => {
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

    getOnlineBids = (assetId) => {
        if (assetId && this.state.auctionId) {
            this.props.getAdminOnlineBids({ assetId, auctionId: this.state.auctionId, limit: 100 }).then(res => {
                this.setState({ isOnlineBidsDisable: false });
                if (res.result.length) {
                    this.setState({ onlineBids: res.result });
                } else {
                    this.setState({ onlineBids: [] });
                }
            }).catch(() => {
                this.setState({ isOnlineBidsDisable: false });
            })
        }
    }

    sendMessage = (msg) => {
        if (msg !== 'Last Call') {
            this.addImpNotes(`Admin Msg: ${msg}`);
            const logReq = {
                "auctionId": this.state.auctionId,
                "assetId": this.state.currentAsset.assetId,
                "message": msg,
                isBiddingLog: true,
                label: 'Admin',
                type: 'adminMsg'
            }
            this.addAdminLog(logReq);
        } else {
            this.setState({ showSold: true });
            const logReq = {
                "auctionId": this.state.auctionId,
                "assetId": this.state.currentAsset.assetId,
                "message": 'Last Call',
                isBiddingLog: true,
                label: `Bid: ${toAmount(this.state.currentAsset.currentBidAmount)}`,
                type: 'AdminAction',
            }
            this.addAdminLog(logReq);
            this.props.lastCallRequest({ assetId: this.state.currentAsset.assetId, auctionId: this.state.currentAsset.auctionData.auctionId, lotNo: this.state.currentAsset.lotNo }).then(res => {
            })
        }
    }

    addImpNotes = () => {
        const req = {
            "auctionId": this.state.auctionId,
            "message": this.state.adminMsg
        }
        this.props.addAdminImpNotes(req).then(() => {
            this.setState({ adminMsg: '' })
        })
    }

    addAdminLog = (req) => {
        this.props.addAdminBidddingLog(req).then(() => {
            this.setState({ adminMsg: '' });
        })
    }

    updateAssetList = (currentAsset) => {
        const tempAssets = this.state.assetList.map((item) => {
            if (item.assetId === currentAsset.assetId) {
                return currentAsset;
            } else {
                return item;
            }
        })
        this.setState({ assetList: tempAssets })
    }

    reopenAsset = (curAsset) => {
        const { auctionId } = this.state;
        this.props.adminReopenAsset({ auctionId, assetId: curAsset.assetId }).then(() => {
            const logReq = {
                "auctionId": this.state.auctionId,
                "assetId": curAsset.assetId,
                "message": `Lot ${curAsset.lotNo} Reopened`,
                isBiddingLog: true,
                label: `Admin: ${toAmount(curAsset.currentBidAmount)}`,
                type: 'adminMsg'
            }
            this.addAdminLog(logReq);
        })
    }

    jumpToLot = (curAsset) => {
        const { auctionId } = this.state;
        this.props.adminReopenAsset({ auctionId, assetId: curAsset.assetId }).then(() => {
            const logReq = {
                "auctionId": this.state.auctionId,
                "assetId": curAsset.assetId,
                "message": `Lot ${curAsset.lotNo} is in Auction now`,
                isBiddingLog: true,
                label: `Admin: ${toAmount(curAsset.currentBidAmount)}`,
                type: 'adminMsg'
            }
            this.addAdminLog(logReq);
        })
    }

    acceptBid = (bid) => {
        this.setState({ isOnlineBidsDisable: true, showSold: false });
        bid.currentBidAmount = bid.amount;
        this.props.adminAdmitBid(bid).then(res => {
            const tempAsset = { ...this.state.currentAsset }
            if (res.result) {
                tempAsset.currentBidAmount = bid.amount;
            }
            this.props.removeAllMessages();
            this.getOnlineBids(bid.assetId);
            this.setState({ currentAsset: tempAsset });
            this.getAssetHighestBidder(bid.assetId);
            this.enableLowerBidButton(bid.assetId);
        }).catch(() => {
            this.setState({ isOnlineBidsDisable: false });
        })

    }

    onChangeBIdInc = () => {
        this.setState({ isChangeBidInc: true });
    }

    resetChangeBidInc(value) {
        changeBidInc = changeBidInc.map(obj => {
            if (value && obj.value === value) {
                obj.isCurrentInc = true;
            } else {
                obj.isCurrentInc = false;
            }
            return obj;
        });
        this.setState({ changeBidincrements: changeBidInc });
    }
    onBidIncClick = (value, curAsset) => {
        if (curAsset.isCurrent || this.state.currentAsset.status === 'Released') {
            this.setState({ showSold: false, disableBidIncrement: true });
            this.resetChangeBidInc(value);
            this.props.removeAllMessages();
            if (this.state.isChangeBidInc) {
                const req = {
                    assetId: curAsset.assetId,
                    auctionId: this.state.auctionId,
                    "amount": value
                }
                this.props.adminChangeAssetIncrement(req).then(res => {
                    this.enableLowerBidButton(curAsset.assetId);
                    if (curAsset.incrementBy) {
                        const logReq = {
                            "auctionId": this.state.auctionId,
                            "assetId": this.state.currentAsset.assetId,
                            "message": 'Change in bid increment',
                            isBiddingLog: true,
                            label: `Admin: ${toAmount(value)}`,
                            type: 'changeBidInc'
                        }
                        this.addAdminLog(logReq);
                    }
                    const tempAsset = { ...curAsset, incrementBy: parseFloat(value || 0) }
                    this.setState({ currentAsset: tempAsset, isChangeBidInc: false, disableBidIncrement: false });
                }).catch(() => {
                    this.setState({ disableBidIncrement: false });
                });;
            } else {
                this.confirmBid(value, curAsset);
            }
        }
    }

    confirmBid = (value, curAsset) => {
        const payload = {
            assetId: curAsset.assetId,
            bidType: "current",
            auctionId: this.state.auctionId,
            termsAgreed: true,
            bidAmount: parseFloat(curAsset.currentBidAmount || 0) + parseFloat(value || 0)
        };
        this.props.adminConfirmBid(payload).then((res) => {
            if (res.message === "Bid Confirmed successfully") {
                this.enableLowerBidButton(curAsset.assetId);
                const tempAsset = { ...curAsset, currentBidAmount: res.result.currentBidAmount }
                this.setState({ currentAsset: tempAsset, isChangeBidInc: false, disableBidIncrement: false });
                const logReq = {
                    auctionId: this.state.auctionId,
                    assetId: this.state.currentAsset.assetId,
                    message: payload.bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
                    isBiddingLog: true,
                    label: 'Bid',
                    type: 'bid'
                }
                this.addAdminLog(logReq);
                this.getOnlineBids(curAsset.assetId);
                this.getAssetHighestBidder(curAsset.assetId);
                this.props.removeAllMessages();
                if (!this.state.mute) {
                    const audio = new Audio(soundUrl);
                    audio.play();
                }
            }
        }).catch(() => {
            this.setState({ disableBidIncrement: false });
        });
    }

    initiateBidding = (initialBid, curAsset) => {
        const req = {
            assetId: curAsset.assetId,
            auctionId: this.state.auctionId,
            "currentBidAmount": initialBid
        }
        this.setState({ showSold: false });
        if (curAsset.isCurrent || curAsset.currentBidAmount) {
            if (initialBid > curAsset.currentBidAmount) {
                const payload = {
                    assetId: curAsset.assetId,
                    bidType: "current",
                    auctionId: this.state.auctionId,
                    termsAgreed: true,
                    bidAmount: parseFloat(initialBid || 0)
                };
                this.props.adminConfirmBid(payload).then((res) => {
                    if (res.message === "Bid Confirmed successfully") {
                        this.props.removeAllMessages();
                        this.enableLowerBidButton(curAsset.assetId);
                        const tempAsset = { ...curAsset, currentBidAmount: res.result.currentBidAmount }
                        this.setState({ currentAsset: tempAsset, isChangeBidInc: false });
                        this.getOnlineBids(curAsset.assetId);
                        this.getAssetHighestBidder(curAsset.assetId);
                        this.changeInitialBid('');
                        const logReq = {
                            auctionId: this.state.auctionId,
                            assetId: this.state.currentAsset.assetId,
                            message: payload.bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
                            isBiddingLog: true,
                            label: 'Bid',
                            type: 'bid'
                        }
                        this.addAdminLog(logReq);
                        if (!this.state.mute) {
                            const audio = new Audio(soundUrl);
                            audio.play();
                        }
                    }
                })

            } else {
                this.props.showMessage({
                    messageId: 'Admin_Message',
                    message: <div>
                        <span>{MESSAGES.PLACE_BID_CURRENT_BID}</span>
                    </div>,
                    type: 'warning'
                });
            }
        } else {
            this.props.adminInitiateBidding(req).then(() => {
                const logReq = {
                    auctionId: this.state.auctionId,
                    assetId: this.state.currentAsset.assetId,
                    message: `Lot ${curAsset.lotNo} opened - ${initialBid.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`,
                    isBiddingLog: true,
                    label: 'Admin',
                    type: 'adminMsg'
                }
                this.addAdminLog(logReq);
                const tempAsset = { ...curAsset, currentBidAmount: initialBid, isCurrent: true };
                this.setState({ currentAsset: tempAsset, isChangeBidInc: false }, () => {
                    this.updateAssetList(this.state.currentAsset);
                    this.getAssetHighestBidder(curAsset.assetId);
                });
                this.changeInitialBid('');
            })
        }
    }

    moveToNextReleasedAsset = (curAsset) => {
        const nextIndex = _findIndex(this.state.assetList, item => {
            return (item.status === ASSET_STATUS.RELEASED && !item.isCurrent)
        });
        if (nextIndex > -1) {
            this.jumpToLot(this.state.assetList[nextIndex]);
        } else {
            this.getAssetDetails(curAsset.assetId);
        }
    }

    passInAsset = (curAsset) => {
        this.props.adminPassInAsset({ auctionId: this.state.auctionId, assetId: curAsset.assetId }).then(() => {
            const logReq = {
                auctionId: this.state.auctionId,
                assetId: this.state.currentAsset.assetId,
                message: `Lot ${curAsset.lotNo} Passed In`,
                isBiddingLog: true,
                label: `Admin: ${toAmount(this.state.currentAsset.currentBidAmount)}`,
                type: 'AdminAction'
            }
            this.addAdminLog(logReq);
        })
    }

    referAsset = (curAsset) => {
        this.props.adminReferAsset({ auctionId: this.state.auctionId, assetId: curAsset.assetId }).then(() => {
            const logReq = {
                auctionId: this.state.auctionId,
                assetId: this.state.currentAsset.assetId,
                message: `Lot ${curAsset.lotNo} Referred`,
                isBiddingLog: true,
                label: `Admin: ${toAmount(this.state.currentAsset.currentBidAmount)}`,
                type: 'AdminAction'
            }
            this.addAdminLog(logReq);
        })
    }

    soldAsset = (curAsset) => {
        this.props.adminSoldAsset({ auctionId: this.state.auctionId, assetId: curAsset.assetId }).then(() => {
            const logReq = {
                auctionId: this.state.auctionId,
                assetId: this.state.currentAsset.assetId,
                message: `Lot ${curAsset.lotNo} Sold`,
                isBiddingLog: true,
                label: `Admin: ${toAmount(this.state.currentAsset.currentBidAmount)}`,
                type: 'AdminAction'
            }
            this.addAdminLog(logReq);
            this.setState({ showSold: false, isOnlineBidsDisable: true });
            this.getAssetHighestBidder(curAsset.assetId);
        })
    }

    rollbackBid = (rollbackAsset) => {
        this.props.adminRollbackBid({ assetId: rollbackAsset.assetId, auctionId: this.state.auctionId, currentBidAmount: rollbackAsset.currentBidAmount }).then(() => {
            const logReq = {
                auctionId: this.state.auctionId,
                assetId: this.state.currentAsset.assetId,
                message: 'Previous bid has been rolledback',
                isBiddingLog: true,
                label: `Admin: ${toAmount(rollbackAsset.currentBidAmount)}`,
                type: 'AdminAction'
            }
            this.addAdminLog(logReq);
            this.getAssetHighestBidder(this.state.currentAsset.assetId);
            this.props.removeAllMessages();
            this.getOnlineBids(rollbackAsset.assetId);
        })
    }

    suspendAuction = () => {
        this.props.adminSuspendAuction({ auctionId: this.state.auctionId }).then(() => {
            const auction = { ...this.state.auctionDetails, status: 'Suspended' };
            this.setState({ auctionDetails: auction });
            let assetId = this.state.currentAsset?.assetId;
            if (!assetId) {
                const asset = _find(this.state.assetList, { nextAsset: true });
                assetId = asset?.assetId;
            }
            const logReq = {
                auctionId: this.state.auctionId,
                assetId,
                message: 'Auction has been suspended due to some reason. It will be resumed soon.',
                isBiddingLog: true,
                label: 'Admin',
                type: 'adminMsg'
            }
            this.addAdminLog(logReq);
        })
    }

    resumeAuction = () => {
        this.props.adminResumeAuction({ auctionId: this.state.auctionId }).then(() => {
            const auction = { ...this.state.auctionDetails, status: 'Open' }
            this.setState({ auctionDetails: auction });
            this.getAdminAssets();
            let assetId = this.state.currentAsset?.assetId;
            if (!assetId) {
                const asset = _find(this.state.assetList, { nextAsset: true });
                assetId = asset?.assetId;
            }
            const logReq = {
                auctionId: this.state.auctionId,
                assetId,
                message: 'Auction has been Resumed',
                isBiddingLog: true,
                label: 'Admin',
                type: 'adminMsg'
            }
            this.addAdminLog(logReq);
        })
    }

    enableLowerBidButton = (assetId) => {
        this.props.adminEnableLowerBidButton({ assetId, auctionId: this.state.auctionId }).then(() => {
            this.props.disableLowerBidBtn(false);
        })
    }

    nextAvailBid = (currentAmount, lastPlacedBid) => {
        currentAmount === null ? currentAmount = 0 : currentAmount = currentAmount;
        lastPlacedBid === null ? lastPlacedBid = 0 : lastPlacedBid = lastPlacedBid;
        return ((currentAmount + lastPlacedBid).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) || toAmount(0));
    }

    resetAsset = (curAsset) => {
        const tempList = this.state.assetList.filter(asset => asset.isCurrent && asset.assetId !== curAsset.assetId);

        if (!tempList.length) {
            this.props.adminResetAsset({ assetId: curAsset.assetId, auctionId: this.state.auctionId }).then(() => {
                const req = {
                    "auctionId": this.state.auctionId,
                    "assetId": this.state.currentAsset.assetId,
                    "message": 'Resets Auction',
                    isBiddingLog: true,
                    label: 'Admin',
                    type: 'adminMsg'
                }
                this.addAdminLog(req);
                this.changeInitialBid('');
                this.getOnlineBids(curAsset.assetId);
                this.resetChangeBidInc(0);
                this.setState({ assetWinnerDetails: null, assetHigestBidderDetails: null });
            })
        }
    }
    handleAlertClose = (key) => {
        if (!key) {
            this.props.history.push(`/auctions`);
        } else if (key) {
            this.props.notifyOtherAdmin({ auctionId: this.state.auctionId });
        }
        this.setState({ showAdminAlert: false })
    }
    gotoStatistics = () => {
        const obj = { auctionId: this.state.auctionId, auctionNum: this.state.auctionDetails.auctionNum }
        this.props.history.push(`/auction-statistics?${stringify(obj)}`)
    }

    onPrevWinnerClick = (winningAssetNo) => {
        const index = winningAssetNo - 1;
        let asset = null;
        if (index > 0) {
            asset = this.state.auctionAssets[index - 1];
            this.setState({ winningAssetNo: winningAssetNo - 1 });
        } else {
            asset = this.state.auctionAssets[this.state.auctionAssets.length - 1];
            this.setState({ winningAssetNo: this.state.auctionAssets.length });
        }
        this.props.getHighestBidder({ assetId: asset.assetId, auctionId: this.state.auctionId }).then(res => {
            this.setState({ assetWinnerDetails: res.result });
        });
    }
    onNextWinnerClick = (winningAssetNo) => {
        const index = winningAssetNo - 1;
        let asset = null;
        if (index > -1 && index < this.state.auctionAssets.length - 1) {
            asset = this.state.auctionAssets[index + 1];
            this.setState({ winningAssetNo: winningAssetNo + 1 });
        } else if (index === this.state.auctionAssets.length - 1) {
            asset = this.state.auctionAssets[0];
            this.setState({ winningAssetNo: 1 });
        }
        this.props.getHighestBidder({ assetId: asset.assetId, auctionId: this.state.auctionId }).then(res => {
            this.setState({ assetWinnerDetails: res.result });
        });
    }

    navigateToHelp = () => {
        this.props.history.push('/terms-condition');
    }

    render() {
        const {
            accountId, auctionDetails, assetList = [], auctionAssets = [], currentAsset, isLoggedIn, isUserAdmin,
            showAdminAlert, adminMsg, biddingLogs, onlineBids, isOnlineBidsDisable, showSold, changeBidincrements,
            isChangeBidInc, initialBid, mute, assetHigestBidderDetails, assetWinnerDetails, winningAssetNo, disableBidIncrement
        } = this.state;

        return (
            <div className='admin-console'>
                <Container>
                    <div className="row mx-0">
                        <div className="asset-block">
                            <div className="row mx-0">
                                <div className="asset-details-block">
                                    <CurrentAssetDetails asset={currentAsset} />
                                </div>
                                <div className="asset-carousel-block">
                                    <div className="auction-details row mx-0">
                                        <div className="auction-no col-3 px-1">
                                            <div>Auction No </div>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>{auctionDetails?.auctionNum}</Tooltip>
                                                }
                                            >
                                                <div className="val">{auctionDetails?.auctionNum}</div>
                                            </OverlayTrigger>
                                        </div>
                                        <div className="auction-name col-4 px-1">
                                            <div>Auction Name </div>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>{auctionDetails?.auctionName}</Tooltip>
                                                }
                                            >
                                                <div className="val">{auctionDetails?.auctionName}</div>
                                            </OverlayTrigger>
                                        </div>
                                        <div className="auction-loc col-5 px-1">
                                            <div>Auction Location </div>
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
                                    <CarouselAssets assetList={assetList} isAdmin={true} jumpToLot={this.jumpToLot} reopenAsset={this.reopenAsset} />
                                </div>
                                <BiddingLogs logs={biddingLogs} onScrollToEnd={this.onLogsScrollToEnd} accountId={accountId} isAdmin={true} incrementBy={currentAsset?.incrementBy} currentBidAmount={currentAsset?.currentBidAmount} />
                                <div className="bg-wrapper">&nbsp;</div>
                            </div>
                        </div>
                        <div className="online-bids-block">
                            <div className="actions">
                                <div>
                                    Help:{" "}<SvgComponent className="cursor" onClick={this.navigateToHelp} path="help" />
                                </div>
                                <div>
                                    Volume:{" "}
                                    <Visible when={!mute}>
                                        <SvgComponent onClick={() => { this.setState({ mute: !mute }) }} role="button" path="volume-up" />
                                    </Visible>
                                    <Visible when={mute}>
                                        <SvgComponent onClick={() => { this.setState({ mute: !mute }) }} role="button" path="volume-off" />
                                    </Visible>
                                </div>
                            </div>
                            <div className="online-bid-section">
                                <OnlineBids bids={onlineBids} isDisable={isOnlineBidsDisable} assetId={currentAsset?.assetId} acceptBid={this.acceptBid} />
                                <div className="bid-info">
                                    <div className="label">Current Bid</div>
                                    <div className="bid-amount">{toAmount(parseFloat(_get(currentAsset, 'currentBidAmount') || 0))}</div>
                                    <div className="label mt-2">Next Bid Available</div>
                                    {!currentAsset && <div className="bid-amount">{toAmount(0)}</div>}
                                    {_get(currentAsset, 'currentBidAmount') >= _get(currentAsset, 'lastPlacedBid') && (
                                        <div className="bid-amount">{this.nextAvailBid(parseFloat(_get(currentAsset, 'currentBidAmount') || 0), parseFloat(_get(currentAsset, 'incrementBy') || 0))}</div>
                                    )}
                                    {_get(currentAsset, 'currentBidAmount') < _get(currentAsset, 'lastPlacedBid') && (
                                        <div className="bid-amount">{this.nextAvailBid(parseFloat(_get(currentAsset, 'lastPlacedBid') || 0), parseFloat(_get(currentAsset, 'incrementBy') || 0))}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mx-0">
                        <div className="bidding-info">
                            <div className="highest-bid-card">
                                <div className="d-flex align-items-center">
                                    <div className="current-badge">Current</div>
                                    <div className="highest-badge">Highest Bidder</div>
                                    <div className="svg-div"><SvgComponent path="gavel" /></div>
                                </div>
                                <Visible when={assetHigestBidderDetails}>
                                    <Visible when={!assetHigestBidderDetails?.assetAccount?.isAdmin}>
                                        <div className="bidder-name">{assetHigestBidderDetails?.assetAccount?.firstName ? assetHigestBidderDetails?.assetAccount?.firstName : ''} {assetHigestBidderDetails?.assetAccount?.lastName ? assetHigestBidderDetails?.assetAccount?.lastName : ''}</div>
                                    </Visible>
                                    <Visible when={assetHigestBidderDetails?.assetAccount?.isAdmin}>
                                        <div className="bidder-name">Room Bidder</div>
                                    </Visible>
                                    <div className="info">
                                        <SvgComponent path="account_circle_black" />
                                        <span className="amount">{assetHigestBidderDetails?.currentBidAmount ? toAmount(assetHigestBidderDetails?.currentBidAmount) : toAmount(0)}</span>
                                        <span className="lot-no">Lot No. {assetHigestBidderDetails?.associatedAssets?.lotNo}</span>
                                    </div>
                                    <div className="alias-container">
                                        <Visible when={!assetHigestBidderDetails?.assetAccount?.isAdmin}>
                                            <span className="alias-name">{assetHigestBidderDetails?.assetAccount?.accountAlias.alias}</span>
                                        </Visible>
                                        <span className={`log-posting-time ${assetHigestBidderDetails?.assetAccount?.isAdmin ? 'ml-36' : ''}`}>{dayjs(assetHigestBidderDetails?.createdDate).format('HH:mm A')}</span>
                                    </div>
                                </Visible>
                            </div>
                            <div className="highest-bid-card winning-section">
                                <Button className="winning-prev" onClick={() => { this.onPrevWinnerClick(winningAssetNo) }} ><SvgComponent path="arrow-prev" /></Button>
                                <div className="d-flex align-items-center">
                                    <Visible when={(assetWinnerDetails && assetWinnerDetails.status === ASSET_STATUS.SOLD) || !assetWinnerDetails}>
                                        <div className="winners-badge">Winners</div>
                                        <div className="winner-svg"><SvgComponent path="emoji_events_black_24dp" /></div>
                                    </Visible>
                                    <Visible when={assetWinnerDetails && assetWinnerDetails.status !== ASSET_STATUS.SOLD}>
                                        <div className="highest-badge">Highest Bidder</div>
                                        <div className="svg-div"><SvgComponent path="gavel" /></div>
                                    </Visible>
                                    <div className={`asset-no ${assetWinnerDetails && assetWinnerDetails.status !== ASSET_STATUS.SOLD ? 'ml-27' : ''}`}>{`No. ${winningAssetNo} of ${auctionAssets.length}`}</div>
                                </div>
                                <Visible when={assetWinnerDetails}>
                                    <Visible when={!assetWinnerDetails?.assetAccount?.isAdmin}>
                                        <div className="bidder-name">{assetWinnerDetails?.assetAccount?.firstName ? assetWinnerDetails?.assetAccount?.firstName : ''} {assetWinnerDetails?.assetAccount?.lastName ? assetWinnerDetails?.assetAccount?.lastName : ''}</div>
                                    </Visible>
                                    <Visible when={assetWinnerDetails?.assetAccount?.isAdmin}>
                                        <div className="bidder-name">Room Bidder</div>
                                    </Visible>
                                    <div className="info">
                                        <SvgComponent path="account_circle_black" />
                                        <span className="amount">{assetWinnerDetails?.currentBidAmount ? toAmount(assetWinnerDetails?.currentBidAmount) : toAmount(0)}</span>
                                        <span className="lot-no">Lot No. {assetWinnerDetails?.associatedAssets?.lotNo}</span>
                                    </div>
                                    <div className="alias-container">
                                        <Visible when={!assetWinnerDetails?.assetAccount?.isAdmin}>
                                            <span className="alias-name">{assetWinnerDetails?.assetAccount?.accountAlias.alias}</span>
                                        </Visible>
                                        <span className={`log-posting-time ${assetWinnerDetails?.assetAccount?.isAdmin ? 'ml-35' : ''}`}>{dayjs(assetWinnerDetails?.createdDate).format('HH:mm A')}</span>
                                    </div>
                                </Visible>
                                <Button className="winning-next" onClick={() => { this.onNextWinnerClick(winningAssetNo) }}><SvgComponent path="arrow-next" /></Button>
                            </div>
                        </div>
                        <div className="asset-actions-wrapper">
                            <div className="asset-actions">
                                <div className="title">Asset Actions</div>
                                <Button variant="outline-warning" className="mt-2" disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && !currentAsset.isCurrent) || (currentAsset && currentAsset.status === 'Sold') || (currentAsset && !currentAsset.currentBidAmount)} onClick={() => { this.rollbackBid(currentAsset) }}>Roll Back Bid</Button>
                                <Visible when={!showSold}>
                                    <Button variant="outline-warning" disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && !currentAsset.isCurrent) || (currentAsset && currentAsset.status === 'Sold') || (currentAsset && !currentAsset.currentBidAmount)} onClick={(e) => this.sendMessage('Last Call', currentAsset?.assetId)}>Last Call</Button>
                                </Visible>
                                <Visible when={showSold}>
                                    <div className="d-flex">
                                        <Button className="mr-1" variant="outline-warning" disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && !currentAsset.isCurrent) || (currentAsset && currentAsset.status === 'Sold') || (currentAsset && !currentAsset.currentBidAmount)} onClick={(e) => this.sendMessage('Last Call', currentAsset?.assetId)}>Last Call</Button>
                                        <Button disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && !currentAsset.isCurrent) || (currentAsset && currentAsset.status === 'Sold') || (currentAsset && !currentAsset.currentBidAmount)} variant="outline-warning" onClick={e => this.soldAsset(currentAsset)}>SOLD</Button>
                                    </div>
                                </Visible>
                                <Button variant="outline-warning" disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && !currentAsset.isCurrent) || (currentAsset && currentAsset.status === 'Passed In') || (currentAsset && currentAsset.status === 'Sold')} onClick={e => this.passInAsset(currentAsset)}>Pass In</Button>
                                <Button variant="outline-warning" disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && !currentAsset.isCurrent) || (currentAsset && currentAsset.status === 'Referred') || (currentAsset && currentAsset.status === 'Sold')} onClick={e => this.referAsset(currentAsset)}>Refer</Button>
                            </div>
                        </div>
                        <div className="auction-actions">
                            <Button variant="outline-dark" disabled={(auctionDetails?.status === 'Suspended') || !currentAsset || (currentAsset && (currentAsset.status === 'Sold' || currentAsset.status === 'Passed In' || currentAsset.status === 'Referred'))} className="bid-inc-btn" onClick={this.onChangeBIdInc}>Bid Increment</Button>
                            <div className="bid-inc-block">
                                {changeBidincrements.map((bidInc, index) => (
                                    <Button key={index} className={bidInc.isCurrentInc ? 'current-inc bid-inc' : 'bid-inc'} disabled={(auctionDetails?.status === 'Suspended') || (currentAsset && (currentAsset.status === 'Sold' || currentAsset.status === 'Passed In' || currentAsset.status === 'Referred' || (!currentAsset.incrementBy && !isChangeBidInc) || (!bidInc.isCurrentInc && !isChangeBidInc) || disableBidIncrement))} onClick={(e) => this.onBidIncClick(bidInc.value, currentAsset)} >{bidInc.label}</Button>
                                ))}
                            </div>
                            <div className="bid-actions">
                                <div className="start-auction">
                                    <div className="title">Current Bid Increment</div>
                                    <div className="bid-inc-val">{currentAsset?.incrementBy ? toAmount(currentAsset?.incrementBy) : toAmount(0)}</div>
                                    <div >
                                        <input className="form-control" disabled={(auctionDetails?.status === 'Suspended') || (currentAsset && (currentAsset.status === 'Sold' || currentAsset.status === 'Passed In' || currentAsset.status === 'Referred'))} value={initialBid} onChange={e => this.changeInitialBid(e.target.value)}
                                            onKeyPress={event => { if (event.key === 'Enter') { this.initiateBidding(initialBid, currentAsset) } }} type="number" placeholder="OPENING BID / CUSTOM BID" />
                                        <Button className="go-button" disabled={(auctionDetails?.status === 'Suspended') || (currentAsset && (currentAsset.status === 'Sold' || currentAsset.status === 'Passed In' || currentAsset.status === 'Referred'))} onClick={e => this.initiateBidding(initialBid, currentAsset)} >Start / Update Bid</Button>
                                    </div>
                                </div>
                                <div className="card p-2">
                                    <Button variant="danger" disabled={(auctionDetails?.status === 'Suspended')} onClick={() => { this.resetAsset(currentAsset) }}>Reset Asset</Button>
                                    <Button variant="danger" className={`${(auctionDetails && auctionDetails?.status !== 'Suspended') ? 'd-block w-100 m-0 mt-1' : 'd-none'} `} onClick={(e) => this.suspendAuction()}>Suspend</Button>
                                </div>
                            </div>
                        </div>
                        <div className="bottom-block">
                            <div className="stats-div">
                                <Button onClick={this.gotoStatistics}>Statistics</Button>
                            </div>
                            <div className="msg-block">
                                <input disabled={!currentAsset} className="msg-input" type="text" value={adminMsg}
                                    onKeyPress={event => { if (event.key === 'Enter') { this.sendMessage(adminMsg, currentAsset.assetId) } }}
                                    onChange={e => this.changeAdminMsg(e.target.value)} placeholder="Send message to auction team" />
                                <Button disabled={!currentAsset} onClick={(e) => this.sendMessage(adminMsg, currentAsset.assetId)}>Send</Button>
                            </div>
                        </div>
                    </div>
                </Container >
                <div className={`${(auctionDetails && auctionDetails?.status === 'Suspended') ? 'suspended' : 'd-none'} `}>
                    <span>Auction has been suspended due to some reason. It will be resumed soon.
                        <Button variant="warning" className={`${(auctionDetails && auctionDetails?.status === 'Suspended') ? 'd-block ml-2' : 'd-none'} `} onClick={(e) => this.resumeAuction()}>Resume</Button>
                    </span>
                </div>
                <div className={`${(isLoggedIn && isUserAdmin) ? 'd-none' : 'suspended'} `}>
                </div>
                {
                    this.props.loggedInUser && <Modal show={showAdminAlert} className="admin-alert-modal">
                        <Modal.Header>
                            <Modal.Title>Alert!</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{this.state.adminMessage}
                            <div>Click continue if you would like to continue with same user name.</div>
                            <div>Click close to exit from this auction.</div></Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" className="btn btn-outline-warning" onClick={(e) => this.handleAlertClose(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={(e) => this.handleAlertClose(true)}>
                                Continue
                            </Button>
                        </Modal.Footer>
                    </Modal>
                }
            </div >
        );
    }

}


export default withRouter(AdminConsole);