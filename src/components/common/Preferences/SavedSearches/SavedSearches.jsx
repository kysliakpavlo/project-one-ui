import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import _cloneDeep from 'lodash/cloneDeep';
import { useHistory } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Pagination from '../../Pagination';
import SvgComponent from '../../SvgComponent';
import SavedSearchChips from './SavedSearchChips';
import { SOCKET } from '../../../../utils/constants';
import { toTimeStr } from '../../../../utils/helpers';
import NoResults from '../../NoResults';
import { stringify } from 'qs';
import {
	AUCTION_TYPES,
	AUCTION_TYPES_MAP,
	ONE_MINUTE,
} from '../../../../utils/constants';
import { useLocation } from 'react-router-dom';
import './SavedSearches.scss';

const SavedSearches = ({
	showMessage,
	setLoading,
	liveNotification,
	liveComponent,
	handleScrollConflicts,
	socket,
	loggedInUser,
	getSavedSearch,
	removeSavedSearch,
	updateSavedSearch,
	getAllNotifyMe,
	saveNotifyMe,
	deleteNotifyme,
	clearSavedSearchCount,
}) => {
	const [savedSearches, setSavedSearches] = useState({
		totalRecords: 0,
		result: [],
	});
	const [allNotify, setAllNotify] = useState();
	const [loadingMessage, setLoadingMessage] = useState('Loading...');
	const [sortPaging, setSortPaging] = useState({
		pageSize: 12,
		activePage: 0,
	});
	const { pageSize, activePage } = sortPaging;
	const [activeView, setActiveView] = useState(
		useLocation().search?.split('?')[1] === 'notify' && !liveComponent
			? 'Notify'
			: 'Saved Searches'
	);
	const history = useHistory();
	const toSearchPath = ({
		keyword,
		categoryId,
		subCategoryId,
		stateId,
		manufacturer,
		model,
		auctionTypeId,
		assetType,
		type,
		savedSearchId,
	}) =>
		stringify({
			assetType,
			category: categoryId,
			subCategory: subCategoryId,
			manufacturer,
			model,
			searchQuery: keyword,
			listLocation: stateId,
			auctionType: auctionTypeId,
			ignoreFilters: true,
			type: type,
			savedSearchId: savedSearchId,
		});

	const addSearchUrl = (res) => ({
		...res,
		result: res.result.map((item) => ({
			...item,
			email: item.notificationType?.includes('Email'),
			sms: item.notificationType?.includes('SMS'),
		})),
	});

	useEffect(() => {
		setLoading(true);
		getSavedSearchApi();
		if (!liveNotification) {
			getAllNotifyMe()
				.then((res) => {
					const assets = res.result.assets;
					const auctions = res.result.auctions;
					setAllNotify([...assets, ...auctions]);
				})
				.catch(() => {});
		}
	}, [pageSize, activePage]);

	useEffect(() => {
		if (socket && loggedInUser && loggedInUser.accountId) {
			openLiveNotificationChannel(loggedInUser);
		}
	}, [loggedInUser]);
	const openLiveNotificationChannel = () => {
		if (socket && socket.on) {
			socket.on(
				`${SOCKET.LIVE_NOTIFICATION}${loggedInUser.accountId}`,
				(res) => {
					getSavedSearchApi();
				}
			);
		}
	};

	const getSavedSearchApi = () => {
		const offset = activePage * pageSize;
		let pageName = liveNotification ? 'USER_PANEL' : 'MY_ACCOUNT';
		getSavedSearch({ limit: pageSize, offset, currentSection: pageName })
			.then((res) => {
				setSavedSearches(addSearchUrl(res));
				setLoading(false);
				if (res.result && res.result.length === 0) {
					setLoadingMessage('No saved cards');
				}
			})
			.catch((err) => {
				setSavedSearches({ totalRecords: 0, result: [] });
				setLoading(false);
			});
	};
	const onChange = (index, name) => (e) => {
		const item = _cloneDeep(savedSearches.result[index]);
		item[name] = e.target.checked;

		const subscription = [];
		if (item.email) subscription.push('Email');
		if (item.sms) subscription.push('SMS');
		const notificationType = subscription.join(';');
		if (item.email || item.sms) {
			updateSavedSearch({
				notificationType,
				savedSearchId: item.savedSearchId,
			})
				.then((res) => {
					const newItems = _cloneDeep(savedSearches);
					newItems.result[index] = item;
					setSavedSearches(newItems);
					showMessage({ message: res.message });
				})
				.catch((err) =>
					showMessage({ message: err.message, type: 'error' })
				);
		} else {
			const newItems = _cloneDeep(savedSearches);
			newItems.result[index] = item;
			setSavedSearches(newItems);
		}
	};

	const deleteSearch = (search) => {
		if (search.appliedFilters === null) {
			search.appliedFilters = {};
		}
		removeSavedSearch({ savedSearchId: [search.savedSearchId] })
			.then((res) => {
				showMessage({ message: res.message });
				const offset = activePage * pageSize;
				let pageName = liveNotification ? 'USER_PANEL' : 'MY_ACCOUNT';
				getSavedSearch({
					limit: pageSize,
					offset,
					currentSection: pageName,
				})
					.then((res) => {
						setSavedSearches(addSearchUrl(res));
					})
					.catch((err) => {
						setSavedSearches({ totalRecords: 0, result: [] });
					});
			})
			.catch((err) => {
				showMessage({ message: err.message, type: 'error' });
			});
	};

	const deleteNotify = (item) => {
		deleteNotifyme({ auctionId: item.auctionId, assetId: item.assetId })
			.then((res) => {
				showMessage({ message: res.message });
				getAllNotifyMe()
					.then((res) => {
						const assets = res.result.assets;
						const auctions = res.result.auctions;
						setAllNotify([...assets, ...auctions]);
					})
					.catch(() => {});
			})
			.catch((error) => {
				showMessage({ message: error.message });
			});
	};

	const sortPageViewSection = (
		<div className="sort-block">
			<Pagination
				total={savedSearches.totalRecords}
				pageSize={pageSize}
				active={activePage}
				onChange={setSortPaging}
			/>
		</div>
	);

	const toggleView = (view) => {
		setActiveView(view);
	};

	const changeFrequency = (e, freq, index) => {
		const tempAllNotify = [...allNotify];
		tempAllNotify[index].frequency.map((res) => {
			if (res.frequency === freq) {
				e.target.checked
					? (res.selected = true)
					: (res.selected = false);
			}
			return res;
		});
		const selectedAny = tempAllNotify[index].frequency?.some(
			(item) => item.selected
		);
		tempAllNotify[index].selectedTypes.length === 0 || !selectedAny
			? (tempAllNotify[index].disable = true)
			: (tempAllNotify[index].disable = false);
		setAllNotify(tempAllNotify);
	};

	const onTypeChange = (e, type, index) => {
		let tempAllNotify = [...allNotify];
		if (
			e.target.checked &&
			!tempAllNotify[index].selectedTypes.includes(type)
		) {
			tempAllNotify[index].selectedTypes.push(type);
		} else {
			tempAllNotify[index].selectedTypes = tempAllNotify[
				index
			].selectedTypes.filter((ele) => ele !== type);
		}
		const selectedAny = tempAllNotify[index].frequency?.some(
			(item) => item.selected
		);
		if (tempAllNotify[index].time !== 'Start') {
			tempAllNotify[index].selectedTypes.length === 0 || !selectedAny
				? (tempAllNotify[index].disable = true)
				: (tempAllNotify[index].disable = false);
		} else {
			tempAllNotify[index].frequency.push(0);
			tempAllNotify[index].selectedTypes.length === 0
				? (tempAllNotify[index].disable = true)
				: (tempAllNotify[index].disable = false);
		}

		setAllNotify(tempAllNotify);
	};

	const applyNotify = (item) => {
		const payload = {
			type: item.selectedTypes.join(';'),
			time: item.time,
			auctionId: item.auctionId,
			frequency:
				item.time !== 'Start'
					? item.frequency
							.filter((item) => item.selected)
							.map((item) => item.frequency)
					: [0],
		};

		if (item.assetId) {
			payload.assetId = item.assetId;
		}
		saveNotifyMe(payload)
			.then((res) => {
				getAllNotifyMe().then((res) => {
					const assets = res.result.assets;
					const auctions = res.result.auctions;
					setAllNotify([...assets, ...auctions]);
				});
				showMessage({ message: res.message });
			})
			.catch((err) => {
				showMessage({ message: err.message });
			});
	};

	const switchToggles = (
		<div className="switch-list-section">
			<div className="switch-toggle-btn">
				<button
					onClick={() => toggleView('Notify')}
					className={`btn ${
						activeView === 'Notify' ? 'active-view' : ''
					}`}
				>
					<SvgComponent path="bell-notifications" /> Notify
				</button>
				<button
					onClick={() => toggleView('Saved Searches')}
					className={`btn ${
						activeView === 'Saved Searches' ? 'active-view' : ''
					}`}
				>
					<SvgComponent path="save_white_24dp" /> Saved Searches
				</button>
			</div>
		</div>
	);
	const onItemClick = (item, type) => {
		if (type) {
			item['type'] = type;
		}
		history.push(`/search-results?${toSearchPath(item)}`, {
			filteredObj: item.appliedFilters,
			savedSearch: true,
			name: item.name,
		});
		if (liveComponent) {
			clearSavedSearchCount({ savedSearchId: item.savedSearchId })
				.then((res) => {
					handleScrollConflicts();
				})
				.catch((err) => {
					showMessage({ message: err.message, type: 'error' });
					handleScrollConflicts();
				});
		}
	};
	const disableCheckBox = (freq, dateTimeClose) => {
		const closeTime = dayjs(dateTimeClose);
		const now = dayjs();
		const diffTime = closeTime.diff(now);
		if (freq?.frequency > diffTime / ONE_MINUTE) {
			return (freq.disabled = true);
		}
	};

	return (
		<div className="saved-searches">
			<h2 className="account-option-title">Saved Searches</h2>
			{!liveNotification && switchToggles}
			{activeView === 'Saved Searches' && (
				<div>
					{!liveNotification && sortPageViewSection}
					<Card className="no-hover mb-3">
						<Card.Body className="px-0 pb-0 pt-3">
							<Row className="m-0 search-cards">
								{savedSearches.result.length === 0 ? (
									<NoResults message={loadingMessage} />
								) : (
									<>
										{savedSearches.result.map(
											(item, index) => (
												<Col
													key={item.savedSearchId}
													className="card-block-css"
												>
													<Card className="no-hover search-card">
														<Card.Header className="header-bg-color">
															<div
																className="header-bg-color"
																onClick={() =>
																	onItemClick(
																		item
																	)
																}
																target="_blank"
															>
																{item.name}
															</div>
															{liveNotification &&
																item.assetCount >
																	0 && (
																	<span
																		className="saved-search-badge"
																		onClick={() =>
																			onItemClick(
																				item
																			)
																		}
																	>
																		{' '}
																		{
																			item.assetCount
																		}{' '}
																		new{' '}
																		{
																			'assets was'
																		}{' '}
																		added{' '}
																	</span>
																)}
															{!liveNotification && (
																<div className="card-icons">
																	<OverlayTrigger
																		placement="top"
																		overlay={
																			<Tooltip>
																				Edit
																			</Tooltip>
																		}
																	>
																		<SvgComponent
																			path="edit_black_24dp"
																			onClick={() =>
																				onItemClick(
																					item,
																					'edit'
																				)
																			}
																		/>
																	</OverlayTrigger>
																	<OverlayTrigger
																		placement="top"
																		overlay={
																			<Tooltip>
																				Delete
																			</Tooltip>
																		}
																	>
																		<SvgComponent
																			path="delete_black_24dp"
																			onClick={() =>
																				deleteSearch(
																					item
																				)
																			}
																		/>
																	</OverlayTrigger>
																</div>
															)}
														</Card.Header>
														<Card.Body className="content-block">
															<div className="desc">
																<SavedSearchChips
																	search={
																		item
																	}
																/>
															</div>
															<p>
																Communication
																Method
															</p>
															<div className="toggle-btn-row">
																<div className="toggles-section">
																	<div className="switch-toggles">
																		<label>
																			Email
																		</label>{' '}
																		<Form.Check
																			readOnly
																			disabled={
																				liveNotification
																			}
																			type="switch"
																			id={`${item.name}_email`}
																			checked={
																				item.email
																			}
																			onClick={onChange(
																				index,
																				'email'
																			)}
																		/>
																	</div>
																	<div className="switch-toggles">
																		<label>
																			SMS
																		</label>{' '}
																		<Form.Check
																			readOnly
																			disabled={
																				liveNotification
																			}
																			type="switch"
																			id={`${item.name}_sms`}
																			checked={
																				item.sms
																			}
																			onClick={onChange(
																				index,
																				'sms'
																			)}
																		/>
																	</div>
																</div>
																<div className="view-btn-saved">
																	<Button
																		onClick={() =>
																			onItemClick(
																				item
																			)
																		}
																	>
																		<SvgComponent path="search"></SvgComponent>
																		Search
																		Again
																	</Button>
																</div>
															</div>
															{!item.sms &&
																!item.email && (
																	<span className="text-danger">
																		Please
																		select
																		atleast
																		one.
																	</span>
																)}
														</Card.Body>
													</Card>
												</Col>
											)
										)}
									</>
								)}
							</Row>
						</Card.Body>
					</Card>
					{!liveNotification && (
						<Pagination
							total={savedSearches.totalRecords}
							pageSize={pageSize}
							active={activePage}
							onChange={setSortPaging}
						/>
					)}
				</div>
			)}
			{activeView === 'Notify' && (
				<Card className="no-hover mb-3">
					<Card.Body className="px-0 pb-0 pt-3">
						<Row className="m-0 notify-cards-row">
							{allNotify?.length > 0 &&
								allNotify.map((item, index) => (
									<Col
										key={index}
										className="card-block-css notify-card"
									>
										<Card className="no-hover search-card">
											<Card.Header className="header-bg-color">
												<p>
													{item.asset?.name ||
														item.auction?.name}
												</p>
												<SvgComponent
													path="delete_black_24dp"
													onClick={() =>
														deleteNotify(item)
													}
												/>
											</Card.Header>
											<Card.Body className="notify-content">
												<div className="notify-content-block">
													<div className="notify-frequency freq-time">
														<div className="toggle-btn-row">
															<p>
																Notify Me{' '}
																{AUCTION_TYPES_MAP[
																	item
																		.auctionType
																] ===
																	AUCTION_TYPES.ONLINE &&
																item.time ===
																	'Start'
																	? 'When'
																	: 'Before'}{' '}
																This{' '}
																{item.asset
																	?.assetId
																	? 'Asset'
																	: 'Auction'}{' '}
																{item.time}s
															</p>
															<div className="toggles-section">
																{item.time !==
																	'Start' &&
																	item.frequency.map(
																		(
																			freq
																		) => (
																			<div
																				className="switch-toggles"
																				key={
																					index +
																					Math.random()
																				}
																			>
																				<label>{`${toTimeStr(
																					freq.frequency
																				)}`}</label>
																				<Form.Check
																					readOnly
																					type="switch"
																					value={
																						true
																					}
																					disabled={disableCheckBox(
																						freq,
																						item.datetimeClose
																					)}
																					checked={
																						freq.selected
																					}
																					id={`${Math.random()}_${
																						freq.frequency
																					}_${index}`}
																					onClick={(
																						e
																					) =>
																						changeFrequency(
																							e,
																							freq.frequency,
																							index
																						)
																					}
																				/>
																			</div>
																		)
																	)}
															</div>
														</div>
													</div>
													<div className="notify-frequency notify">
														<div className="toggle-btn-row notify-method-block">
															<p>
																Communication
																Method
															</p>
															<div className="toggles-section">
																<div className="switch-toggles">
																	<label>
																		Email
																	</label>{' '}
																	<Form.Check
																		readOnly
																		type="switch"
																		id={`${Math.random()}_email${index}`}
																		checked={item.selectedTypes.includes(
																			'Email'
																		)}
																		onClick={(
																			e
																		) =>
																			onTypeChange(
																				e,
																				'Email',
																				index
																			)
																		}
																	/>
																</div>
																<div className="switch-toggles">
																	<label>
																		SMS
																	</label>{' '}
																	<Form.Check
																		readOnly
																		type="switch"
																		id={`${Math.random()}_sms${index}`}
																		checked={item.selectedTypes.includes(
																			'SMS'
																		)}
																		onClick={(
																			e
																		) =>
																			onTypeChange(
																				e,
																				'SMS',
																				index
																			)
																		}
																	/>
																</div>
															</div>
														</div>
													</div>
												</div>
												<div className="apply-btn">
													<Button
														disabled={
															allNotify[index]
																.disable ===
															undefined
																? true
																: allNotify[
																		index
																  ].disable
														}
														onClick={(e) => {
															applyNotify(item);
														}}
													>
														Apply
													</Button>
												</div>
											</Card.Body>
										</Card>
									</Col>
								))}
						</Row>
					</Card.Body>
				</Card>
			)}
		</div>
	);
};
export default SavedSearches;
