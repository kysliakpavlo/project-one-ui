import React from 'react';
import dayjs from 'dayjs';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import { withRouter } from 'react-router';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import NoResults from '../NoResults';
import Pagination from '../Pagination';
import AssetCards from '../AssetCards';
import CommonCards from '../CommonCards';
import CommonTable from '../CommonTable';
import CommonLargeCards from '../CommonLargeCards';
import { SOCKET } from '../../../utils/constants';
import { toUrlString, screenWidth } from '../../../utils/helpers';

import './WatchedItems.scss';

let sortByOptions = [
	{ key: 'lastViewedDate/desc', label: 'Recently Viewed' },
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

class WatchedItems extends React.Component {
	state = {
		bidPlacedForAsset: null,
		bidValue: null,
		selectedItems: {},
		watchingAssets: [],
		totalRecord: 0,
		selectedBuyNowItem: {},
		selectAll: false,
		watchedItemPage: true,
		highlightAsset: null,
		sortPaging: this.props.location?.state
			? this.props.location?.state
			: {
					sortBy: this.props.recentlyViewedItem
						? 'lastViewedDate'
						: 'datetimeClose/asc',
					pageSize: 12,
					activePage: 0,
			  },
		loadingMessage: 'Loading...',
	};

	componentDidMount() {
		if (!this.props.isLoggedIn) {
			this.props.history.push('/');
		} else {
			this.fetchWatchList(this.state.sortPaging);
			this.openSocket();
		}
	}
	componentDidUpdate(prevProps) {
		const { isLivePanelOpen } = this.props;
		if (prevProps.isLivePanelOpen !== isLivePanelOpen && !isLivePanelOpen) {
			this.fetchWatchList(this.state.sortPaging);
		}
	}
	fetchWatchList = (sortPaging) => {
		this.setState({ watchingAssets: [] });
		this.props.setLoading(true);
		const { sortBy, pageSize, activePage } = sortPaging;
		const offset = activePage * pageSize;
		const [
			sort,
			direction = `${
				this.props.recentlyViewedItem && sortBy === 'lastViewedDate'
					? 'desc'
					: 'asc'
			}`,
		] = sortBy.split('/');
		if (!this.props.recentlyViewedItem) {
			this.props
				.getUserPanelWatchingAsset({
					limit: pageSize,
					offset,
					sort,
					direction,
					currentSection: 'MY_ACCOUNT',
				})
				.then((res) => {
					this.setState({
						watchingAssets: res.result,
						watchedItemPage: true,
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
		} else {
			this.props
				.getRecentlyWatchedItems({
					limit: pageSize,
					offset,
					sort,
					direction,
					currentSection: 'MY_ACCOUNT',
				})
				.then((res) => {
					this.setState({
						watchingAssets: res.result,
						watchedItemPage: false,
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
		}
	};
	openSocket = () => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
				const { watchingAssets } = this.state;
				const { loggedInUser } = this.props;
				const cloned = _cloneDeep(watchingAssets);
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
								watchingAssets: cloned,
								highlightAsset: asset.assetId,
							});
							if (this.props.recentlyViewedItem) {
								this.setState({ watchedItemPage: true });
							} else {
								this.setState({ watchedItemPage: false });
							}
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
	openAssetBuyNowChannel = (assetId) => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(
				`${SOCKET.BUY_NOW_STATUS_CHANGE}${assetId}`,
				(response) => {
					const { watchingAssets } = this.props;
					const cloned = _cloneDeep(watchingAssets);
					const item = cloned.find(
						(i) => i.assetId === response.asset.assetId
					);
					if (item) {
						item.status = response.asset.status;
					}
					this.updateItems(cloned);
				}
			);
		}
	};
	updateItems = (items) => {
		this.setState({
			watchingAssets: items,
		});
	};
	customBidHandler = (value, assetId, assetDetail) => {
		const { watchingAssets } = this.props;
		this.setState({ bidValue: value });
		const calPremiumAmt = parseFloat(
			((assetDetail.buyersPremium && assetDetail.buyersPremium) / 100) *
				value
		);
		const calCreditfee = parseFloat(
			((assetDetail.creditCardFee && assetDetail.creditCardFee) / 100) *
				value
		);
		const total = parseFloat(
			parseFloat(calPremiumAmt) +
				parseFloat(calCreditfee) +
				parseFloat(value)
		);
		watchingAssets.forEach((item) => {
			if (item.assetId === assetId) {
				item.calculatedTotal = total;
			}
		});
	};

	disableColumn = (auctionOpenDAte, auctionClose) => {
		const r =
			dayjs() >= dayjs(auctionOpenDAte) && dayjs() <= dayjs(auctionClose)
				? true
				: false;
		return r;
	};
	disableAbsenteeClosed = (auctionClose) => {
		const res = dayjs() <= dayjs(auctionClose) ? true : false;
		return res;
	};

	onChangeSelection = (e, asset) => {
		const { checked } = e.target;
		const selectedItems = _cloneDeep(this.state.selectedItems);
		if (asset === 'allAsset' && checked) {
			this.setState({ selectAll: true });
			this.state.watchingAssets &&
				this.state.watchingAssets.forEach((item) => {
					selectedItems[item.assetId] = checked;
					this.setState({ selectedItems });
				});
		} else if (asset === 'allAsset' && !checked) {
			this.setState({ selectAll: false });
			this.state.watchingAssets &&
				this.state.watchingAssets.forEach((item) => {
					delete selectedItems[item.assetId];
					this.setState({ selectedItems });
				});
		} else {
			if (checked) {
				selectedItems[asset.assetId] = checked;
			} else {
				this.setState({ selectAll: false });
				delete selectedItems[asset.assetId];
			}
			this.setState({ selectedItems });
		}
	};

	deletetedFromRow = (e, assetObj) => {
		const assetId = assetObj.assetId;
		this.props
			.removeFromWatchList({ assetId })
			.then((res) => {
				this.props.showMessage({ message: res.message });
				let request = this.state.sortPaging;
				this.fetchWatchList && this.fetchWatchList(request);
			})
			.catch((err) => {
				this.props.showMessage({
					message: err.message,
					type: 'warning',
				});
			});
	};
	removeFromWatchList = () => {
		const { selectedItems } = this.state;
		const assetId = Object.keys(selectedItems).join();
		this.props
			.removeFromWatchList({ assetId })
			.then((res) => {
				this.props.showMessage({ message: res.message });
				let request = this.state.sortPaging;
				this.fetchWatchList && this.fetchWatchList(request);
			})
			.catch((err) => {
				this.props.showMessage({
					message: err.message,
					type: 'warning',
				});
			});
	};
	closeSocket = () => {
		const { socket } = this.props;
		socket.off(SOCKET.ON_ASSET_CHANGE);
	};
	onPaginationChange = (data) => {
		this.setState({ watchingAssets: [] });
		this.fetchWatchList(data);
		this.props.history.push({
			pathName: this.props.recentlyViewedItem
				? `/my-account/recently-viewed`
				: `/my-account/watchlist`,
			state: { ...data },
		});
	};

	render() {
		const {
			watchingAssets,
			selectedItems,
			selectAll,
			sortPaging,
			watchedItemPage,
			totalRecord,
			highlightAsset,
			loadingMessage,
		} = this.state;
		const {
			loggedInUser,
			activeView,
			socket,
			toggleLogin,
			isLoggedIn,
			recentlyViewedItem,
			showMessage,
		} = this.props;
		const { sortBy, pageSize, activePage } = sortPaging;

		const filterSort = (obj) => {
			let result = [];
			result = recentlyViewedItem
				? obj
				: obj.filter((obj) => obj.label !== 'Recently Viewed');
			return result;
		};
		const sortPageViewSection = (
			<div className="sort-block">
				<Pagination
					total={totalRecord}
					pageSize={pageSize}
					active={activePage}
					sortBy={sortBy}
					onChange={this.onPaginationChange}
					sortByOptions={filterSort(sortByOptions)}
					pageSizeOptions={pageSizeOptions}
				/>
			</div>
		);

		console.log('watched item page === ', watchedItemPage);

		return (
			<div className="watched-item-block">
				<h2 className="account-option-title">
					{watchedItemPage ? 'Watchlist' : 'Recently Viewed'}
				</h2>
				{watchingAssets.length !== 0 && sortPageViewSection}
				{watchingAssets.length === 0 ? (
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
									{watchingAssets &&
										watchingAssets.map(
											(watchingAsset, index) => (
												<CommonCards
													key={index}
													assetInfo={watchingAsset}
													highlightAsset={
														highlightAsset
													}
													openSocket={this.openSocket}
													loggedInUser={loggedInUser}
													toggleLogin={toggleLogin}
													isLoggedIn={isLoggedIn}
													validateUser={
														this.validateUser
													}
													watchedItemPage={
														watchedItemPage
													}
													showMessage={
														this.props.showMessage
													}
													fetchWatchList={
														this.fetchWatchList
													}
												/>
											)
										)}{' '}
								</>
							) : screenWidth() === 'md' ? (
								<>
									{watchedItemPage && (
										<div className="checkbox-custom-css">
											<Form.Check
												type="checkbox"
												custom
												id={`watchAsset${watchingAssets.length}`}
											>
												<Form.Check.Input
													value={true}
													type="checkbox"
													checked={selectAll}
													name={`watchAsset${watchingAssets.length}`}
													onChange={(e) =>
														this.onChangeSelection(
															e,
															'allAsset'
														)
													}
												/>
												<Form.Check.Label></Form.Check.Label>
											</Form.Check>
										</div>
									)}
									{watchingAssets.length === 0 && (
										<NoResults />
									)}
									{watchingAssets &&
										watchingAssets.map(
											(watchingAsset, index) => (
												<CommonLargeCards
													key={index}
													assetInfo={watchingAsset}
													highlightAsset={
														highlightAsset
													}
													openSocket={this.openSocket}
													validateUser={
														this.validateUser
													}
													watchedItemPage={
														watchedItemPage
													}
													showMessage={
														this.props.showMessage
													}
													loggedInUser={loggedInUser}
													fetchWatchList={
														this.fetchWatchList
													}
													selectedItems={
														selectedItems
													}
													onChangeSelection={
														this.onChangeSelection
													}
												/>
											)
										)}
									{watchedItemPage && (
										<div className="pull-right-btn">
											<Button
												variant="outline-warning"
												className="bg-color-btn"
												disabled={_isEmpty(
													selectedItems
												)}
												onClick={
													this.removeFromWatchList
												}
											>
												Remove selected items
											</Button>
										</div>
									)}
								</>
							) : (
								<>
									<CommonTable
										sortBy={sortBy}
										updateItems={this.updateItems}
										onSortClick={this.onPaginationChange}
										highlightAsset={highlightAsset}
										openSocket={this.openSocket}
										watchedItemPage={watchedItemPage}
										assetList={watchingAssets}
										loggedInUser={loggedInUser}
										showMessage={this.props.showMessage}
										selectedItems={selectedItems}
										deletetedFromRow={this.deletetedFromRow}
										onChangeSelection={
											this.onChangeSelection
										}
										selectAll={selectAll}
									/>

									{watchedItemPage && (
										<div className="pull-right-btn">
											<Button
												variant="outline-warning"
												className="bg-color-btn"
												disabled={_isEmpty(
													selectedItems
												)}
												onClick={
													this.removeFromWatchList
												}
											>
												Remove selected items
											</Button>
										</div>
									)}
								</>
							)}
						</div>
						{activeView === 'grid' && (
							<div className="cards-block-mobile">
								<AssetCards
									loggedInUser={loggedInUser}
									socket={socket}
									toggleLogin={toggleLogin}
									items={watchingAssets}
									updateItems={this.updateItems}
									showMessage={showMessage}
									total={watchingAssets.totalRecords}
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

export default withRouter(WatchedItems);
