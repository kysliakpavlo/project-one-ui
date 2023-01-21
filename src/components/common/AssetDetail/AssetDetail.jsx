import React, { useState } from 'react';
import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import { withRouter } from 'react-router-dom';
import dayjs from 'dayjs';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PredictiveSearchBar from '../../common/PredictiveSearchBar';
import Visible from '../Visible';
import SvgComponent from '../SvgComponent';
import CountdownTimer from '../../common/CountdownTimer';
import ReserveMet from '../ReserveMet';
import NotifyMe from '../../common/NotifyMe';
import AuctionAssetDetails from '../../common/AuctionAssetDetails';
import { RelatedAssetItemCards } from '../../common/RelatedAssetCards';
import { PlaceBidBottom } from '../PlaceBid';
import NoResults from '../NoResults';
import ImageGallery, { ImageGalleryView } from '../ImageGallery';
import Tooltip from 'react-bootstrap/Tooltip';
import Breadcrumb from '../../common/Breadcrumb';
import _findIndex from 'lodash/findIndex';
import Enquire from '../Enquire';
import { stringify, parse } from 'qs';
import AssetDetailsTabs from '../AssetDetailsTabs';
import {
	fromUrlString,
	preventEvent,
	toUrlString,
	encrypt,
	setAppTitle,
	toAmount,
	scrollToTop,
	getTimezoneName,
	FBShare,
	isOnline,
	isInRoom,
} from '../../../utils/helpers';
import {
	ASSET_STATUS,
	SOCKET,
	RELATED_ASSET_NAVIGATION_PAGE,
	AUCTION_TYPES,
	AUCTION_TYPES_MAP,
	DEFAULT_IMAGE,
	ASSET_TYPE,
	MESSAGES,
} from '../../../utils/constants';
import BuyNowTermsModal from '../BuyNowTermsModal/BuyNowTermsModal';
import './AssetDetail.scss';
import { Link } from 'react-router-dom';
import DownloadAuctionDocuments from '../DownloadAuctionDocuments';
import SalesNotesAndFeesModal from '../SalesNotesAndFeesModal/SalesNotesAndFeesModal';

const assetPositions = {
	next: 'next',
	prev: 'prev',
};

class AssetDetail extends React.Component {
	constructor(props) {
		super(props);

		this.BonusRef = React.createRef(null);
	}
	state = {
		assetDetail: null,
		images: [],
		watchList: false,
		showEnquire: false,
		closebutton: false,
		filters: '',
		fromAssetPage: true,
		placebidToggle: false,
		absenteeCurrentBidAmount: '',
		isAssetClosed: true,
		handleError: false,
		assetType: '',
		showBuyNowModal: false,
		pathName: '',
		auctionDocuments: [],
		pages: [],
		show: null,
		width: window.innerWidth,
		nextAssetObj: {},
		prevAssetObj: {},
		showBonusTime: false,
		currentSlide: 0,
		callBidHistory: false,
		assetTitle: '',
		assetImage: '',
		assetDescription: '',
		isConnected: false,
		isBidNowShown: false,
		showBonusPopover: false,
		targetBonus: null,
		showSalesFeesModal: false,
	};

	componentDidMount() {
		this.setAssetDetails();
		window.scrollTo({ top: 180, behavior: 'smooth' });
		this.props.setLoading(true);
	}

	componentDidUpdate(prevProps, prevState) {
		const { location, isLivePanelOpen, loggedInUser, isConnected } =
			this.props;
		if (
			(prevProps.isLivePanelOpen !== isLivePanelOpen &&
				!isLivePanelOpen) ||
			prevProps.location.search !== location.search ||
			prevProps.loggedInUser?.accountId !== loggedInUser?.accountId ||
			prevProps.isConnected !== isConnected
		) {
			if (isConnected) {
				this.setState({ assetDetail: null });
				this.setAssetDetails();
				window.scrollTo({ top: 180, behavior: 'smooth' });
			}
		}

		if (prevState.isBidNowShown !== this.state.isBidNowShown) {
			this.setState({ isBidNowShown: false });
		}
	}

	onShowBonusPopover = (e) => {
		const { targetBonus } = this.state;
		this.setState({
			showBonusPopover: !this.state.showBonusPopover,
		});
		!targetBonus && this.setState({ targetBonus: e.target });
	};

	setAssetDetails() {
		this.props.setLoading(true);
		const { location } = this.props;
		let urlParams = parse(location.search.split('?')[1]);
		let urlState = location.state;
		const consignmentNo = urlParams.consignmentNo;
		const auctionNum = urlParams.auctionNum;
		const searchCrietria =
			urlState?.searchCrietria && !_isEmpty(urlState?.searchCrietria)
				? urlState?.searchCrietria
				: null;

		urlState?.groupName && this.setState({ pathName: urlState?.groupName });
		window.addEventListener('resize', this.updateDimensions);

		// get images for related assets sidebar
		this.props.getAssetDetails({ consignmentNo, auctionNum }).then(
			async (response) => {
				const images = [];
				this.setState({ handleError: false });
				response.result.assetImages.forEach((image) => {
					const imageObj = {
						original: image?.imageUrl,
						thumbnail: image?.imageUrl,
					};
					images.push(imageObj);
				});
				const today = new Date();
				// calling next and previous assets here
				if (!_isEmpty(searchCrietria)) {
					const nextPrevAssts = !_isEmpty(searchCrietria)
						? await this.getNextPrevAssetsData(searchCrietria)
						: [];

					this.setNextPreviousAssetData(
						nextPrevAssts,
						searchCrietria,
						response.result
					);
				} else {
					this.setState({
						prevAssetObj: {
							title: response.result?.title,
							assetId: response.result?.assetId,
							assetType: response.result?.assetType,
							auctionId: response.result?.auctionData?.auctionId,
							auctionNum:
								response.result?.auctionData?.auctionNum,
							consignmentNo: response.result?.consignmentNo,
						},
						nextAssetObj: {
							title: response.result?.title,
							assetId: response.result?.assetId,
							assetType: response.result?.assetType,
							auctionId: response.result?.auctionData?.auctionId,
							auctionNum:
								response.result?.auctionData?.auctionNum,
							consignmentNo: response.result?.consignmentNo,
						},
					});
				}

				const assetDetail = { ...response.result };

				this.setState({
					assetTitle: assetDetail.title,
					assetImage: assetDetail.assetImageUrl,
					assetDescription: assetDetail.description,
				});
				if (!_isEmpty(this.props.vendor)) {
					setAppTitle(
						'Asset Details',
						this.props.vendor.name,
						this.state.assetTitle,
						this.state.assetImage,
						this.state.description
					);
				}
				const pages = [{ label: 'Home', path: '/' }];

				if (response.result?.auctionData?.isEOI) {
					pages.push({
						label: 'Expression of Interest',
						path: '/expression-of-interest',
					});
					pages.push({
						label: response.result.auctionData.auctionName,
						path: `/expression-of-interest-catalogue/${response.result.auctionData?.auctionNum}`,
					});
				} else if (assetDetail?.assetType === ASSET_TYPE.BUY_NOW) {
					pages.push({
						label: 'Buy',
						path: `/search-results?${stringify({
							assetType: 'Buy Now',
							title: 'Buy',
						})}`,
					});
				} else {
					pages.push({ label: 'Auctions', path: `/auctions` });
					pages.push({
						label: response.result.auctionData.auctionName,
						path: `/auction-catalogue/${response.result.auctionData?.auctionNum}`,
					});
				}

				pages.push({ label: response.result.title });

				if (assetDetail?.auctionData) {
					assetDetail.auctionData.termsAgreed =
						assetDetail.termsAgreed;
				}
				const { buyersPremium, ...assetDetailObj } = assetDetail;
				const state = {
					pages,
					images,
					assetDetail: assetDetailObj,
					buyersPremium,
					isAssetClosed:
						today > new Date(response.result.datetimeClose),
					watchList: response.result.isWatchListed,
					absenteeCurrentBidAmount: response.result.currentBidAmount,
					assetType: response.result.assetType,
				};
				this.setState({ ...state }, () => {
					this.openAssetDetailChannel(assetDetail.assetId);
				});
				this.props.setLoading(false);
				// set socket once data is populated
			},
			(error) => {
				this.setState({ handleError: true });
				this.props.setLoading(false);
			}
		);
	}

