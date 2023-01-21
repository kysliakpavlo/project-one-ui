import React, { useEffect } from 'react';
import _map from 'lodash/map';
import Button from 'react-bootstrap/Button';
import Visible from '../Visible';
import Scrollable from './Scrollable';
import SvgComponent from '../SvgComponent';

import './ScrollableTabs.scss';

const ScrollableTabs = ({ tabs, active, autoScroll, onChange }) => {
	useEffect(() => {
		function scrollToElement(selector) {
			const ele = document.querySelector(selector);
			if (ele?.scrollIntoViewIfNeeded) {
				ele?.scrollIntoViewIfNeeded({
					block: 'start',
					behavior: 'smooth',
				});
			}
		}
		if (autoScroll) {
			setTimeout(() => scrollToElement(`#${active}`), 100);
			setTimeout(() => scrollToElement(`#${active}`), 500);
			setTimeout(() => scrollToElement(`#${active}`), 1000);
		}
	}, [active, tabs, autoScroll]);

	return (
		<div className="scrollable-tabs">
			<Scrollable view={active}>
				{_map(tabs, ({ key, icon, label }) => (
					<Button
						key={key}
						id={key}
						variant="link"
						onClick={() => onChange(key)}
						className={`tab ${active === key ? 'active' : ''}`}
					>
						{label}
						<Visible when={active === key && icon}>
							<SvgComponent path="right_arrow" />
						</Visible>
					</Button>
				))}
			</Scrollable>
		</div>
	);
};

export default ScrollableTabs;
