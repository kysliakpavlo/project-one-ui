import React from 'react';
import SVG from 'react-inlinesvg';

const SvgComponent = ({ path, ...others }) => {
	let name =
		path && path.includes('Traditional')
			? (path = 'Traditional only')
			: path;
	return (
		<SVG
			cacheRequests={true}
			src={'/assets/svg/' + name + '.svg'}
			{...others}
		/>
	);
};

export default SvgComponent;
