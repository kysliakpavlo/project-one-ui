import React, { useState, useRef } from 'react';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _isArray from 'lodash/isArray';
import Accordion from 'react-bootstrap/Accordion';
import SearchFilterCard from './SearchFilterCard';
import './SearchFilters.scss';

const SearchFilters = ({
	filters,
	loggedInUser,
	toggleLogin,
	filteredObj,
	onChangeFilters,
}) => {
	const [activeSection, setActiveSection] = useState(null);

	const isSelected = (option, selected) => {
		return selected
			? selected.some((item) => item.val.includes(option.itemId[0]))
			: false;
	};

	const onChangeFilter = (item, filter) => {
		if (item.searchKey) {
			if (loggedInUser) {
				const value = filteredObj[item.searchKey];

				let slugValue = filteredObj[filter.slug] || [];
				if (!value) {
					slugValue.push({
						name: item.filterHeader,
						value: item.searchKey,
					});
				} else {
					slugValue = slugValue.filter(
						(val) => val.name !== item.filterHeader
					);
				}
				onChangeFilters({
					...filteredObj,
					[filter.slug]: slugValue,
					[item.searchKey]: !value,
				});
			} else {
				toggleLogin(true, () => onChangeFilter(item, filter));
			}
		} else {
			let updated = filteredObj[filter.searchKey] || [];
			if (isSelected(item, updated)) {
				updated = updated.filter((i) => {
					if (_isArray(i.val)) {
						return (
							i.val.sort().join() !== item.itemId.sort().join()
						);
					} else {
						return i.val !== item.itemId.join();
					}
				});
			} else {
				updated.push({
					name: item.name,
					val:
						filter.searchKey === 'categoryId'
							? item.itemId
							: item.itemId[0],
				});
			}
			onChangeFilters({ ...filteredObj, [filter.searchKey]: updated });
		}
	};
	const onSelect = (key) => {
		setActiveSection(key);
	};

	return (
		<div className="search-filters">
			<Accordion
				defaultActiveKey={filters[0]?.searchKey}
				className="filter-block"
				onSelect={onSelect}
			>
				{_map(filters, (filter) => (
					<SearchFilterCard
						filter={filter}
						key={filter.slug}
						onChange={onChangeFilter}
						selected={filteredObj[filter.searchKey || filter.slug]}
						isOpen={
							activeSection === filter.searchKey ||
							activeSection === filter.slug
						}
					/>
				))}
			</Accordion>
		</div>
	);
};

export default SearchFilters;
