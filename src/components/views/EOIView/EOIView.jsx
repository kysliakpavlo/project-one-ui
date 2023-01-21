import React, { useEffect, useState } from 'react';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import Container from 'react-bootstrap/Container';
import Visible from '../../common/Visible';
import Pagination from '../../common/Pagination';
import PredictiveSearchBar from '../../common/PredictiveSearchBar';
import ShowOnScroll from '../../common/SearchBox/ShowOnScroll';
import AuctionFilters from '../../common/AuctionFilters';
import AuctionCard from '../../common/AuctionCard';
import Breadcrumb from '../../common/Breadcrumb';
import NoResults from '../../common/NoResults';

import {
	fromUrlString,
	scrollToTop,
	setAppTitle,
	toUrlString,
	setSortObj,
} from '../../../utils/helpers';

import './EOIView.scss';

const pageSizeOptions = [
	{ key: 10, label: '10' },
	{ key: 20, label: '20' },
	{ key: 30, label: '30' },
	{ key: 40, label: '40' },
	{ key: 50, label: '50' },
];

const EOIView = ({
	vendor,
	history,
	categories,
	locations,
	showMessage,
	location,
	isLoggedIn,
	toggleLogin,
	isLoading,
	setLoading,
	setDetailsAuction,
	detailsAuction,
	auctionFilters,
	setAuctionFilterState,
	getExpOfInterest,
}) => {
	const { action } = history;
	const isBack = action === 'POP';
	const { state } = location;
	const [auctions, setAuctions] = useState(null);
	const [hardReload, setHardReload] = useState(false);
	const [sortPaging, setSortPaging] = useState(
		(state
			? setSortObj(state)
			: isBack
			? auctionFilters?.sortPaging
			: null) || {
			pageSize: 10,
			activePage: 0,
		}
	);
	const params = location.search.substr(1);
	const { title, ...paramObj } = fromUrlString(params);
	const [filters, setFilters] = useState(
		isBack && auctionFilters?.filters
			? auctionFilters?.filters
			: {
					categoryId: paramObj.categoryId
						? paramObj.categoryId.split('@@')
						: [],
					stateId: paramObj.stateId
						? paramObj.stateId.split('@@')
						: [],
			  }
	);
	const { pageSize, activePage } = sortPaging;
	const isVisible = ShowOnScroll(70);

	useEffect(() => {
		if (vendor) {
			setAppTitle('Expression of Interest', vendor.name);
		}
	}, [vendor]);

	const scrollToCard = () => {
		if (detailsAuction) {
			setTimeout(() => {
				const auctionEle = document.querySelector(
					`#auction_card_${detailsAuction}`
				);
				if (auctionEle) {
					scrollToTop(auctionEle.offsetTop - 60);
					setDetailsAuction(null);
				}
			}, 100);
		}
	};

	useEffect(() => {
		const { categoryId, stateId } = fromUrlString(params);
		setHardReload(true);
		setTimeout(() => {
			setSortPaging(
				state ? setSortObj(state) : { pageSize: 12, activePage: 0 }
			);
			setFilters({
				categoryId: categoryId ? categoryId.split('@@') : [],
				stateId: stateId ? stateId.split('@@') : [],
			});
			setHardReload(false);
		}, 10);
	}, [params]);

	const { stateId = [], categoryId = [] } = filters;

	const stateIdStr = stateId ? stateId.join() : '';
	const categoryIdStr = categoryId ? categoryId.join() : '';

	useEffect(() => {
		const offset = activePage * pageSize;
		setLoading(true);
		getExpOfInterest({
			offset,
			limit: pageSize,
			stateId: stateIdStr,
			categoryId: categoryIdStr,
		}).then((res) => {
			setAuctions(res);
			setLoading(false);
			scrollToCard();
		});
	}, [pageSize, activePage, stateIdStr, categoryIdStr]);

	useEffect(() => {
		return () => {
			setAuctionFilterState({ sortPaging, filters });
		};
	}, [sortPaging, filters]);

	const onFilterChange = (filter) => {
		const { categoryId, stateId } = filter;

		const paramStrObj = {};
		if (stateId && stateId.length) {
			paramStrObj.stateId = stateId.join('@@');
		}
		if (categoryId && categoryId.length) {
			paramStrObj.categoryId = categoryId.join('@@');
		}
		history.replace(`/expression-of-interest?${toUrlString(paramStrObj)}`);
		// history.push({
		//   pathName: `/expression-of-interest`,
		//   search: toUrlString({ filter }),
		//   state: { sortPaging },
		// });
	};

	const onPaginationChange = (data) => {
		setSortPaging({ ...data });
		const { title, ...paramObj } = fromUrlString(params);
		history.push({
			pathName: `/expression-of-interest`,
			search: toUrlString({ ...paramObj }),
			state: { ...data },
		});
	};

	const pagingAndSorting = (
		<Visible when={auctions && auctions.result.length > 0}>
			<div className="mt-4 p-2 sort-block">
				<Pagination
					total={auctions && auctions.totalRecords}
					pageSizeOptions={pageSizeOptions}
					pageSize={pageSize}
					active={activePage}
					onChange={onPaginationChange}
				/>
			</div>
		</Visible>
	);
	const pages = [
		{ label: 'Home', path: '/' },
		{ label: 'Expression of Interest' },
	];
	return (
		<>
			<div
				className={
					!isVisible
						? 'mt-0 search-bar-visible'
						: 'mt-0 search-bar-invisible'
				}
			>
				<Container>
					<PredictiveSearchBar />
				</Container>
			</div>
			<div className="eoi-view">
				<header className="view-header">
					<Container>
						<Breadcrumb items={pages} />
					</Container>
				</header>
				{!hardReload && (
					<Container className="my-3">
						<AuctionFilters
							categories={categories}
							locations={locations}
							categoryId={categoryId}
							stateId={stateId}
							onFilter={onFilterChange}
						/>
						{pagingAndSorting}
					</Container>
				)}
				<Container>
					<Visible when={!_isEmpty(auctions?.result)}>
						<div className="row mt-4">
							{_map(auctions && auctions.result, (item) => {
								return (
									<div
										className="col-md-6 col-sm-12"
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
								);
							})}
						</div>
					</Visible>
					<Visible when={!isLoading && _isEmpty(auctions?.result)}>
						<NoResults />
					</Visible>
					{pagingAndSorting}
				</Container>
			</div>
		</>
	);
};

export default EOIView;
