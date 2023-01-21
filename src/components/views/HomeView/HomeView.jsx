import React, { lazy, useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import PredictiveSearchBar from '../../common/PredictiveSearchBar';
import { Scrollable } from '../../common/Scrollable';
import AuctionFilters from '../../common/AuctionFilters';
import BannerCarousel from '../../common/BannerCarousel';
import BrowseByCategory from '../../common/BrowseByCategory';
import ShowOnScroll from '../../common/SearchBox/ShowOnScroll';
import { setAppTitle, toUrlString, scrollToTop } from '../../../utils/helpers';
import './HomeView.scss';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import SvgComponent from '../../common/SvgComponent';

const NoResults = lazy(() => import('../../common/NoResults'));
const AuctionCard = lazy(() => import('../../common/AuctionCard'));
const FeatureAssetCard = lazy(() => import('../../common/FeatureAssetCard'));

const HomeView = ({
	vendor,
	categories,
	homepageCategories,
	isLoading,
	setLoading,
	locations,
	isLoggedIn,
	toggleLogin,
	showMessage,
	showLogin,
	sideBar,
	history,
	homeFilters,
	homeAuction,
	setHomeAuction,
	setHomeFiltersState,
	getBannerImages,
	getAuctions,
	getFeatured,
	getExpOfInterest,
	getContent,
}) => {
	const { action } = history;
	const isBack = action === 'POP';

	const isVisible = ShowOnScroll(70);
	const [featuredList, setFeaturedList] = useState([]);
	const [carouselItems, setcarouselItems] = useState([]);
	const [sortAuctions, setSortAuctions] = useState([]);
	const [exprOfIntItems, setExprOfIntItems] = useState([]);
	const [featuredAssets, setFeaturedAssets] = useState([]);
	const [filtersVisible, setFiltersVisible] = useState(true);
	const [filters, setFilters] = useState(isBack ? homeFilters?.filters : '');
	const [view, setView] = useState(null);
	const [auctionTitle, setAuctionTitle] = useState('All Auctions');

	const [home, setHome] = useState({});

	//All Locations <select>
	const selectRef = useRef('all');
	const selectValue = selectRef.current.value;

	useEffect(() => {
		if (vendor) {
			setAppTitle('Home Page', vendor.name);
			getBannerImages({ limit: 5 }).then(
				(res) => {
					const items = res.result;
					setcarouselItems(items);
				},
				() => {
					setcarouselItems([]);
				}
			);
		}
		changeView(homeFilters?.view || 'featuredAuctions');
	}, [vendor]);

	//Homeview object salesforce
	// useEffect(() => {
	// 	// console.log('run now');
	// 	const t0 = performance.now();
	// 	getContent({ contentType: "about" })
	// 		.then((response) => {
	// 			const t1 = performance.now();
	// 			console.warn(`Call to Homeview took ${t1 - t0} milliseconds.`);
	// 			console.log('Homeview => ', response);
	// 			setHome(response);
	// 			setLoading(false);
	// 		})
	// 		.catch((error) => {
	// 			const t1 = performance.now();
	// 			console.error(`Call to Homeview took ${t1 - t0} milliseconds.`);
	// 			console.log("Error getting content: Homeview");
	// 			setLoading(false);
	// 		});
	// }, []);

	useEffect(() => {
		let homeView = view === null ? homeFilters?.view : view;
		const filterStr = toUrlString({ homeView });
		setFilters(filterStr);
	}, [vendor, isLoggedIn]);

	useEffect(() => {
		return () => {
			setHomeFiltersState({ filters, view });
		};
	}, [filters, view]);

	// check the stat of auctionTitle every render, to update the <p>
	// useEffect(() => {

	// }, [auctionTitle]);

	// useEffect(() => {
	//     changeView(selectValue);
	//     console.log("actioning change of value: " + selectValue )
	// }, [selectValue]);

	const onFilterChange = (filter) => {
		const { categoryId, stateId } = filter;
		const title = categories
			.filter((cat) => filter.categoryId.includes(cat.categoryIdString))
			.map((cat) => cat.groupName)
			.join(', ');
		const filterStr = {
			view,
			title,
			categoryId: categoryId.join('@@'),
			stateId: stateId.join('@@'),
		};
		setFilters(toUrlString(filterStr));
		if (view === 'featured') {
			getFeaturedList({
				categoryId: categoryId.join(),
				stateId: stateId.join(),
			});
		}
		if (view === 'endingSoon' || view === 'openingSoon' || view === 'all') {
			getSortByAuctions({
				sortBy: view,
				limit: 10,
				offset: 0,
				categoryId: categoryId.join(),
				stateId: stateId.join(),
			});
		}
		if (view === 'featuredAuctions') {
			getSortByAuctions({
				featuredAuc: 1,
				limit: 10,
				offset: 0,
				categoryId: categoryId.join(),
				stateId: stateId.join(),
			});
		}
		if (view === 'eoi') {
			getExpressionOfInterest({
				limit: 10,
				offset: 0,
				categoryId: categoryId.join(),
				stateId: stateId.join(),
			});
		}
		if (view === 'featuredAssets') {
			getFeaturedAssets({
				limit: 10,
				isFeatured: 1,
				categoryId: categoryId.join(),
				stateId: stateId.join(),
			});
		}
	};

	const getSortByAuctions = (req) => {
		setLoading(true);
		getAuctions(req).then((res) => {
			setLoading(false);
			if (res.result) {
				setSortAuctions(res.result);
			} else {
				setSortAuctions([]);
			}
		});
	};

	const scrollToCard = () => {
		if (homeAuction) {
			setTimeout(() => {
				const auctionEle = document.querySelector(
					`#auction_card_${homeAuction}`
				);
				if (auctionEle) {
					scrollToTop(auctionEle.offsetTop - 60);
					setHomeAuction(null);
				}
			}, 100);
		}
	};

	const getFeaturedList = (req) => {
		setFeaturedList([]);
		setLoading(true);
		getFeatured({ ...req, type: 'asset,auction', limit: 10 }).then(
			(response) => {
				setFeaturedList(response.result);
				scrollToCard();
				setLoading(false);
			}
		);
	};

	const getFeaturedAssets = (req) => {
		setFeaturedAssets([]);
		setLoading(true);
		getFeatured({ ...req, type: 'asset', limit: 10 }).then((res) => {
			setFeaturedAssets(res.result);
			scrollToCard();
			setLoading(false);
		});
	};

	const getExpressionOfInterest = (req) => {
		setExprOfIntItems([]);
		setLoading(true);
		getExpOfInterest(req).then((res) => {
			setExprOfIntItems(res.result);
			scrollToCard();
			setLoading(false);
		});
	};

	const changeView = (val) => {
		val = selectRef.current.value;

		if (view === val) {
			return;
		}
		setView(val);
		setFiltersVisible(false);
		if (val === 'featuredAuctions') {
			getSortByAuctions({
				sortBy: val,
				limit: 10,
				offset: 0,
				featuredAuc: 1,
			});
		}
		if (val === 'all') {
			getSortByAuctions({
				sortBy: val,
				limit: 10,
				offset: 0,
				categoryId: '',
				stateId: '',
			});
			setAuctionTitle('All Auctions');
		}
		if (val === 'featured') {
			getFeaturedList({ limit: 10, offset: 0 });
			setAuctionTitle('Featured Auctions');
		}
		if (val === 'endingSoon' || val === 'openingSoon') {
			getSortByAuctions({ sortBy: val, limit: 10, offset: 0 });
			setAuctionTitle('');
		}
		if (val === 'eoi') {
			getExpressionOfInterest({ limit: 10, offset: 0 });
			setAuctionTitle('Expressions of Interest');
		}

		if (val === 'featuredAssets') {
			getFeaturedAssets({ limit: 10, offset: 0, isFeatured: 1 });
			setAuctionTitle('Featured Assets');
		}
		setTimeout(() => {
			setFiltersVisible(true);
		}, 100);
		setFilters(toUrlString({ view: val }));
	};

	return (
		<div
			className={
				showLogin || sideBar ? 'home-view backdrop' : 'home-view'
			}
		>
			{/* <Container className={!isVisible ? "mt-0 search-bar-visible" : "mt-0 search-bar-invisible"}>
                <PredictiveSearchBar />
            </Container> */}

			<BannerCarousel items={carouselItems} />

			{/* Lowered position for new design */}
			{/* <Container className={!isVisible ? "mt-0 search-bar-visible" : "mt-0 search-bar-invisible"}> */}
			<div className="mt-0 search-bar-visible search-home">
				<PredictiveSearchBar
					isOpen={true}
					hideClose={true}
				/>
			</div>

			<BrowseByCategory
				categories={categories}
				homepageCategories={homepageCategories}
			/>

			<Container className="cards-container">
				<div className="auction-filter-wrap">
					<div className="auction-left">
						{auctionTitle && <p>{auctionTitle}</p>}

						<Button
							type="button"
							variant="secondary"
							className="view-more-auction-button mb-2"
							as={Link}
							to={`/auctions?${filters}`}
						>
							View more
						</Button>
					</div>

					<div className="auction-filter-dropdowns">
						<div className="auction-filter">
							<div className="select">
								<select
									name="auctionsDropdown"
									className="auctions-dropdown"
									ref={selectRef}
									value={selectValue}
									onChange={() => {
										changeView(selectValue);
									}}
								>
									<option value="all">All Auctions</option>
									<option value="endingSoon">
										Ending Soon
									</option>
									<option value="featuredAssets">
										Featured Assets
									</option>
									<option value="openingSoon">
										Opening Soon
									</option>
									<option value="eoi">
										Expressions of Interest
									</option>
								</select>
								<SvgComponent
									className="select-icon"
									path="angle-down-solid"
								/>
							</div>
						</div>

						{filtersVisible && (
							<AuctionFilters
								categories={categories}
								locations={locations}
								onFilter={onFilterChange}
							/>
						)}
					</div>
				</div>

				<hr></hr>

				{featuredList && view === 'featured' && (
					<div className="row mt-4">
						{_map(featuredList, (featured) => {
							if (featured.isFeatureAuction) {
								return (
									<div
										className="col-md-4 col-sm-12"
										key={featured.auctionId}
										id={`auction_card_${featured.auctionId}`}
									>
										<AuctionCard
											auction={featured}
											isLoggedIn={isLoggedIn}
											toggleLogin={toggleLogin}
											showMessage={showMessage}
										/>
									</div>
								);
							}
							if (featured.isFeatureAsset) {
								return (
									<div
										className="col-md-4 col-sm-12"
										key={featured.assetId}
										id={`auction_card_${featured.assetId}`}
									>
										<FeatureAssetCard
											asset={featured}
											isLoggedIn={isLoggedIn}
											toggleLogin={toggleLogin}
											showMessage={showMessage}
										/>
									</div>
								);
							}
						})}
						{!isLoading && _isEmpty(featuredList) ? (
							<Col xl={12}>
								<NoResults
									viewAll={'Click here to view all auctions'}
									viewAllLink={'/auctions'}
								/>
							</Col>
						) : null}
						<div className="col-12">
							<Button
								type="button"
								variant="secondary"
								className="view-more-auction-button mb-2"
								as={Link}
								to={`/auctions?${filters}`}
							>
								View More
							</Button>
						</div>
					</div>
				)}
				{view === 'featuredAssets' && (
					<div className="row mt-4">
						{_map(featuredAssets, (asset) => {
							return (
								<div
									className="col-md-6 col-sm-12"
									key={asset.assetId}
									id={`auction_card_${asset.assetId}`}
								>
									<FeatureAssetCard
										asset={asset}
										isLoggedIn={isLoggedIn}
										toggleLogin={toggleLogin}
										showMessage={showMessage}
									/>
								</div>
							);
						})}
						{!isLoading && _isEmpty(featuredAssets) && (
							<Col xl={12}>
								<NoResults
									viewAll={'Click here to view all assets'}
									viewAllLink={'/search-results'}
								/>
							</Col>
						)}
						<div className="col-12">
							<Button
								type="button"
								variant="secondary"
								className="view-more-auction-button mb-2"
								as={Link}
								to={`/auctions?${filters}`}
							>
								View More
							</Button>
						</div>
					</div>
				)}
				{view === 'eoi' && (
					<div className="row mt-4">
						{exprOfIntItems.map((item) => (
							<div
								className="col-md-4 col-sm-12"
								key={item.auctionId}
								id={`auction_card_${item.auctionId}`}
							>
								<AuctionCard
									auction={item}
									isLoggedIn={isLoggedIn}
									toggleLogin={toggleLogin}
									showMessage={showMessage}
								/>
							</div>
						))}
						{!isLoading && _isEmpty(exprOfIntItems) && (
							<Col xl={12}>
								<NoResults
									viewAll={'Click here to view all EOI'}
									viewAllLink={'/expression-of-interest'}
								/>
							</Col>
						)}
						<div className="col-12">
							<Button
								type="button"
								variant="secondary"
								className="view-more-auction-button mb-2"
								as={Link}
								to={`/expression-of-interest?${filters}`}
							>
								View More
							</Button>
						</div>
					</div>
				)}
				{view === 'endingSoon' ||
				view === 'openingSoon' ||
				view === 'featuredAuctions' ||
				view === 'all' ? (
					<div className="row mt-4">
						{sortAuctions &&
							_map(sortAuctions, (auction) => {
								return (
									<div
										className="col-md-4 col-sm-12"
										key={auction.auctionId}
										id={`auction_card_${auction.auctionId}`}
									>
										<AuctionCard
											auction={auction}
											isLoggedIn={isLoggedIn}
											toggleLogin={toggleLogin}
											showMessage={showMessage}
										/>
									</div>
								);
							})}
						{!isLoading && _isEmpty(sortAuctions) && (
							<Col xl={12}>
								<NoResults
									viewAll={'Click here to view all auctions'}
									viewAllLink={'/auctions'}
								/>
							</Col>
						)}
						<div className="col-12">
							<Button
								type="button"
								variant="secondary"
								className="view-more-auction-button mb-2"
								as={Link}
								to={`/auctions?${filters}`}
							>
								View all
							</Button>
						</div>
					</div>
				) : (
					<> </>
				)}

				{/* Sell with us banner image */}
				<div className="container sell-with-us-banner position-relative">
					<div className="sell-with-content position-absolute">
						<h1>Sell with us</h1>
						<p>Tagline goes here</p>
						<Button
							type="button"
							as={Link}
							to={'/sell-with-us'}
						>
							Find out more
						</Button>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default HomeView;
