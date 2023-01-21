import React from 'react';
import { parse } from 'qs';
import Pdf from "react-to-pdf";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Modal from 'react-bootstrap/Modal';
import Dropdown from "react-bootstrap/Dropdown";

import CountCards from '../../common/CountCards';
import GroupedBarChart from '../../common/GroupedBarChart';
import Visible from "../../common/Visible";
import OnlineUsers from '../../common/OnlineUsers';
import AssetListTable from '../../common/AssetListTable';
import { SOCKET, ASSET_STATUS } from "../../../utils/constants";
import { preventEvent } from "../../../utils/helpers";
import AuctionStatsExcel from '../../common/AuctionStatsExcel';

import './AuctionStatisticsView.scss';

const ref = React.createRef();
const stats = [
    { label: 'Total Assets', count: 0, color: 'primary', key: 'totalAssetCount' },
    { label: 'Total Online Users', count: 0, color: 'success', key: 'totalActiveUserCount' },
    { label: 'Maximum Sold Margin', count: 0, color: 'secondary', key: 'maximumMargin' },
    { label: 'Total Passed In Assets', count: 0, color: 'info', key: 'passedAssetCount' },
    { label: 'Total Referred Assets', count: 0, color: 'warning', key: 'referredAssetCount' },
    { label: 'Total Sold Assets', count: 0, color: 'danger', key: 'soldAssetCount' }
]

const REFRESH_PAGE = 'Refresh-Page';
class AuctionStatisticsView extends React.Component {
    state = {
        isLoggedIn: false,
        auctionId: null,
        auctionNum: null,
        activeUsers: [],
        auctionStats: stats,
        currentModal: '',
        chartData: [],
        showModal: false,
        assetList: [],
        currentTableTitle: ''
    }

    componentDidMount() {
        this.props.setLoading(false);
        if (this.props.loggedInUser && this.props.loggedInUser.accountId && this.props.loggedInUser.role === 'Admin') {
            this.setState({ isLoggedIn: true }, () => {
                const params = parse(this.props.location.search, { ignoreQueryPrefix: true });
                if (params.auctionId) {
                    this.setState({ auctionId: params.auctionId });
                }
                if (params.auctionNum) {
                    this.setState({ auctionNum: params.auctionNum }, () => {
                        this.getActiveUsers();
                        this.getAuctionStatistics();
                        this.getAuctionAssetStatistics();
                        this.connectToAssetChangeSocket();
                    });
                }
            });
        } else {
            this.setState({ isLoggedIn: false });
            this.toggleAdminLogin();
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.loggedInUser && prevState.isLoggedIn) {
            this.setState({ isLoggedIn: false });
        } else if (this.props.loggedInUser && !prevState.isLoggedIn && !this.state.isLoggedIn && this.props.loggedInUser.role === 'Admin') {
            this.setState({ isLoggedIn: true }, () => {
                const params = parse(this.props.location.search, { ignoreQueryPrefix: true });
                if (params.auctionId) {
                    this.setState({ auctionId: params.auctionId });
                }
                if (params.auctionNum) {
                    this.setState({ auctionNum: params.auctionNum }, () => {
                        this.getActiveUsers();
                        this.getAuctionStatistics();
                        this.getAuctionAssetStatistics();
                        this.connectToAssetChangeSocket();
                    });
                }
            });
        }
    }

    toggleAdminLogin = () => {
        this.props.toggleLogin(true, () => {
            if (this.props.loggedInUser && this.props.loggedInUser.role === 'Admin') {
                this.setState({ isLoggedIn: true }, () => {
                    const params = parse(this.props.location.search, { ignoreQueryPrefix: true });
                    if (params.auctionId) {
                        this.setState({ auctionId: params.auctionId });
                    }
                    if (params.auctionNum) {
                        this.setState({ auctionNum: params.auctionNum }, () => {
                            this.getActiveUsers();
                            this.getAuctionStatistics();
                            this.getAuctionAssetStatistics();
                            this.connectToAssetChangeSocket();
                        });
                    }
                });
            } else {
                this.setState({ isLoggedIn: false });
                this.displayMessage("Login with Admin credentials");
                this.toggleAdminLogin();
            }
        });
    }

    connectToAssetChangeSocket = () => {
        const { socket } = this.props;
        socket.on(`${SOCKET.AUCTION_STATISTICS_CHANGE}${this.state.auctionId}`, (res) => {
            if (res && res[REFRESH_PAGE]) {
                this.getActiveUsers();
                this.getAuctionStatistics();
                this.getAuctionAssetStatistics();
            }
        })
    }


    getActiveUsers = () => {
        const req = {};
        if (this.state.auctionId) {
            req.auctionId = this.state.auctionId;
        } else if (this.state.auctionNum) {
            req.auctionNum = this.state.auctionNum;
        }
        this.props.getAuctionActiveUsers(req).then(res => {
            if (res.result) {
                this.setState({ activeUsers: res.result, auctionId: res.result[0]?.auctionId });
            } else {
                this.setState({ activeUsers: [] });
            }
        });
    }

