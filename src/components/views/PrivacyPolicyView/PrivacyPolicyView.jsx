import React, { useState, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { setAppTitle } from '../../../utils/helpers';
import './PrivacyPolicyView.scss';
import PredictiveSearchBar from '../../common/PredictiveSearchBar';
import StaticHeader from '../../common/StaticHeader';
import Container from "react-bootstrap/Container"



const PolicyView = ({ vendor, setLoading, getStaticPage, pageConfigurations }) => {
	const [policyDetail, setPolicyDetail] = useState([])

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle('Privacy Policy', vendor.name);
		}
	}, [vendor]);
	useEffect(() => {
		pageConfigurations?.privacyPolicy && getStaticPage(pageConfigurations?.privacyPolicy).then(response => {
			setPolicyDetail(response.result.page.content);
			setLoading(false)
		}).catch(err => {
			setLoading(false)
		});
	}, [pageConfigurations]);
	return <>
		{/* <PredictiveSearchBar /> */}
		<div className="privacy-policy container">

			<h1 style={{textAlign: "center"}}>Privacy Policy</h1>

			<div className="container div-writeup" dangerouslySetInnerHTML={{ __html: policyDetail }}></div>
			<div className="container div-writeup"><a href={window.location.origin + '/files/Slattery_Information_Security_Policy.pdf'} target="_blank">View our Information Security Policy</a></div>

		</div>
	</>
};

export default PolicyView;