import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _isArray from 'lodash/isArray';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Popover from 'react-bootstrap/Popover';
import Overlay from 'react-bootstrap/Overlay';
import { parse } from 'qs';
import SvgComponent from '../../common/SvgComponent';
import { Link } from 'react-router-dom';
import './SearchFiltersButton.scss';
import { MESSAGES } from '../../../utils/constants';

const SearchFiltersButton = ({
	loggedInUser,
	toggleLogin,
	showMessage,
	filteredObj,
	showSaveSearch,
	saveRemoveSearch,
	updateSavedSearchCrietria,
	savedSearch,
}) => {
	const ref = useRef(null);
	const location = useLocation();
	const [show, setShow] = useState(false);
	const [target, setTarget] = useState(null);
	const [disableSearch, setDisableSearch] = useState(false);
	const [searchName, setSearchName] = useState(savedSearch?.name);
	const handleClick = (event) => {
		if (!loggedInUser) {
			toggleLogin();
		} else {
			setShow(!show);
			show && setDisableSearch(false);
			if (!show) {
				setTarget(event.target);
			}
			setSearchName(searchName);
		}
	};

	const onChangeSearchName = (e) => {
		setSearchName(e.target.value);
	};

	const saveSearch = (e) => {
		setDisableSearch(true);
		const {
			searchQuery: keyword,
			category: categoryId,
			subCategory: subCategoryId,
			manufacturer,
			model,
			listLocation: stateId,
			assetType,
		} = parse(location.search.split('?')[1]) || {};

		if (!_isEmpty(searchName)) {
			const { id, label } = savedSearch;
			if (id && label === 'Update Search') {
				updateSavedSearchCrietria({
					savedSearchId: id,
					name: searchName,
					appliedFilters: filteredObj,
					// Search URL Params
					keyword,
					categoryId,
					subCategoryId,
					manufacturer,
					model,
					stateId,
					assetType,
				})
					.then((res) => {
						showMessage({
							messageId: 'saveSearch',
							message: (
								<div>
									<div>{res.message}</div>{' '}
									<div>
										view saved searches{' '}
										<Link
											className="clickable-text"
											to="/my-account/saved-searches"
										>
											here
										</Link>
									</div>
								</div>
							),
							type: 'success',
						});
						setShow(false);
					})
					.catch((err) => {
						showMessage({
							messageId: 'saveSearch',
							message: err.message,
							type: 'warning',
						});
					});
			} else {
				saveRemoveSearch({
					name: searchName,
					appliedFilters: filteredObj,
					keyword,
					categoryId,
					subCategoryId,
					manufacturer,
					model,
					stateId,
					assetType,
				})
					.then((res) => {
						showMessage({
							messageId: 'saveSearch',
							message: (
								<div>
									<div>{res.message}</div>{' '}
									<div>
										view saved searches{' '}
										<Link
											className="clickable-text"
											to="/my-account/saved-searches"
										>
											here
										</Link>
									</div>
								</div>
							),
							type: 'success',
						});
						setShow(false);
					})
					.catch((err) => {
						showMessage({
							messageId: 'saveSearch',
							message: err.message,
							type: 'warning',
						});
					});
			}
		} else {
			showMessage({
				messageId: 'saveSearch',
				message: MESSAGES.SAVED_SEARCHED_MESSAGE,
				type: 'warning',
			});
		}
	};

	const onKeydownSearchName = async (e) => {
		if (e.keyCode === 13 || e.which === 13) {
			saveSearch();
		}
	};

	return (
		<div className="search-filters">
			{showSaveSearch && (
				<Button
					className="custom-btn-bg"
					variant="primary"
					size="sm"
					onClick={handleClick}
					block
				>
					{savedSearch?.label}
				</Button>
			)}

			<Overlay
				show={show}
				target={target}
				rootClose
				placement="bottom"
				container={ref.current}
				containerPadding={20}
				onHide={() => setShow(false)}
			>
				<Popover
					as="form"
					className="search-name-popover"
				>
					<Popover.Title as="h3">
						{savedSearch?.label === 'Update Search'
							? 'Update'
							: 'Name'}{' '}
						your Search
						<div
							className="close-btn"
							onClick={handleClick}
						>
							<SvgComponent path="close" />
						</div>
					</Popover.Title>
					<Popover.Content>
						<Form.Group className="mb-2">
							<Form.Control
								placeholder="Enter a name to save your search"
								value={searchName}
								onChange={onChangeSearchName}
								onKeyDown={onKeydownSearchName}
							/>
						</Form.Group>
						<div className="d-flex justify-content-center">
							<Button
								variant="secondary"
								className="pull-right"
								onClick={(e) => saveSearch(e)}
								disabled={disableSearch}
							>
								Save
							</Button>
							<Button
								variant="outline-primary"
								onClick={handleClick}
							>
								Close
							</Button>
						</div>
					</Popover.Content>
				</Popover>
			</Overlay>
		</div>
	);
};

export default SearchFiltersButton;
