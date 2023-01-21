import React, { useCallback, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import RegistrationForm from '../../common/RegistrationForm';
import _isEmpty from 'lodash/isEmpty';
import { fromUrlString, setAppTitle } from '../../../utils/helpers';
import './RegistrationView.scss';
import Breadcrumb from '../../common/Breadcrumb';
import PredictiveSearchBar from '../../common/PredictiveSearchBar';

const pages = [{ label: 'Home', path: '/' }, { label: 'Registration' }];
const RegistrationView = ({ socket, showMessage, vendor, hideLogin }) => {
	const location = useLocation();
	const params =
		location.search !== '' && fromUrlString(location.search?.split('?')[1]);
	let obj = {};
	if (params?.data) {
		obj = params?.data;
		obj.provider = params?.provider;
	} else {
		obj = params?.provider;
	}
	const [mediaInfo, setMediaInfo] = useState(obj);
	const history = useHistory();
	const onRegister = useCallback(() => {
		history.push('/');
	}, []);

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle('Registration', vendor.name);
		}
	}, [vendor]);
	useEffect(() => {
		setMediaInfo(null);
	}, [location?.key]);

	return (
		<div className="registration-view">
			<div className="view-header">
				<h2>Test</h2>
				<Container>
					<div className="breadcrums px-0">
						<PredictiveSearchBar />
						<Breadcrumb items={pages} />
					</div>
				</Container>
			</div>
			<Container className="mt-2">
				{/* {!mediaInfo ? (
          <RegisterVia onChoose={onChoose} />
        ) : ( */}
				<RegistrationForm
					onRegister={onRegister}
					mediaInfo={mediaInfo}
					socket={socket}
				/>
				{/* )
        } */}
			</Container>
		</div>
	);
};

export default RegistrationView;