    getAuctionStatistics = () => {
        const req = {};
        if (this.state.auctionId) {
            req.auctionId = this.state.auctionId;
        } else if (this.state.auctionNum) {
            req.auctionNum = this.state.auctionNum;
        }
        this.props.getAuctionStats(req).then(res => {
            if (res.result) {
                const temp = this.state.auctionStats.map(stat => {
                    stat.count = res.result[stat.key] ? res.result[stat.key] : 0;
                    return stat;
                });
                this.setState({ auctionStats: temp });
            }
        });
    }

    getAuctionAssetStatistics = () => {
        const req = {};
        if (this.state.auctionId) {
            req.auctionId = this.state.auctionId;
        } else if (this.state.auctionNum) {
            req.auctionNum = this.state.auctionNum;
        }
        this.props.getAuctionAssetsStats(req).then(res => {
            if (res.result) {
                this.setState({ chartData: res.result });
            }
        });
    }

    openStatisticsModal = (val) => {
        if (val.key.includes('Asset')) {
            const req = {
                auctionId: this.state.auctionId
            }
            switch (val.key) {
                case 'passedAssetCount':
                    req.status = "Passed In";
                    break;
                case 'referredAssetCount':
                    req.status = "Referred";
                    break;
                case 'soldAssetCount':
                    req.status = "Sold";
                    break;
                default:
                    req.auctionId = this.state.auctionId;
            }
            this.setState({ currentModal: 'AssetTable', showModal: true, currentTableTitle: val.label });
            this.getAuctionAssets(req);
        } else {
            this.setState({ currentModal: val.key, showModal: true });
        }
    }

    getAuctionAssets = (req) => {
        this.props.searchAssets(req).then(res => {
            if (res.result) {
                this.setState({ assetList: res.result?.searchResult });
            }
        })
    }

    handleClose = () => {
        this.setState({ showModal: false });
    };

    render() {
        const { auctionId, activeUsers, chartData, showModal, assetList, currentTableTitle, isLoggedIn } = this.state;

        return (
            <div className="auction-statistics-view"  >
                <Container>

                    <Dropdown className='download-btn mt-2'>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Export
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>
                                <AuctionStatsExcel auctionId={auctionId} onlineUsers={activeUsers} chartData={chartData} />
                            </Dropdown.Item>
                            <Dropdown.Item >
                                <Pdf options={{
                                    orientation: 'p',
                                    unit: 'px',
                                    format: [1466, 860],
                                }} targetRef={ref} filename="auction-statistics.pdf">
                                    {({ toPdf }) => <button className="export-btn" onClick={toPdf}>Export Images as PDF</button>}
                                </Pdf></Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <div ref={ref} className="mt-2">
                        <h2 > <strong>Auction Summary</strong></h2>
                        <CountCards data={stats} openStatisticsModal={this.openStatisticsModal} />
                        <GroupedBarChart data={chartData} />
                        <h4 className="m-2"><strong>Online Users</strong></h4>
                        <OnlineUsers activeUsers={activeUsers} />

                        <Visible when={showModal && this.state.currentModal === 'totalActiveUserCount'}>
                            <Modal className="modal-xs auction-modal" show={showModal && this.state.currentModal === 'totalActiveUserCount'} onHide={this.handleClose} onClick={preventEvent}>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Online Users
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="show-grid">
                                    <OnlineUsers activeUsers={activeUsers} />
                                </Modal.Body>
                            </Modal>
                        </Visible>
                        <Visible when={showModal && this.state.currentModal === 'AssetTable'}>
                            <Modal className="modal-xs auction-modal" show={showModal && this.state.currentModal === 'AssetTable'} onHide={this.handleClose} onClick={preventEvent}>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        {currentTableTitle}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="show-grid">
                                    <AssetListTable assetList={assetList} />
                                </Modal.Body>
                            </Modal>
                        </Visible>
                        <Visible when={showModal && this.state.currentModal === 'maximumMargin'}>
                            <Modal className="modal-xs auction-modal" show={showModal && this.state.currentModal === 'maximumMargin'} onHide={this.handleClose} onClick={preventEvent}>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Asset Margin
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="show-grid">
                                    <Table className="table-striped table-bordered mt-2 mb-2">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>HighestBid Amount</th>
                                                <th>Reserve Price</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData && chartData.map(asset => {
                                                return (
                                                    <Visible when={asset.status === ASSET_STATUS.SOLD}>
                                                        <tr>
                                                            <td>{asset.title}</td>
                                                            <td>{asset.currentBidAmount}</td>
                                                            <td>{asset.reservePrice ? asset.reservePrice : 0}</td>
                                                            <td>{asset.status}</td>
                                                        </tr>
                                                    </Visible>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </Modal.Body>
                            </Modal>
                        </Visible>
                    </div>
                </Container >
                <div className={`${isLoggedIn ? 'd-none' : 'suspended'} `}></div>
            </div >
        )
    }
}

export default AuctionStatisticsView;