	setNextPreviousAssetData(
		nextPrevAssts,
		searchCrietria,
		currentAssetDetails
	) {
		let nextAssetObj = null;
		let prevAssetObj = null;
		let condition = {
			assetId: currentAssetDetails.assetId,
		};
		if (
			currentAssetDetails &&
			currentAssetDetails.auctionData &&
			currentAssetDetails.auctionData.auctionId
		) {
			condition['auctionId'] = currentAssetDetails.auctionData.auctionId;
		}
		const currentIndex = _findIndex(nextPrevAssts, condition);
		const lastIndex = nextPrevAssts.length - 1;

		// getting information of next and previous assets
		nextAssetObj = nextPrevAssts[currentIndex + 1]
			? nextPrevAssts[currentIndex + 1]
			: {};
		prevAssetObj = nextPrevAssts[currentIndex - 1]
			? nextPrevAssts[currentIndex - 1]
			: {};
		if (currentIndex === 0) {
			prevAssetObj = nextPrevAssts[lastIndex]
				? nextPrevAssts[lastIndex]
				: {};
		}
		if (currentIndex === lastIndex) {
			nextAssetObj = nextPrevAssts[0] ? nextPrevAssts[0] : {};
		}

		nextAssetObj['searchCrietria'] = searchCrietria;
		prevAssetObj['searchCrietria'] = searchCrietria;
		this.setState({
			nextAssetObj,
			prevAssetObj,
		});
	}

	onSlide = (currentSlide) => {
		this.setState({ currentSlide });
	};

	getNextPrevAssetsData({ ...searchCrietria }) {
		return new Promise((resolve, reject) => {
			this.props.getNextPrevAssets({ ...searchCrietria }).then(
				(res) => {
					resolve(res.result);
				},
				(error) => {
					this.setState({ handleError: true });
					reject({ error });
				}
			);
		});
	}

	updateDimensions = () => {
		this.setState({ width: window.innerWidth });
	};

	componentWillUnmount() {
		const { location } = this.props;
		const assetId = fromUrlString(location.search.split('?')[1]).assetId;
		this.closeAssetDetailChannel(assetId);
		window.removeEventListener('resize', this.updateDimensions);
	}

