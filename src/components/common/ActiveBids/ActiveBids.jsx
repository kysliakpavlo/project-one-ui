import React from 'react';
import { withRouter } from 'react-router';
import _get from 'lodash/get';
import { SOCKET } from '../../../utils/constants';
import './ActiveBids.scss';
import _cloneDeep from 'lodash/cloneDeep';
import CommonCards from '../CommonCards';
import CommonLargeCards from '../CommonLargeCards';
import Pagination from '../Pagination';
import { screenWidth } from '../../../utils/helpers';
import CommonTable from '../CommonTable';
import AssetCards from '../AssetCards';
import NoResults from '../NoResults';
import Visible from '../Visible';

let sortByOptions = [
	{ key: 'lotNo', label: 'Lot No' },
	{ key: 'currentBidAmount/asc', label: 'Price -- Low to High' },
	{ key: 'currentBidAmount/desc', label: 'Price -- High to Low' },
	{ key: 'createdDate/desc', label: 'Recently Added' },
	{ key: 'datetimeClose/asc', label: 'Closing Soon' },
];

const pageSizeOptions = [
	{ key: 12, label: '12' },
	{ key: 36, label: '36' },
	{ key: 60, label: '60' },
	{ key: 96, label: '96' },
];

class ActiveBids extends React.Component {
	state = {
		activeAssets: [],
		highlightAsset: null,
		totalRecord: 0,
		sortPaging: this.props.location?.state
			? this.props.location?.state
			: { sortBy: 'datetimeClose/asc', pageSize: 12, activePage: 0 },
		loadingMessage: 'Loading...',
		isConnected: false,
	};
	componentDidMount() {
		if (!this.props.isLoggedIn) {
			this.props.history.push('/');
		} else {
			this.getActiveList(this.state.sortPaging);
			this.openSocket();
		}
	}
	componentDidUpdate(prevProps) {
		const { isLivePanelOpen, isConnected } = this.props;
		if (prevProps.isLivePanelOpen !== isLivePanelOpen && !isLivePanelOpen) {
			this.setState({ activeAssets: [] });
			this.getActiveList(this.state.sortPaging);
		}
		if (prevProps.isConnected !== isConnected) {
			this.getActiveList(this.state.sortPaging);
		}
	}
	componentWillUnmount() {
		this.closeSocket();
	}
	getActiveList = (sortPaging) => {
		this.props.setLoading(true);
		const { sortBy, pageSize, activePage } = sortPaging;
		const offset = activePage * pageSize;
		const [sort, direction = 'asc'] = sortBy.split('/');
		this.props
			.getUserActiveAsset({
				limit: pageSize,
				offset,
				sort,
				direction,
				currentSection: 'MY_ACCOUNT',
			})
			.then((res) => {
				this.setState({
					activeAssets: res.result,
					sortPaging,
					totalRecord: res.totalRecords,
				});
				this.props.setLoading(false);
				res.result.length === 0 &&
					this.setState({ loadingMessage: 'No asset found' });
			})
			.catch((err) => {
				this.props.setLoading(false);
			});
	};
	updateItems = (data) => {
		this.setState({ activeAssets: data });
	};
	openSocket = () => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
				const { activeAssets } = this.state;
				const { loggedInUser } = this.props;
				const cloned = _cloneDeep(activeAssets);
				const accountId = _get(loggedInUser, 'accountId');

				const item = cloned.find((i) => i.assetId === asset.assetId);
				cloned.forEach((j) => {
					if (j.auctionData.auctionId === asset.auctionId) {
						j.termsAgreed = true;
					}
				});

