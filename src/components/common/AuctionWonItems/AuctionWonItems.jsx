import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { SOCKET, ASSET_LIST_TYPE } from '../../../utils/constants';
import './AuctionWonItems.scss';
import _get from 'lodash/get';
import CommonCards from '../CommonCards';
import CommonTable from '../CommonTable';
import _cloneDeep from 'lodash/cloneDeep';
import { screenWidth } from '../../../utils/helpers';
import NoResults from '../../common/NoResults';
import Pagination from '../Pagination';
import AssetCards from '../AssetCards';
import CommonLargeCards from '../CommonLargeCards';
import Paynow from '../Paynow/Paynow';
import Alert from 'react-bootstrap/Alert';

let sortByOptions = [
	{ key: 'lotNo', label: 'Lot No' },
	{ key: 'myHighestBid/asc', label: 'Price -- Low to High' },
	{ key: 'myHighestBid/desc', label: 'Price -- High to Low' },
	{ key: 'createdDate/desc', label: 'Recently Added' },
];

const pageSizeOptions = [
	{ key: 12, label: '12' },
	{ key: 36, label: '36' },
	{ key: 60, label: '60' },
	{ key: 96, label: '96' },
];
class AuctionWonItems extends Component {
	state = {
		showPaynow: false,
		winningAssets: [],
		selectedItems: {},
		sortPaging: this.props.location?.state
			? this.props.location?.state
			: { sortBy: 'lotNo', pageSize: 12, activePage: 0 },
		totalRecord: 0,
		itemWonPage: true,
		selectAll: false,
		loadingMessage: 'Loading...',
	};
	componentDidMount() {
		if (!this.props.isLoggedIn) {
			this.props.history.push('/');
		} else {
			this.getAuctionWon(this.state.sortPaging);
			this.openSocket();
		}
	}
	getAuctionWon = (sortPaging) => {
		this.props.setLoading(true);
		const { sortBy, pageSize, activePage } = sortPaging;
		const offset = activePage * pageSize;
		const [sort, direction = 'asc'] = sortBy.split('/');
		this.props
			.getAuctionWonAssets({
				limit: pageSize,
				offset,
				sort,
				direction,
				currentSection: 'MY_ACCOUNT',
			})
			.then((res) => {
				this.setState({
					winningAssets: res.result,
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
	openSocket = () => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
				const { winningAssets } = this.state;
				const { loggedInUser } = this.props;
				const cloned = _cloneDeep(winningAssets);
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
								winningAssets: cloned,
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
	onPaginationChange = (data) => {
		this.setState({ winningAssets: [] });
		this.getAuctionWon(data);
		this.props.history.push({
			pathName: `/my-account/items-won`,
			state: { ...data },
		});
	};
	onChangeSelection = (e, asset) => {
		const { checked } = e.target;
		const selectedItems = _cloneDeep(this.state.selectedItems);
		if (asset === 'allAsset' && checked) {
			this.setState({ selectAll: true });
			this.state.winningAssets &&
				this.state.winningAssets.forEach((item) => {
					selectedItems[item.assetId] = checked;
					this.setState({ selectedItems });
				});
		} else if (asset === 'allAsset' && !checked) {
			this.setState({ selectAll: false });
			this.state.winningAssets &&
				this.state.winningAssets.forEach((item) => {
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
	onPayClick = () => {
		this.setState({
			showPaynow: true,
		});
	};

	togglePaynow = () => {
		this.setState({
			showPaynow: false,
		});
	};

	render() {
		const {
			showMessage,
			setLoading,
			activeView,
			loggedInUser,
			socket,
			toggleLogin,
			isLoggedIn,
		} = this.props;
		const {
			showPaynow,
			winningAssets,
			sortPaging,
			totalRecord,
			itemWonPage,
			selectedItems,
			selectAll,
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
					onChange={this.onPaginationChange}
					sortByOptions={sortByOptions}
					pageSizeOptions={pageSizeOptions}
				/>
			</div>
		);
		return (
			<div className="auction-won-block">
				<h2 className="account-option-title">Items Won</h2>
				<Alert
					key={1}
					variant={'success'}
				>
					Please note items will take a minimum of 1 hour to display
					in your items won section after an auction finishes. Check
					your active bids to see if you were the highest bidder.
				</Alert>
				{winningAssets.length !== 0 && sortPageViewSection}
				{winningAssets.length === 0 ? (
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
									{winningAssets.map(
										(winningAsset, index) => (
											<CommonCards
												key={index}
												assetListType={
													ASSET_LIST_TYPE.AUCTION_WINNING
												}
												openSocket={this.openSocket}
												onPayClick={this.onPayClick}
												assetInfo={winningAsset}
												loggedInUser={loggedInUser}
												toggleLogin={toggleLogin}
												isLoggedIn={isLoggedIn}
											/>
										)
									)}{' '}
								</>
							) : screenWidth() === 'md' ? (
								<>
									{
										// <div className="checkbox-custom-css">
										//   <Form.Check
										//     type="checkbox"
										//     custom
										//     id={`watchAsset${winningAssets.length}`}
										//   >
										//     <Form.Check.Input
										//       value={true}
										//       type="checkbox"
										//       checked={selectAll}
										//       name={`watchAsset${winningAssets.length}`}
										//       onChange={(e) =>
										//         this.onChangeSelection(e, "allAsset")
										//       }
										//     />
										//     <Form.Check.Label></Form.Check.Label>
										//   </Form.Check>
										// </div>
									}
									{winningAssets.map(
										(winningAsset, index) => (
											<CommonLargeCards
												key={index}
												assetListType={
													ASSET_LIST_TYPE.AUCTION_WINNING
												}
												onPayClick={this.onPayClick}
												onChangeSelection={
													this.onChangeSelection
												}
												openSocket={this.openSocket}
												assetInfo={winningAsset}
												loggedInUser={loggedInUser}
												toggleLogin={toggleLogin}
												selectedItems={selectedItems}
												isLoggedIn={isLoggedIn}
											/>
										)
									)}
									{/* <div className="pull-right-btn">
                                        <Button className="pay-buttom" disabled={Object.keys(selectedItems).length === 0} variant="outline-warning" onClick={this.onPayClick}> <SvgComponent path="paid_white_24dp" /> Pay Selected</Button>
                                    </div> */}
									{showPaynow && (
										<Paynow
											showMessage={showMessage}
											setLoading={setLoading}
											amount={1}
											onCancel={this.togglePaynow}
											onSuccess={this.togglePaynow}
										/>
									)}{' '}
								</>
							) : (
								<>
									<CommonTable
										sortBy={sortBy}
										onSortClick={this.onPaginationChange}
										onPayClick={this.onPayClick}
										onChangeSelection={
											this.onChangeSelection
										}
										openSocket={this.openSocket}
										assetListType={
											ASSET_LIST_TYPE.AUCTION_WINNING
										}
										assetList={winningAssets}
										showMessage={this.props.showMessage}
										selectedItems={selectedItems}
										loggedInUser={loggedInUser}
										toggleLogin={toggleLogin}
										isLoggedIn={isLoggedIn}
									/>
									{/* <div className="pull-right-btn">
                                            <Button className="pay-buttom" disabled={Object.keys(selectedItems).length === 0} variant="outline-warning" onClick={this.onPayClick}> <SvgComponent path="paid_white_24dp" /> Pay Selected</Button>
                                        </div> */}
									{showPaynow && (
										<Paynow
											showMessage={showMessage}
											setLoading={setLoading}
											amount={1}
											onCancel={this.togglePaynow}
											onSuccess={this.togglePaynow}
										/>
									)}
								</>
							)}
						</div>
						{activeView === 'grid' && window.screen.width < 767 && (
							<div className="cards-block-mobile">
								<AssetCards
									loggedInUser={loggedInUser}
									socket={socket}
									toggleLogin={toggleLogin}
									items={winningAssets}
									showMessage={showMessage}
									total={winningAssets.totalRecords}
									sortPaging={sortPaging}
									history={this.props.history}
									itemWonPage={itemWonPage}
									onPayClick={this.onPayClick}
								/>
								{/* <div className="pull-right-btn">
                  <Button
                    className="pay-buttom"
                    disabled={Object.keys(selectedItems).length === 0}
                    variant="outline-warning"
                    onClick={this.onPayClick}
                  >
                    {" "}
                    <SvgComponent path="paid_white_24dp" /> Pay Selected
                  </Button>
                </div> */}
								{showPaynow && (
									<Paynow
										showMessage={showMessage}
										setLoading={setLoading}
										amount={1}
										onCancel={this.togglePaynow}
										onSuccess={this.togglePaynow}
									/>
								)}
							</div>
						)}
					</>
				)}
			</div>
		);
	}
}
export default withRouter(AuctionWonItems);
