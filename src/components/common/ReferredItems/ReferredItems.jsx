import React from 'react';
import dayjs from 'dayjs';
import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import { withRouter } from 'react-router';
import NoResults from '../NoResults';
import Pagination from '../Pagination';
import AssetCards from '../AssetCards';
import CommonCards from '../CommonCards';
import CommonTable from '../CommonTable';
import CommonLargeCards from '../CommonLargeCards';
import { SOCKET, MESSAGES } from '../../../utils/constants';
import { encrypt, toUrlString, screenWidth } from '../../../utils/helpers';

import './ReferredItems.scss';

let sortByOptions = [
	{ key: 'lotNo', label: 'Lot No' },
	{ key: 'currentBidAmount/asc', label: 'Price -- Low to High' },
	{ key: 'currentBidAmount/desc', label: 'Price -- High to Low' },
	{ key: 'createdDate/desc', label: 'Recently Added' },
];

const pageSizeOptions = [
	{ key: 12, label: '12' },
	{ key: 36, label: '36' },
	{ key: 60, label: '60' },
	{ key: 96, label: '96' },
];
class ReferredItems extends React.Component {
	state = {
		referredAssets: [],
		bidPlacedForAsset: null,
		bidValue: null,
		selectedItems: {},
		sortPaging: this.props.location?.state
			? this.props.location?.state
			: { sortBy: 'lotNo', pageSize: 12, activePage: 0 },
		totalRecord: 0,
		loadingMessage: 'Loading...',
	};
	componentDidMount() {
		if (!this.props.isLoggedIn) {
			this.props.history.push('/');
		} else {
			this.openSocket();
			this.fetchReferredList(this.state.sortPaging);
		}
	}
	componentDidUpdate(prevProps) {
		const { isLivePanelOpen } = this.props;
		if (!this.props.isLoggedIn) {
			this.props.history.push('/');
		}
		if (prevProps.isLivePanelOpen !== isLivePanelOpen && !isLivePanelOpen) {
			this.setState({ referredAssets: [] });
			this.fetchReferredList(this.state.sortPaging);
		}
	}
	componentWillUnmount() {
		this.closeSocket();
	}
	openSocket = () => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
				const { referredAssets } = this.state;
				const { loggedInUser } = this.props;
				const cloned = _cloneDeep(referredAssets);
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
								referredAssets: cloned,
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
	fetchReferredList = (sortPaging) => {
		this.props.setLoading(true);
		const { sortBy, pageSize, activePage } = sortPaging;
		const offset = activePage * pageSize;
		const [sort, direction = 'asc'] = sortBy.split('/');
		this.props
			.getReferredAsset({
				limit: pageSize,
				offset,
				sort,
				direction,
				currentSection: 'MY_ACCOUNT',
			})
			.then((res) => {
				this.setState({
					referredAssets: res.result,
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
		this.setState({ referredAssets: data });
	};
	customBidHandler = (value, assetId, assetDetail) => {
		const { ReferredItems } = this.props;
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
		ReferredItems.forEach((item) => {
			if (item.assetId === assetId) {
				item.calculatedTotal = total;
			}
		});
	};

	getAssetId = (value, assetId) => {
		this.setState({ bidValue: value });
		// setBidPlacedForAsset(assetId)
	};
	closeSocket = () => {
		const { socket } = this.props;
		socket.off(SOCKET.ON_ASSET_CHANGE);
	};
	onPlaceBidConfirm = (data) => {
		const { showMessage, loggedInUser } = this.props;
		if (
			loggedInUser &&
			(!loggedInUser.cardExist ||
				(loggedInUser.overrideCardCheck && loggedInUser.cardExist))
		) {
			this.props.showMessage({
				message: MESSAGES.CARD_MISSING,
				type: 'error',
			});
			this.props.history.push('/profile?onComplete');
		} else {
			this.confirmBid(data)
				.then((res) => {
					if (res && res.statusCode !== 200) {
						showMessage({ message: res.message });
						return false;
					} else {
						this.setState({ bidPlacedForAsset: data.assetId });
						showMessage({
							message: (
								<div>
									<div>
										{/* {res.message} */}
										<div>
											{data.bidType === 'absentee-bid' ? (
												<span>
													{MESSAGES.ABSENTEE_BID}
												</span>
											) : data.bidType === 'auto' ? (
												<span>{MESSAGES.AUTO_BID}</span>
											) : (
												<span>
													{MESSAGES.BID_PLACED}
												</span>
											)}
										</div>
									</div>
								</div>
							),
						});
					}
				})
				.catch((res) => {
					showMessage({ message: res.message });
				});
		}
	};
	validateUser = (e, item) => {
		const { isLoggedIn, toggleLogin, loggedInUser, history } = this.props;
		e.stopPropagation();
		e.preventDefault();
		const itemObj = toUrlString({
			auctionId: item.auctionData.auctionId,
			timeZone: '',
			location: item.state.name,
			auctionName: item.auctionData.auctionName,
			auctionNumber: '',
			startDate: item.createdDate,
			endDate: item.datetimeClose,
		});
		if (loggedInUser && loggedInUser.role === 'Admin') {
			history.push(
				`/admin-console/${encrypt(item.auctionData.auctionId)}`
			);
		} else if (isLoggedIn) {
			this.callTermsCondition(
				item.assetId,
				item.auctionData.auctionId,
				itemObj
			);
		} else if (!isLoggedIn) {
			toggleLogin(true, () =>
				this.callTermsCondition(
					item.assetId,
					item.auctionData.auctionId,
					itemObj
				)
			);
		}
	};

	callTermsCondition = (assetId, auctionId, item) => {
		const { history, loggedInUser } = this.props;
		this.props.getBidValues({ assetId, auctionId }).then((res) => {
			document.body.style.overflow = '';
			history.push('/');
			if (loggedInUser && !loggedInUser.cardExist) {
				this.props.showMessage({
					message: MESSAGES.CARD_MISSING,
					type: 'error',
				});
				history.push(`/profile?onComplete=/terms-condition?${item}`);
			} else if (res.result.termsAgreed) {
				history.push({
					pathname: `/simulcast-auction/${encrypt(auctionId)}`,
					search: '',
					state: { asset: assetId },
				});
			} else {
				history.push(`/terms-condition?${item}`);
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
		if (checked) {
			selectedItems[asset.assetId] = checked;
		} else {
			delete selectedItems[asset.assetId];
		}
		this.setState({ selectedItems });
	};

	removeFromWatchList = () => {
		const { selectedItems } = this.state;
		const assetId = Object.keys(selectedItems).join();
		this.props
			.removeFromWatchList({ assetId })
			.then((res) => {
				this.props.onChange(res);
			})
			.catch((err) => {
				this.props.showMessage({
					message: err.message,
					type: 'warning',
				});
			});
	};
	onChangeSortPaging = (data) => {
		this.setState({ referredAssets: [] });
		this.fetchReferredList(data);
		this.props.history.push({
			pathName: `/my-account/referred-assets`,
			state: { ...data },
		});
	};

	render() {
		const { referredAssets, sortPaging, totalRecord, loadingMessage } =
			this.state;
		const {
			loggedInUser,
			activeView,
			socket,
			toggleLogin,
			showMessage,
			isLoggedIn,
		} = this.props;
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
			<div className="referred-item-block">
				<h2 className="account-option-title">Referred Assets</h2>
				{referredAssets.length !== 0 && sortPageViewSection}
				{referredAssets.length === 0 ? (
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
									{referredAssets.map(
										(referredItem, index) => (
											<CommonCards
												key={index}
												assetInfo={referredItem}
												openSocket={this.openSocket}
												showMessage={showMessage}
												loggedInUser={loggedInUser}
												toggleLogin={toggleLogin}
												isLoggedIn={isLoggedIn}
											/>
										)
									)}{' '}
								</>
							) : screenWidth() === 'md' ? (
								<>
									{referredAssets.map(
										(referredItem, index) => (
											<CommonLargeCards
												key={index}
												assetInfo={referredItem}
												openSocket={this.openSocket}
												showMessage={showMessage}
												loggedInUser={loggedInUser}
												toggleLogin={toggleLogin}
												isLoggedIn={isLoggedIn}
											/>
										)
									)}{' '}
								</>
							) : (
								<>
									<CommonTable
										sortBy={sortBy}
										updateItems={this.updateItems}
										onSortClick={this.onChangeSortPaging}
										openSocket={this.openSocket}
										showMessage={showMessage}
										assetList={referredAssets}
										loggedInUser={loggedInUser}
										toggleLogin={toggleLogin}
										isLoggedIn={isLoggedIn}
									/>
								</>
							)}
						</div>
						{activeView === 'grid' && (
							<div className="cards-block-mobile">
								<AssetCards
									loggedInUser={loggedInUser}
									socket={socket}
									toggleLogin={toggleLogin}
									items={referredAssets}
									updateItems={this.updateItems}
									showMessage={showMessage}
									total={referredAssets.totalRecords}
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
export default withRouter(ReferredItems);