				if (item) {
					this.props
						.getListAssetDetail({
							assetId: asset.assetId,
							auctionId: asset.auctionId,
						})
						.then((res) => {
							item.accountId = res.result.accountId;
							item.highestBidder = asset.accountId === accountId;
							item.currentBidAmount = res.result.currentBidAmount;
							item.datetimeClose = res.result.datetimeClose;
							item.isExtended = res.result.isExtended;
							item.totalBidsPlaced = asset.totalBidsAsset;
							item.myHighestBid = res.result.myHighestBid;
							item.calculatedTotal = '';
							item.enteredAmt = '';
							item.creditCardFee = '';
							item.calPremiumAmt = '';
							item.premiumPercent = '';
							this.setState({
								activeAssets: cloned,
								highlightAsset: asset.assetId,
							});
							setTimeout(() => {
								this.setState({ highlightAsset: null });
							}, 3000);
						})
						.catch((err) => {
							this.props.showMessage({
								message: err.message,
								type: 'error',
							});
						});
				}
			});
		}
	};

	closeSocket = () => {
		const { socket } = this.props;
		socket.off(SOCKET.ON_ASSET_CHANGE);
	};

	onChangeSortPaging = (data) => {
		this.setState({ activeAssets: [] });
		this.getActiveList(data);
		this.props.history.push({
			pathName: `/my-account/active-bid`,
			state: { ...data },
		});
	};

	render() {
		const {
			loggedInUser,
			activeView,
			socket,
			toggleLogin,
			showMessage,
			isLoggedIn,
			isConnected,
		} = this.props;
		const {
			activeAssets,
			highlightAsset,
			sortPaging,
			totalRecord,
			loadingMessage,
		} = this.state;
		const { sortBy, pageSize, activePage } = sortPaging;

		const sortPageViewSection = (
			<div className="sort-block">
				<Pagination
					total={totalRecord}
					pageSize={pageSize}
					active={activePage}
					sortBy={sortBy}
					onChange={this.onChangeSortPaging}
					sortByOptions={sortByOptions}
					pageSizeOptions={pageSizeOptions}
				/>
			</div>
		);
		return (
			<div className="active-bids">
				<h2 className="account-option-title">Active Bids</h2>
				<Visible when={!isConnected}>
					<h3 className="h3-time">
						Connection Lost...Reconnecting...
					</h3>
				</Visible>
				{activeAssets.length !== 0 && sortPageViewSection}
				{activeAssets.length === 0 ? (
					<NoResults message={loadingMessage} />
				) : (
					<>
						<div
							className={
								screenWidth() === 'md' && activeView !== 'grid'
									? 'large-cards-block'
									: 'cards-block'
							}
						>
							{activeView === 'grid' ? (
								<>
									{activeAssets.map((activeAsset, index) => (
										<CommonCards
											key={index}
											highlightAsset={highlightAsset}
											openSocket={this.openSocket}
											loggedInUser={loggedInUser}
											toggleLogin={toggleLogin}
											isLoggedIn={isLoggedIn}
											assetInfo={activeAsset}
											showMessage={this.props.showMessage}
										/>
									))}{' '}
								</>
							) : screenWidth() === 'md' ? (
								<>
									{activeAssets.map((activeAsset, index) => (
										<CommonLargeCards
											key={index}
											highlightAsset={highlightAsset}
											openSocket={this.openSocket}
											loggedInUser={loggedInUser}
											toggleLogin={toggleLogin}
											isLoggedIn={isLoggedIn}
											assetInfo={activeAsset}
											showMessage={this.props.showMessage}
										/>
									))}{' '}
								</>
							) : (
								<CommonTable
									sortBy={sortBy}
									updateItems={this.updateItems}
									openSocket={this.openSocket}
									onSortClick={this.onChangeSortPaging}
									assetList={activeAssets}
									highlightAsset={highlightAsset}
									loggedInUser={loggedInUser}
									toggleLogin={toggleLogin}
									isLoggedIn={isLoggedIn}
									showMessage={this.props.showMessage}
								/>
							)}
						</div>

						{activeView === 'grid' && (
							<div className="cards-block-mobile">
								<AssetCards
									loggedInUser={loggedInUser}
									socket={socket}
									toggleLogin={toggleLogin}
									items={activeAssets}
									updateItems={this.updateItems}
									showMessage={showMessage}
									total={activeAssets.totalRecords}
									sortPaging={sortPaging}
									history={this.props.history}
								/>
							</div>
						)}
						<div className="footer-section">
							{sortPageViewSection}
						</div>
					</>
				)}
			</div>
		);
	}
}
export default withRouter(ActiveBids);
