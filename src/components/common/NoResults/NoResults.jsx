import React from 'react';
import Col from "react-bootstrap/Col";
import { Link } from 'react-router-dom';
import SvgComponent from '../SvgComponent';
import './NoResults.scss';

const NoResults = ({ message = 'No results found.', viewAll = 'Click here to view all', viewAllLink = null }) => (
        <div className="no-results-block">
            {/* <hr className="no-results-hr"></hr> */}
            {/* <SvgComponent path="error" /> */}
            <span className="results-text">{message}</span>
            {viewAllLink ? <Link to={viewAllLink}>{viewAll}</Link> : null}
            {/* <hr className="no-results-hr"></hr> */}
			{/* <Link to={"/auctions"}>Example</Link> */}
        </div>
)

export default NoResults;
