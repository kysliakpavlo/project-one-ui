import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import { MarketingSubscription } from '../../common/Preferences';

const MarketingPreferencesView = ({
	locations,
	categories,
	history,
	showMessage,
	isLoggedIn,
	setLoading,
}) => {
	// const [activeTab, setActiveTab] = useState('notify me');
	useEffect(() => {
		if (!isLoggedIn) {
			//  history.push('/');
		}
	}, [history, isLoggedIn]);

	return (
		<>
			<h2 className="account-option-title">Preferences</h2>
			<Container className="preferences-view my-3">
				<MarketingSubscription
					locations={locations}
					categories={categories}
					showMessage={showMessage}
					setLoading={setLoading}
				/>
			</Container>
		</>
	);
};

export default MarketingPreferencesView;