	openAssetDetailChannel = (assetId) => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(`${SOCKET.ASSET_DETAIL}${assetId}`, (response) => {
				const { assetDetail } = this.state;
				if (response.asset.pageViews) {
					this.setState({
						assetDetail: {
							..._cloneDeep(assetDetail),
							pageViews: response.asset.pageViews,
						},
					});
				}
				if (
					response.asset.totalWatchers ||
					response.asset.totalWatchers === 0
				) {
					this.setState({
						assetDetail: {
							..._cloneDeep(assetDetail),
							totalWatchers: response.asset.totalWatchers,
						},
					});
				}
			});
			socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
				const { assetDetail } = this.state;
				const { loggedInUser } = this.props;
				if (asset?.assetId === assetDetail?.assetId) {
					this.setState({
						assetDetail: {
							..._cloneDeep(assetDetail),
							currentBidAmount: asset.currentBidAmount,
							highestBidder:
								asset?.accountId === loggedInUser?.accountId,
							datetimeClose: asset.datetimeClose,
							isExtended: asset.isExtended,
							totalBidsAsset: asset.totalBidsAsset,
						},
					});
					if (this.state.activeTabKey === 'History') {
						this.props.getBiddingHistory();
					}
				}
			});
			socket.on(
				`${SOCKET.BUY_NOW_STATUS_CHANGE}${assetId}`,
				(response) => {
					const { assetDetail } = this.state;
					if (assetId === response.asset.assetId) {
						this.setState({
							assetDetail: {
								..._cloneDeep(assetDetail),
								status: response.asset.status,
							},
						});
					}
				}
			);
		}
	};

	closeAssetDetailChannel = (assetId) => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.off(`${SOCKET.ASSET_DETAIL}${assetId}`);
		}
	};

	handleGalary = () => {
		if (!this.props.loggedInUser) {
			this.setState({ show: false });
		}
	};

	handleBidNowIsShown = () => {
		this.setState({ isBidNowShown: !this.state.isBidNowShown });
	};

	onPlaceBidConfirm = (data) => {
		this.props
			.confirmBid(data)
			.then((res) => {
				if (res && res.statusCode !== 200) {
					this.props.showMessage({ message: res.message });
					return false;
				} else {
					this.setState({
						assetCardHilight: data.assetId,
						callBidHistory: true,
					});
					setTimeout(() => {
						this.setState({
							assetCardHilight: null,
							callBidHistory: false,
						});
					}, 5000);
					this.props.showMessage({
						message: (
							<div>
								<div>
									{data.bidType === 'absentee-bid' ? (
										<span>{MESSAGES.ABSENTEE_BID}</span>
									) : data.bidType === 'auto' ? (
										<span>{MESSAGES.AUTO_BID}</span>
									) : (
										<span>{MESSAGES.BID_PLACED}</span>
									)}
								</div>
							</div>
						),
						messageId: 'absenteBidOne',
					});
					this.onPlaceBidClose();
					this.setState({
						placebidToggle: !this.state.placebidToggle,
					});
				}
			})
			.catch((err) => {
				this.props.showMessage({ message: err.message });
			});
	};

	onPlaceBidClose = () => {
		this.setState({ placeBidAsset: null });
	};

	onCompleteTimer = () => {
		this.setState({ isAssetClosed: true });
	};

	toggleEnquire = (e) => {
		preventEvent(e);
		this.setState({
			showEnquire: !this.state.showEnquire,
		});
	};

	togglePlaceBid = (e) => {
		preventEvent(e);
		this.setState({
			placebidToggle: !this.state.placebidToggle,
		});
	};

	printPage = () => {
		window.print();
	};

	copyToClipboard = () => {
		const dummy = document.createElement('input'),
			text = window.location.href;

		document.body.appendChild(dummy);
		dummy.value = text;
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);
		this.props.showMessage({ message: MESSAGES.COPY_URL });
	};

	navigatoToRelatedAssets = () => {
		if (
			this.state.assetDetail?.relatedAssetNavigation ===
			RELATED_ASSET_NAVIGATION_PAGE.AUCTION_CATALOGUE
		) {
			this.props.history.push(
				`/auction-catalogue/${this.state.assetDetail?.navigationParams?.auctionNum}`
			);
		} else if (
			this.state.assetDetail?.relatedAssetNavigation ===
			RELATED_ASSET_NAVIGATION_PAGE.SEARCH_RESULT
		) {
			const obj = stringify({
				category: this.state.assetDetail?.navigationParams?.categoryId,
			});
			this.props.history.push(`/search-results?${obj}`);
		}
	};

	navigateToAsset(e, assetPosition) {
		preventEvent(e);
		const { nextAssetObj, prevAssetObj } = this.state;
		let assetDetailsObj;
		if (assetPosition === assetPositions.next) {
			assetDetailsObj = nextAssetObj;
		} else {
			assetDetailsObj = prevAssetObj;
		}
		let searchCrietria = assetDetailsObj.searchCrietria;
		let groupName = assetDetailsObj.assetType;
		this.props.history.push({
			pathName: `/asset`,
			search: stringify({
				auctionNum: assetDetailsObj.auctionNum,
				consignmentNo: assetDetailsObj.consignmentNo,
			}),
			state: { searchCrietria, groupName },
		});
	}

	onBonusTime = () => {
		this.setState({ showBonusTime: !this.state.showBonusTime });
	};

	navigateToRelatedAsset = (consignmentNo, auctionNum) => {
		let searchCrietria = this.state.assetDetail.navigationParams;
		this.props.history.push({
			pathName: `/asset`,
			search: stringify({
				auctionNum: auctionNum,
				consignmentNo: consignmentNo,
			}),
			state: { searchCrietria },
		});
		setTimeout(() => {
			scrollToTop();
		}, 300);
	};

	updateAuction = (auction) => {
		const tempAsset = { ...this.state.assetDetail };
		if (tempAsset.auctionData) {
			tempAsset.auctionData = auction;
			this.setState({ assetDetail: tempAsset });
		}
	};

	render() {
		const {
			loggedInUser,
			toggleLogin,
			showMessage,
			isLoggedIn,
			socket,
			isLoading,
			creditCardPercentage,
			isConnected,
		} = this.props;

		const {
			width,
			assetDetail,
			images,
			watchList,
			showEnquire,
			closebutton,
			showBonusTime,
			prevAssetObj,
			nextAssetObj,
			absenteeCurrentBidAmount,
			isAssetClosed,
			pages,
			show,
			currentSlide,
			showBuyNowModal,
			callBidHistory,
			showBonusPopover,
			targetBonus,
			fromAssetPage,
		} = this.state;

		const handleCloses = () => this.setState({ show: null });
		const handleShowGallery = () => this.setState({ show: 'gallery' });
		const handleShowSpiCar = () => this.setState({ show: 'spin-car' });

		const notificationUpdate = (message) => {
			const { showMessage } = this.props;
			showMessage({ message });
			const tempAuction = { ...this.state.assetDetail, isNotified: true };
			this.setState({ assetDetail: tempAuction });
		};

		const onAddToWatchList = (e) => {
			e.stopPropagation();
			e.preventDefault();
			if (!loggedInUser) {
				toggleLogin(true, triggerAddToWatchList);
			} else {
				triggerAddToWatchList(e);
			}
		};

		const buyNowHandler = (e) => {
			const isLoggedIn = !!loggedInUser;
			if (!isLoggedIn) {
				toggleLogin(true, () =>
					this.setState({ showBuyNowModal: true })
				);
			} else {
				this.setState({ showBuyNowModal: true });
			}
		};

		const handleBuyNowClose = () => {
			this.setState({ showBuyNowModal: false });
		};

		const acceptTerm = (e) => {
			const tempAsset = { ...this.state.assetDetail };
			tempAsset.termsAgreed = e.target.checked;
			this.setState({ assetDetail: tempAsset });
		};

		const buyNowClick = () => {
			this.props
				.buyNowAsset({
					assetId: this.state.assetDetail.assetId,
					termsAgreed: true,
				})
				.then((res) => {
					showMessage({ message: MESSAGES.ASSET_BOUGHT });
					this.setState({ showBuyNowModal: false });
				})
				.catch((err) => {
					showMessage({ message: err.message });
				});
		};

		const triggerAddToWatchList = (e) => {
			this.openAssetDetailChannel(assetDetail.assetId);
			this.setState({ watchList: !watchList });
			const req = {
				assetId: assetDetail.assetId,
			};
			if (assetDetail?.auctionData?.auctionId) {
				req.auctionId = assetDetail.auctionData.auctionId;
			}
			this.props.addToWatchlist(req).then((res) => {
				const { watchList } = this.state;
				showMessage({
					message:
						watchList === true
							? MESSAGES.ADD_WATCHLIST
							: MESSAGES.REMOVE_WATCHLIST,
				});
			});
		};

		const startTime = dayjs(assetDetail?.auctionData?.datetimeOpen);
		const closeTime = dayjs(assetDetail?.datetimeClose);
		const now = dayjs();

		let statusTag;
		if (startTime <= now && closeTime > now) {
			statusTag = 'Open Now';
		} else if (startTime <= now && closeTime <= now) {
			statusTag = 'Closed';
		} else if (startTime > now) {
			statusTag = `Opens Soon`;
		}

		const isNotifyAllowed =
			statusTag !== 'Closed' &&
			AUCTION_TYPES_MAP[assetDetail.auctionType?.name] !==
				AUCTION_TYPES.EOI &&
			assetDetail?.assetType !== ASSET_TYPE.BUY_NOW &&
			!(
				statusTag === 'Open Now' &&
				AUCTION_TYPES_MAP[assetDetail.auctionType?.name] ===
					AUCTION_TYPES.IN_ROOM
			);

		const isStarted =
			assetDetail &&
			assetDetail.auctionData &&
			dayjs(assetDetail.auctionData.datetimeOpen).diff(
				dayjs(),
				'milliseconds'
			) <= 0;
		const assetStatusClosed =
			assetDetail?.status === ASSET_STATUS.SOLD ||
			assetDetail?.status === ASSET_STATUS.PASSED_IN ||
			assetDetail?.status === ASSET_STATUS.REFERRED;

		return (
			<div
				className="asset-detail"
				key={this.props.location.search}
			>
				<Container>
					<div className="breadcrums px-0">
						<Breadcrumb items={pages} />
					</div>
				</Container>

				{assetDetail ? (
					<div className="container">
						<div className="d-flex justify-content-end">
							<div className="socials-wrap">
								<div className="product-details-social">
									<div className="buttons">
										<span
											className="pt social-icon"
											title="Print"
											onClick={this.printPage}
										>
											<SvgComponent path="print" />
										</span>
										{/* <a
                                    className="fb social-icon"
                                    title="Join us on Facebook"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    onClick={()=>FBShare()}
                                >
                                    <SvgComponent path="facebook" />
                                </a> */}
										<a
											className="tw social-icon"
											title="Join us on Twitter"
											rel="noopener noreferrer"
											href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
											target="_blank"
										>
											<SvgComponent path="twitter" />
										</a>
										<a
											className="in social-icon"
											title="Join us on Linked In"
											rel="noopener noreferrer"
											href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
											target="_blank"
										>
											<SvgComponent path="linkedin" />
										</a>
										<span
											className="lk social-icon"
											title="Link"
											onClick={this.copyToClipboard}
										>
											<SvgComponent path="link" />
										</span>
									</div>
								</div>

								<div className="asset-button-wrap">
									<Button
										variant="outline-primary"
										className="prev-btn"
										onClick={(e) =>
											this.navigateToAsset(
												e,
												assetPositions.prev
											)
										}
									>
										<SvgComponent path="arrow_left"></SvgComponent>{' '}
										Previous Asset
									</Button>

									<Button
										variant="outline-primary"
										className="next-btn"
										onClick={(e) =>
											this.navigateToAsset(
												e,
												assetPositions.next
											)
										}
									>
										Next Asset{' '}
										<SvgComponent path="arrow_right"></SvgComponent>
									</Button>
								</div>
							</div>
						</div>

						<div
							className={`item-container ${
								assetDetail?.assetType === ASSET_TYPE.BUY_NOW &&
								width <= 767
									? 'mbl-buy-now-mar'
									: ''
							}`}
						>
							<div className="item-row">
								<div className="item-col">
									<div className="product-details assetDetails row">
										<div className="image-Div assetDetails__image col-7">
											<Visible
												when={
													assetDetail &&
													!assetStatusClosed
												}
											>
												<Button
													variant="outline-primary"
													className={`watch-list ${
														watchList === true &&
														'active'
													}`}
													onClick={(e) =>
														onAddToWatchList(e)
													}
												>
													{watchList ? (
														<SvgComponent path="star-filled" />
													) : (
														<SvgComponent path="star_border" />
													)}
												</Button>
											</Visible>
											<Visible
												when={_get(
													assetDetail,
													'spincar'
												)}
											>
												<Button
													variant="outline-primary"
													className="spin-car"
													onClick={handleShowSpiCar}
												>
													<SvgComponent path="360_black" />
													<span className="spin-car-text">
														360
													</span>
												</Button>
											</Visible>
											{show && (
												<ImageGalleryView
													show={!!show}
													images={images}
													activeView={show}
													startIndex={currentSlide}
													assetDetail={assetDetail}
													showMessage={showMessage}
													handleClose={handleCloses}
													loggedInUser={loggedInUser}
													absenteeCurrentBidAmount={
														absenteeCurrentBidAmount
													}
													buyNowHandler={
														buyNowHandler
													}
													assetStatusClosed={
														assetStatusClosed
													}
												/>
											)}

											{images.length >= 1 ? (
												<ImageGallery
													items={images}
													onClick={handleShowGallery}
													onSlide={this.onSlide}
													showFullscreenButton={false}
													showPlayButton={false}
												/>
											) : (
												<img
													className="asset-empty-img"
													src={DEFAULT_IMAGE}
													alt="image"
												/>
											)}
										</div>
										<div className="col-5">
											<div className="product-details__summary title-visible assetDetails__infoPanel">
												<Visible
													when={
														assetDetail?.assetType !==
															ASSET_TYPE.BUY_NOW &&
														!assetDetail
															?.auctionData
															?.isEOI &&
														width <= 767
													}
												>
													<div className="auction-details assetDetails__infoPanel-title">
														<div className="online-bidding-block">
															<div className="online-svg">
																<SvgComponent path="online"></SvgComponent>
															</div>
															<div className="bid-type">
																{
																	assetDetail
																		?.auctionData
																		.auctionType
																		?.name
																}
															</div>
														</div>
														<div className="details">
															<div className="row mt-2 mx-0">
																<div className="col-6 label-blod">
																	Auction No.
																</div>
																<div className="col-6 val">
																	{assetDetail?.assetType ===
																	ASSET_TYPE.BUY_NOW
																		? `#${assetDetail?.assetType}`
																		: assetDetail
																				?.auctionData
																				.auctionNum}
																</div>
															</div>
															<div className="row mt-2 mx-0">
																<div className="col-6 label-blod">
																	Quantity
																</div>
																<div className="col-6 val">
																	{assetDetail
																		?.auctionData
																		.assetCount
																		? assetDetail
																				?.auctionData
																				.assetCount
																		: 1}
																</div>
															</div>
															<div className="row mt-2 mx-0">
																<Visible
																	when={
																		assetDetail
																			?.auctionData
																			?.totalPageViews >=
																		assetDetail
																			?.auctionData
																			?.pageViewsThreshold
																	}
																>
																	<div className="col-6 view-count">
																		<SvgComponent path="visibility_black_24dp" />
																		<span>
																			{assetDetail
																				?.auctionData
																				?.totalPageViews
																				? assetDetail
																						?.auctionData
																						?.totalPageViews
																				: '0'}{' '}
																			Views
																		</span>
																	</div>
																</Visible>
																<div className="col-6 bids-count">
																	<SvgComponent path="gavel" />
																	<span>
																		{assetDetail
																			?.auctionData
																			?.totalBidsAuction
																			? assetDetail
																					?.auctionData
																					?.totalBidsAuction
																			: '0'}{' '}
																		Bids
																	</span>
																</div>
															</div>
														</div>
													</div>
												</Visible>
												<div className="prod-detail assetDetails__infoPanel-wrapper">
													<div className="prod-details assetDetails__infoPanel-row">
														<div className="prod-details assetDetails__infoPanel-prodDetails">
															<h1 className="assetDetails__infoPanel-title">
																{
																	assetDetail.title
																}
															</h1>
															<div className="assetDetails__infoPanel-conno">
																<span>
																	Consignment
																	No.{' '}
																</span>
																<span>
																	{
																		assetDetail.consignmentNo
																	}
																</span>
															</div>
															<div className="assetDetails__infoPanel-extras">
																<Visible
																	when={
																		assetDetail
																			?.auctionData
																			?.isEOI
																	}
																>
																	<DownloadAuctionDocuments
																		auctionId={
																			assetDetail
																				?.auctionData
																				?.auctionId
																		}
																		assetId={
																			fromAssetPage
																				? assetDetail.assetId
																				: null
																		}
																	/>
																</Visible>
																<Visible
																	when={
																		!assetDetail
																			?.auctionData
																			?.isEOI
																	}
																>
																	<DownloadAuctionDocuments
																		auctionId={
																			assetDetail
																				?.auctionData
																				?.auctionId
																		}
																		auctionNum={
																			assetDetail
																				?.auctionData
																				?.auctionNum
																		}
																	/>
																</Visible>
																<Visible
																	when={isInRoom(
																		assetDetail
																			?.auctionData
																			?.auctionType
																			?.name
																	)}
																>
																	<Button
																		className="btn-call-to-action m-0"
																		onClick={
																			this
																				.printBuyerCard
																		}
																	>
																		{/* <SvgComponent path="print" />  */}
																		Print
																		Buyer
																		Card
																	</Button>
																</Visible>
																<Button
																	className="btn-call-to-action m-0"
																	onClick={() =>
																		this.setState(
																			{
																				showSalesFeesModal: true,
																			}
																		)
																	}
																>
																	{/* <SvgComponent path="notepad_white" className="sml-icon" /> */}
																	Sales Notes
																	&amp; Fees
																</Button>
																<SalesNotesAndFeesModal
																	show={
																		this
																			.state
																			.showSalesFeesModal
																	}
																	onClose={() =>
																		this.setState(
																			{
																				showSalesFeesModal: false,
																			}
																		)
																	}
																	asset={
																		assetDetail
																	}
																/>{' '}
															</div>
														</div>
													</div>
													<div className="product-specs assetDetails__infoPanel-prodSpecs">
														<Table
															borderless
															size="sm"
														>
															<tbody>
																<tr>
																	<td>
																		{' '}
																		<SvgComponent path="transportation" />
																		{'  '}
																		Lot :{' '}
																		{_get(
																			assetDetail,
																			'lotNo',
																			''
																		)}
																	</td>
																	<td>
																		<OverlayTrigger
																			placement="top"
																			overlay={
																				<Tooltip>
																					{assetDetail?.assetSuburbState
																						? assetDetail?.assetSuburbState
																						: `${assetDetail.city?.name}, ${assetDetail.state?.name}`}
																				</Tooltip>
																			}
																		>
																			<span>
																				<SvgComponent path="location" />{' '}
																				{assetDetail?.assetSuburbState
																					? assetDetail?.assetSuburbState
																					: `${assetDetail.city?.name}, ${assetDetail.state?.name}`}
																			</span>
																		</OverlayTrigger>
																	</td>
																</tr>
																{assetDetail
																	.assetCategory
																	?.categoryGroup
																	?.groupName !==
																	'General Goods' && (
																	<tr>
																		<td>
																			<SvgComponent path="sync-alt" />
																			{
																				'  '
																			}
																			{_get(
																				assetDetail,
																				'transmission',
																				''
																			)}
																		</td>

																		<OverlayTrigger
																			placement="top"
																			overlay={
																				<Tooltip>
																					{
																						'  '
																					}
																					KM:{' '}
																					{Number(
																						_get(
																							assetDetail,
																							'odoMeter',
																							''
																						)
																					)?.toLocaleString()}
																					{
																						' Showing'
																					}
																				</Tooltip>
																			}
																		>
																			<td>
																				<SvgComponent path="direction-car" />
																				{Number(
																					_get(
																						assetDetail,
																						'odoMeter',
																						''
																					)
																				)?.toLocaleString()}{' '}
																				KM
																				{
																					' Showing'
																				}
																			</td>
																		</OverlayTrigger>
																	</tr>
																)}
																<tr>
																	{assetDetail?.assetType !==
																		ASSET_TYPE.BUY_NOW && (
																		<>
																			<Visible
																				when={
																					assetDetail.pageViews >=
																					assetDetail.pageViewsThreshold
																				}
																			>
																				<OverlayTrigger
																					placement="top"
																					overlay={
																						<Tooltip>
																							Total
																							number
																							of
																							views
																							for
																							asset
																							"
																							<strong>
																								{
																									assetDetail.title
																								}
																							</strong>

																							"
																						</Tooltip>
																					}
																				>
																					<td>
																						<SvgComponent path="visibility" />
																						{
																							'  '
																						}
																						{assetDetail.pageViews ===
																						null
																							? '0'
																							: assetDetail.pageViews}{' '}
																						{
																							'  '
																						}
																						Views
																					</td>
																				</OverlayTrigger>
																			</Visible>
																			<Visible
																				when={
																					assetDetail.totalBidsAsset >=
																						assetDetail.minimumBidsTreshold &&
																					assetDetail?.assetType !==
																						ASSET_TYPE.EOI
																				}
																			>
																				<OverlayTrigger
																					placement="top"
																					overlay={
																						<Tooltip>
																							Total
																							number
																							of
																							bids
																							for
																							asset
																							"
																							<strong>
																								{
																									assetDetail.title
																								}
																							</strong>

																							"
																						</Tooltip>
																					}
																				>
																					<td>
																						<SvgComponent path="gavel" />
																						{
																							'  '
																						}
																						{!assetDetail.totalBidsAsset
																							? '0'
																							: assetDetail.totalBidsAsset}{' '}
																						Bids
																					</td>
																				</OverlayTrigger>
																			</Visible>
																		</>
																	)}
																	<Visible
																		when={
																			(assetDetail.pageViews <
																				assetDetail.pageViewsThreshold ||
																				assetDetail.totalBidsAsset <
																					assetDetail.minimumBidsTreshold) &&
																			assetDetail.totalWatchers >=
																				assetDetail.minimumWatchersTreshold
																		}
																	>
																		<td>
																			<OverlayTrigger
																				placement="top"
																				overlay={
																					<Tooltip>
																						Total
																						number
																						of
																						watchers
																						for
																						asset
																						"
																						<strong>
																							{
																								assetDetail.title
																							}
																						</strong>

																						"
																					</Tooltip>
																				}
																			>
																				<td>
																					<SvgComponent path="star-filled" />{' '}
																					{
																						'  '
																					}
																					{
																						assetDetail.totalWatchers
																					}{' '}
																					{assetDetail.totalWatchers ===
																					1
																						? ' Watcher'
																						: ' Watchers'}
																				</td>
																			</OverlayTrigger>
																		</td>
																	</Visible>
																	<Visible
																		when={
																			assetDetail.pageViews >=
																				assetDetail.pageViewsThreshold &&
																			assetDetail.totalBidsAsset >=
																				assetDetail.minimumBidsTreshold &&
																			assetDetail.totalWatchers >=
																				assetDetail.minimumWatchersTreshold &&
																			assetDetail.assetType ===
																				ASSET_TYPE.EOI
																		}
																	>
																		<OverlayTrigger
																			placement="top"
																			overlay={
																				<Tooltip>
																					Total
																					number
																					of
																					watchers
																					for
																					asset
																					"
																					<strong>
																						{
																							assetDetail.title
																						}
																					</strong>

																					"
																				</Tooltip>
																			}
																		>
																			<td
																				colSpan={
																					2
																				}
																			>
																				<SvgComponent path="star-filled" />{' '}
																				{
																					'  '
																				}
																				{
																					assetDetail.totalWatchers
																				}{' '}
																				{assetDetail.totalWatchers ===
																				1
																					? ' Watcher'
																					: ' Watchers'}
																			</td>
																		</OverlayTrigger>
																	</Visible>
																</tr>
																<tr>
																	<Visible
																		when={
																			assetDetail.pageViews >=
																				assetDetail.pageViewsThreshold &&
																			assetDetail.totalBidsAsset >=
																				assetDetail.minimumBidsTreshold &&
																			assetDetail.totalWatchers >=
																				assetDetail.minimumWatchersTreshold &&
																			assetDetail.assetType !==
																				ASSET_TYPE.EOI
																		}
																	>
																		<OverlayTrigger
																			placement="top"
																			overlay={
																				<Tooltip>
																					Total
																					number
																					of
																					watchers
																					for
																					asset
																					"
																					<strong>
																						{
																							assetDetail.title
																						}
																					</strong>

																					"
																				</Tooltip>
																			}
																		>
																			<td
																				colSpan={
																					2
																				}
																			>
																				<SvgComponent path="star-filled" />{' '}
																				{
																					'  '
																				}
																				{
																					assetDetail.totalWatchers
																				}{' '}
																				{assetDetail.totalWatchers ===
																				1
																					? ' Watcher'
																					: ' Watchers'}
																			</td>
																		</OverlayTrigger>
																	</Visible>
																</tr>
															</tbody>
														</Table>
													</div>
													<Visible
														when={
															assetDetail.showReserveOnAssetDetail
														}
													>
														<div className="reserve-div assetDetails__infoPanel-reserve">
															<span className="spn-reserve">
																{assetDetail.reserveMet
																	? 'Reserve Met'
																	: 'Reserve Not Met'}
															</span>
															<ReserveMet
																percent={
																	assetDetail.reservePercentage
																}
															/>
														</div>
													</Visible>
													<Visible
														when={
															assetDetail.assetType !==
																ASSET_TYPE.BUY_NOW &&
															!assetDetail
																?.auctionData
																.isEOI
														}
													>
														{closeTime <= now ? (
															<div className="bidding-closed assetDetails__infoPanel-biddingClosed">
																<strong>
																	Bidding
																	Closed
																	<OverlayTrigger
																		placement="top"
																		overlay={
																			<Tooltip>
																				This
																				auction
																				was
																				closed
																				at{' '}
																				{dayjs(
																					assetDetail
																						.auctionData
																						?.datetimeClose
																				).format(
																					'hh:mm A'
																				)}{' '}
																				{getTimezoneName(
																					assetDetail
																						.auctionData
																						?.datetimeClose
																				)}{' '}
																				{dayjs(
																					assetDetail
																						.auctionData
																						?.datetimeClose
																				).format(
																					'DD MMM YYYY'
																				)}{' '}
																			</Tooltip>
																		}
																	>
																		<SvgComponent path="help_outline" />
																	</OverlayTrigger>
																</strong>
															</div>
														) : (
															<div className="view-bidamnt bidAmnt assetDetails__infoPanel-bidAmount">
																<div className="bidAmnt__info">
																	{assetStatusClosed ? (
																		<div className="bid-amnt">
																			<p>
																				{' '}
																			</p>
																			My
																			Bid:{' '}
																			<p>
																				{' '}
																				{toAmount(
																					assetDetail.myHighestBid
																				)}
																			</p>{' '}
																		</div>
																	) : (
																		<div className="bid-amnt">
																			<p>
																				{assetDetail.currentBidAmount ===
																				0
																					? 'Starting bid'
																					: 'Current Bid'}
																			</p>
																			<span>
																				{' '}
																				{assetDetail.currentBidAmount ===
																				0
																					? toAmount(
																							assetDetail.startingBid
																					  )
																					: (assetDetail
																							.auctionData
																							.auctionType
																							? AUCTION_TYPES_MAP[
																									assetDetail
																										.auctionData
																										.auctionType
																										.name
																							  ]
																							: '') ===
																					  AUCTION_TYPES.IN_ROOM
																					? toAmount(
																							absenteeCurrentBidAmount
																					  )
																					: toAmount(
																							assetDetail.currentBidAmount
																					  )}
																			</span>
																		</div>
																	)}

																	<div className="bidAmnt__options">
																		<Visible
																			when={
																				assetDetail.highestBidder &&
																				isConnected
																			}
																		>
																			<div className="view-bidamnt highest-bidder assetDetails__infoPanel-highestBidder">
																				<span className="highest-bidder-indicator">
																					<SvgComponent path="gavel" />{' '}
																				</span>{' '}
																				You
																				are
																				the
																				highest
																				bidder
																			</div>
																		</Visible>
																		<div className="finance-options">
																			<SvgComponent path="finance-options-folder"></SvgComponent>
																			<a
																				href={
																					window
																						.location
																						.origin +
																					'/finance'
																				}
																			>
																				Finance
																				Options
																			</a>
																		</div>
																	</div>
																</div>
																<div className="bidAmnt__buttons">
																	<button
																		className="btn btn-secondary btn-bid"
																		onClick={() => {
																			this.handleBidNowIsShown();
																		}}
																	>
																		Bid Now
																	</button>
																	<button
																		className="btn btn-primary btn-bid"
																		onClick={() => {
																			this.handleBidNowIsShown();
																		}}
																	>
																		Add to
																		Watch
																		List
																	</button>
																</div>
																{/* <Visible
																	when={
																		!isAssetClosed &&
																		!assetStatusClosed &&
																		assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
																		AUCTION_TYPES_MAP[assetDetail.auctionData.auctionType.name] !== AUCTION_TYPES.ONLINE &&
																		!assetDetail?.auctionData.isEOI
																	}
																>
																	<div className="placebid" onClick={this.handleGalary}>
																		<PlaceBidBottom
																			className="asset-page-placebid"
																			asset={assetDetail}
																			images={images}
																			onPlaceBidConfirm={this.onPlaceBidConfirm}
																			onCloseClick={this.onPlaceBidClose}
																			loggedInUser={loggedInUser}
																			isLoggedIn={isLoggedIn}
																			toggleLogin={toggleLogin}
																			showMessage={showMessage}
																			toggleEnquire={this.toggleEnquire}
																			closebutton={closebutton}
																			fromAssetPage={true}
																			confirmBid={this.props.confirmBid}
																			creditCardPercentage={creditCardPercentage}
																		/>
																	</div>
																</Visible> */}
																{/* <Visible
																	when={
																		!isAssetClosed &&
																		!assetStatusClosed &&
																		assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
																		AUCTION_TYPES_MAP[assetDetail.auctionData.auctionType.name] === AUCTION_TYPES.ONLINE &&
																		!assetDetail?.auctionData.isEOI &&
																		isStarted
																	}
																>
																	<div className="placebid" onClick={this.handleGalary}>
																		<PlaceBidBottom
																			className="asset-page-placebid"
																			asset={assetDetail}
																			images={images}
																			onPlaceBidConfirm={this.onPlaceBidConfirm}
																			onCloseClick={this.onPlaceBidClose}
																			loggedInUser={loggedInUser}
																			isLoggedIn={isLoggedIn}
																			toggleLogin={toggleLogin}
																			showMessage={showMessage}
																			toggleEnquire={this.toggleEnquire}
																			closebutton={closebutton}
																			fromAssetPage={true}
																			confirmBid={this.props.confirmBid}
																			creditCardPercentage={creditCardPercentage}
																		/>
																	</div>
																</Visible> */}
															</div>
														)}
													</Visible>

													<Visible
														when={
															_get(
																assetDetail,
																'assetType'
															) !== 'Buy Now' &&
															!assetDetail
																?.auctionData
																?.isEOI
														}
													>
														<div
															className={`div-time-view ${
																assetDetail.isExtended
																	? 'bonus-time'
																	: ''
															}`}
														>
															<Visible
																when={
																	!isConnected
																}
															>
																<h3 className="h3-time">
																	Connection
																	Lost...Reconnecting...
																</h3>
															</Visible>
															<Visible
																when={
																	!assetDetail.isExtended &&
																	isConnected
																}
															>
																<div className="time-view-left assetDetails__infoPanel-timeLeft">
																	<h3 className="h3-time">
																		<Visible
																			when={
																				isConnected
																			}
																		>
																			<CountdownTimer
																				heading={
																					'Time Remaining'
																				}
																				bonusTime={
																					assetDetail.isExtended
																				}
																				time={
																					!assetStatusClosed
																						? assetDetail.datetimeClose
																						: now
																				}
																				onComplete={
																					this
																						.onCompleteTimer
																				}
																			/>
																		</Visible>
																	</h3>

																	<Visible
																		when={isOnline(
																			assetDetail
																				?.auctionData
																				?.auctionType
																				?.name
																		)}
																	>
																		<Overlay
																			trigger="click"
																			placement="bottom"
																			show={
																				showBonusPopover
																			}
																			target={
																				targetBonus
																			}
																			rootClose
																			container={
																				this
																					.BonusRef
																					.current
																			}
																			containerPadding={
																				20
																			}
																			onHide={(
																				e
																			) =>
																				this.onBonusTime(
																					e
																				)
																			}
																		>
																			<Popover
																				id={`popover-positioned-bottom`}
																				className="contact-popup"
																			>
																				<Popover.Title as="h3">
																					Bonus
																					Time
																					<div
																						className="close-btn"
																						onClick={(
																							e
																						) =>
																							this.onShowBonusPopover(
																								e
																							)
																						}
																					>
																						<SvgComponent path="close" />
																					</div>
																				</Popover.Title>
																				<Popover.Content>
																					<p>
																						<strong>
																							What
																							is
																							Bonus
																							time
																							and
																							how
																							does
																							it
																							work?
																						</strong>
																					</p>
																					<p>
																						The
																						Auction
																						will
																						close
																						at
																						the
																						end
																						of
																						the
																						specified
																						time
																						if
																						there
																						are
																						no
																						successful
																						bids
																						during
																						the
																						5
																						minutes
																						preceding
																						the
																						end
																						of
																						the
																						time
																						specified.
																						If
																						there
																						are
																						any
																						successful
																						bids
																						within
																						the
																						last
																						5
																						minutes
																						of
																						the
																						auction
																						('bonus
																						time
																						period'),
																						the
																						auction
																						will
																						be
																						extended
																						until
																						there
																						are
																						no
																						more
																						bids
																						within
																						the
																						Bonus
																						Time
																						period.
																					</p>
																					<p>
																						<strong>
																							Why
																							is
																							Bonus
																							time
																							needed?
																						</strong>
																					</p>
																					<p>
																						Bonus
																						time
																						is
																						a
																						system
																						that
																						is
																						in
																						place
																						to
																						give
																						every
																						buyer
																						a
																						fair
																						chance
																						at
																						winning
																						an
																						item.
																						It
																						is
																						designed
																						to
																						mimic
																						a
																						live
																						auction
																						to
																						ensure
																						a
																						bidder
																						has
																						a
																						chance
																						to
																						offer
																						a
																						counter
																						bid.
																						All
																						items
																						are
																						sold.
																						Typical
																						internet-only
																						auctions
																						(think
																						eBay)
																						are
																						suspectible
																						to
																						a
																						practice
																						called
																						sniping.
																						Auction
																						sniping
																						is
																						the
																						practice
																						of
																						a
																						bidder
																						waiting
																						until
																						the
																						very
																						last
																						second
																						to
																						place
																						a
																						winning
																						bid
																						on
																						an
																						item
																						with
																						the
																						hope
																						that
																						other
																						bidders
																						do
																						not
																						have
																						time
																						to
																						raise
																						their
																						bid.
																						This
																						type
																						of
																						bidding
																						is
																						suspectible
																						to
																						sniping
																						bots
																						where
																						user
																						can
																						have
																						a
																						computer
																						program
																						place
																						a
																						bid
																						in
																						a
																						the
																						last
																						millisecond
																						so
																						there
																						is
																						no
																						fair
																						chance
																						for
																						the
																						bidder
																						to
																						offer
																						a
																						counter
																						bid.
																					</p>
																				</Popover.Content>
																			</Popover>
																		</Overlay>
																		<Button
																			className="btn-call-to-action primary--color"
																			onClick={(
																				e
																			) =>
																				this.onShowBonusPopover(
																					e
																				)
																			}
																		>
																			Bonus
																			Time{' '}
																			<SvgComponent path="help_outline" />
																		</Button>
																	</Visible>
																</div>
															</Visible>
															<Visible
																when={
																	assetDetail.isExtended &&
																	isConnected
																}
															>
																<h3 className="h3-time">
																	Bonus Time
																	<OverlayTrigger
																		trigger="click"
																		placement="bottom"
																		show={
																			showBonusTime
																		}
																		overlay={
																			<Popover
																				id={`popover-positioned-bottom`}
																				className="contact-popup"
																			>
																				<Popover.Title as="h3">
																					Bonus
																					Time
																					<div
																						className="close-btn"
																						onClick={
																							this
																								.onBonusTime
																						}
																					>
																						<SvgComponent path="close" />
																					</div>
																				</Popover.Title>
																				<Popover.Content>
																					<p>
																						<strong>
																							What
																							is
																							Bonus
																							time
																							and
																							how
																							does
																							it
																							work?
																						</strong>
																					</p>
																					<p>
																						The
																						Auction
																						will
																						close
																						at
																						the
																						end
																						of
																						the
																						specified
																						time
																						if
																						there
																						are
																						no
																						successful
																						bids
																						during
																						the
																						5
																						minutes
																						preceding
																						the
																						end
																						of
																						the
																						time
																						specified.
																						If
																						there
																						are
																						any
																						successful
																						bids
																						within
																						the
																						last
																						5
																						minutes
																						of
																						the
																						auction
																						('bonus
																						time
																						period'),
																						the
																						auction
																						will
																						be
																						extended
																						until
																						there
																						are
																						no
																						more
																						bids
																						within
																						the
																						Bonus
																						Time
																						period.
																					</p>
																					<p>
																						<strong>
																							Why
																							is
																							Bonus
																							time
																							needed?
																						</strong>
																					</p>
																					<p>
																						Bonus
																						time
																						is
																						a
																						system
																						that
																						is
																						in
																						place
																						to
																						give
																						every
																						buyer
																						a
																						fair
																						chance
																						at
																						winning
																						an
																						item.
																						It
																						is
																						designed
																						to
																						mimic
																						a
																						live
																						auction
																						to
																						ensure
																						a
																						bidder
																						has
																						a
																						chance
																						to
																						offer
																						a
																						counter
																						bid.
																						All
																						items
																						are
																						sold.
																						Typical
																						internet-only
																						auctions
																						(think
																						eBay)
																						are
																						suspectible
																						to
																						a
																						practice
																						called
																						sniping.
																						Auction
																						sniping
																						is
																						the
																						practice
																						of
																						a
																						bidder
																						waiting
																						until
																						the
																						very
																						last
																						second
																						to
																						place
																						a
																						winning
																						bid
																						on
																						an
																						item
																						with
																						the
																						hope
																						that
																						other
																						bidders
																						do
																						not
																						have
																						time
																						to
																						raise
																						their
																						bid.
																						This
																						type
																						of
																						bidding
																						is
																						suspectible
																						to
																						sniping
																						bots
																						where
																						user
																						can
																						have
																						a
																						computer
																						program
																						place
																						a
																						bid
																						in
																						a
																						the
																						last
																						millisecond
																						so
																						there
																						is
																						no
																						fair
																						chance
																						for
																						the
																						bidder
																						to
																						offer
																						a
																						counter
																						bid.
																					</p>
																				</Popover.Content>
																			</Popover>
																		}
																	>
																		<SvgComponent
																			path="help"
																			onClick={
																				this
																					.onBonusTime
																			}
																		/>
																	</OverlayTrigger>
																</h3>
															</Visible>
														</div>
													</Visible>
													<Visible
														when={
															!assetDetail.isExtended
														}
													>
														<div className="notify-div assetDetails__infoPanel-notify">
															<div className="notify__wrapper">
																{isNotifyAllowed && (
																	<NotifyMe
																		assetId={
																			assetDetail.assetId
																		}
																		auctionId={
																			assetDetail
																				.auctionData
																				.auctionId
																		}
																		notificationUpdate={
																			notificationUpdate
																		}
																		notifiedUser={
																			this
																				.state
																				.assetDetail
																				?.isNotified
																		}
																		dataTimeClose={
																			this
																				.state
																				.assetDetail
																				?.datetimeClose
																		}
																		displayText={
																			true
																		}
																	/>
																)}
															</div>
														</div>
													</Visible>
													<div className="enquire-view assetDetails__infoPanel-enquire">
														<div className="enquire-left">
															<h3 className="title">
																Have a question?
															</h3>
															<div className="desc">
																Contact your
																friendly
																Slattery
																Auctions team
																today.
															</div>
														</div>

														<div className="enquire-right">
															<Button
																className="btn btn-primary btn-bid"
																onClick={
																	this
																		.toggleEnquire
																}
															>
																Enquire
															</Button>
														</div>
													</div>
													<Visible
														when={
															_get(
																assetDetail,
																'assetType'
															) === 'Buy Now' &&
															width > 767
														}
													>
														<div className="div-buynow-view">
															<h3 className="title">
																Buy Now
															</h3>
															<div className="desc">
																{_get(
																	assetDetail,
																	'description'
																)}
															</div>
															<div className="buy-now">
																<div className="btn-under">
																	{toAmount(
																		assetDetail.listedPrice
																	)}
																</div>
																<Button
																	disabled={
																		assetDetail.status ===
																		ASSET_STATUS.UNDER_OFFER
																	}
																	variant="warning"
																	className="btn-buynow"
																	onClick={
																		buyNowHandler
																	}
																>
																	<SvgComponent path="shopping-cart" />
																	{assetDetail.status ===
																	ASSET_STATUS.UNDER_OFFER
																		? assetDetail.status
																		: ASSET_STATUS.BUY_NOW}
																</Button>
															</div>
														</div>
													</Visible>
													<Visible
														when={showBuyNowModal}
													>
														<BuyNowTermsModal
															showBuyNowModal={
																showBuyNowModal
															}
															assetId={
																assetDetail.assetId
															}
															termsAgreed={
																assetDetail.termsAgreed
															}
															buyNowClick={
																buyNowClick
															}
															acceptTerm={
																acceptTerm
															}
															handleBuyNowClose={
																handleBuyNowClose
															}
															buyersPremium={
																this.state
																	.buyersPremium
															}
															creditCardFee={
																assetDetail.creditCardFee
															}
															listedPrice={
																assetDetail.listedPrice
															}
															creditCardPercentage={
																creditCardPercentage
															}
															gstApplicable={
																assetDetail.gstApplicable
															}
														/>
													</Visible>
													<Visible when={showEnquire}>
														<Enquire
															asset={assetDetail}
															show={showEnquire}
															loggedInUser={
																loggedInUser
															}
															showMessage={
																showMessage
															}
															onClose={
																this
																	.toggleEnquire
															}
														/>
													</Visible>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="desc-container">
							<div className="desc-row">
								<div className="desc-col row assetDetails">
									<div className="product-details col-7">
										<AssetDetailsTabs
											asset={assetDetail}
											loggedInUser={loggedInUser}
											socket={socket}
											callBidHistory={callBidHistory}
											displayBidderTab={
												assetDetail?.displayJoinAuction
											}
										/>
									</div>
									<div className="col-5">
										<AuctionAssetDetails
											updateAuction={this.updateAuction}
											auctionData={
												assetDetail?.auctionData
											}
											assetTitle={assetDetail?.title}
											assetType={assetDetail?.assetType}
											status={assetDetail?.status}
											listedPrice={
												assetDetail?.listedPrice
											}
											isExtended={assetDetail?.isExtended}
											city={assetDetail?.city}
											state={assetDetail?.state}
											gstApplicable={
												assetDetail?.gstApplicable
											}
											isLoggedIn={isLoggedIn}
											history={this.props.history}
											toggleLogin={toggleLogin}
											description={
												assetDetail?.description
											}
											buyNowClick={buyNowHandler}
											socket={socket}
											assetContact={
												assetDetail?.assetContact
											}
											fromAssetPage={true}
											assetId={assetDetail.assetId}
										/>
									</div>
									{/* <div className="related-products">
									{assetDetail?.relatedAssetData?.length ? (
										<RelatedAssetItemCards
											relatedAssets={assetDetail.relatedAssetData}
											isLoggedIn={isLoggedIn}
											toggleLogin={toggleLogin}
											showMessage={showMessage}
											navigatoToRelatedAssets={this.navigatoToRelatedAssets}
											navigateToRelatedAsset={this.navigateToRelatedAsset}
											addToWatchlist={this.props.addToWatchlist}
										/>
									) : null}
								</div> */}
								</div>
							</div>
						</div>

						<div className="container">
							<div className="related-products">
								{assetDetail?.relatedAssetData?.length ? (
									<RelatedAssetItemCards
										relatedAssets={
											assetDetail.relatedAssetData
										}
										isLoggedIn={isLoggedIn}
										toggleLogin={toggleLogin}
										showMessage={showMessage}
										navigatoToRelatedAssets={
											this.navigatoToRelatedAssets
										}
										navigateToRelatedAsset={
											this.navigateToRelatedAsset
										}
										addToWatchlist={
											this.props.addToWatchlist
										}
									/>
								) : null}
							</div>
						</div>
						<Visible
							when={
								!isAssetClosed &&
								!assetStatusClosed &&
								assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
								AUCTION_TYPES_MAP[
									assetDetail.auctionData.auctionType.name
								] !== AUCTION_TYPES.ONLINE &&
								!assetDetail?.auctionData.isEOI
							}
						>
							<div
								className="placebid"
								onClick={this.handleGalary}
							>
								<PlaceBidBottom
									className="asset-page-placebid"
									asset={assetDetail}
									images={images}
									onPlaceBidConfirm={this.onPlaceBidConfirm}
									onCloseClick={this.onPlaceBidClose}
									loggedInUser={loggedInUser}
									isLoggedIn={isLoggedIn}
									toggleLogin={toggleLogin}
									showMessage={showMessage}
									toggleEnquire={this.toggleEnquire}
									closebutton={closebutton}
									fromAssetPage={true}
									confirmBid={this.props.confirmBid}
									creditCardPercentage={creditCardPercentage}
									isShown={this.props.isBidNowShown}
								/>
							</div>
						</Visible>
						<Visible
							when={
								!isAssetClosed &&
								!assetStatusClosed &&
								assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
								AUCTION_TYPES_MAP[
									assetDetail.auctionData.auctionType.name
								] === AUCTION_TYPES.ONLINE &&
								!assetDetail?.auctionData.isEOI &&
								isStarted
							}
						>
							<div
								className="placebid 11 "
								onClick={this.handleGalary}
							>
								<PlaceBidBottom
									className="asset-page-placebid"
									asset={assetDetail}
									images={images}
									onPlaceBidConfirm={this.onPlaceBidConfirm}
									onCloseClick={this.onPlaceBidClose}
									loggedInUser={loggedInUser}
									isLoggedIn={isLoggedIn}
									toggleLogin={toggleLogin}
									showMessage={showMessage}
									toggleEnquire={this.toggleEnquire}
									closebutton={closebutton}
									fromAssetPage={true}
									confirmBid={this.props.confirmBid}
									creditCardPercentage={creditCardPercentage}
									isShown={this.state.isBidNowShown}
								/>
							</div>
						</Visible>
					</div>
				) : null}

				<Visible when={!isLoading && _isEmpty(assetDetail)}>
					<NoResults />
				</Visible>
			</div>
		);
	}
}

export default withRouter(AssetDetail);
