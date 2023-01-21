import React from "react";
import _map from "lodash/map";
import _isFunction from "lodash/isFunction";
import SvgComponent from "../SvgComponent";
import { withFormik, Field } from "formik";
import { MultiSelectField } from "../FloatingField";

import "./AuctionFilters.scss";

const Component = ({ locations, categories, values, onFilter }) => {
	categories = categories.filter((ele) => ele.groupName !== "All Categories");
	const locationOptions = _map(locations, (item) => ({
		key: item.stateId,
		label: item.name,
	}));
	const categoryOptions = _map(categories, (item) => ({
		key: item.categoryIdString,
		label: item.groupName,
	}));

	const onChange = (name, value) => {
		if (_isFunction(onFilter)) {
			onFilter({ ...values, [name]: value });
		}
	};

	return (
		<div className="auction-filter">
			<Field
				className="mb-0"
				// label="Filter By Location"
				placeholder="All Locations"
				component={MultiSelectField}
				name="stateId"
				onChange={onChange}
				options={locationOptions}
			/>
			<SvgComponent className="select-icon" path="angle-down-solid" />
		</div>
	);
};

const AuctionFilters = withFormik({
	mapPropsToValues: ({ categoryId = [], stateId = [] }) => {
		return {
			categoryId,
			stateId,
		};
	},
})(Component);

export default AuctionFilters;
