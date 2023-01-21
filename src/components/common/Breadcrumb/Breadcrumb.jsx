import React from "react";
import _map from "lodash/map";
import BSBreadcrumb from "react-bootstrap/Breadcrumb";

import "./Breadcrumb.scss";

const Breadcrumb = ({ items }) => {
	return (
		<BSBreadcrumb className="breadcrumb-container container-xxl">
			{window.innerWidth > 768 &&
				_map(items, (item, index) => (
					<BSBreadcrumb.Item
						key={item.label}
						href={item.path}
						active={index === items.length - 1}
					>
						{item.label}
					</BSBreadcrumb.Item>
				))}
			{window.innerWidth <= 768 && items && items.length > 1 && (
				<BSBreadcrumb.Item
					key={items[items.length - 2].label}
					href={items[items.length - 2].path}
				>
					{items[items.length - 2].label}
				</BSBreadcrumb.Item>
			)}
		</BSBreadcrumb>
	);
};

export default Breadcrumb;
