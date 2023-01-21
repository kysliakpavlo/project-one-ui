import React from 'react';
import Container from 'react-bootstrap/Container';
import Breadcrumb from '../../common/Breadcrumb';
import './MyAccount.scss';
import SvgComponent from '../SvgComponent';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RenderView from '../RenderView/RenderView';
import { ScrollableTabs } from '../Scrollable';

const pages = [{ label: 'Home', path: '/' }, { label: 'My Account' }];

const tabs = [
	{ icon: 'cast_white_24dp', label: 'Active Bids', key: 'active-bid' },
	{ icon: 'star_white_24dp', label: 'Watchlist', key: 'watchlist' },
	{
		icon: 'visibility_white_24dp',
		label: 'Recently Viewed',
		key: 'recently-viewed',
	},
	{ icon: 'emoji_events_white_24dp', label: 'Items Won', key: 'items-won' },
	{
		icon: 'emoji_events_white_24dp',
		label: 'Referred Assets',
		key: 'referred-assets',
	},
	// { icon: 'credit_card_white_24dp', label: 'Payments', key: 'payment-history', },
	{ icon: 'save_white_24dp', label: 'Saved Searches', key: 'saved-searches' },
	{ icon: 'account_circle', label: 'Profile', key: 'profile' },
	{ icon: 'preferences', label: 'Preferences', key: 'preferences' },
];

class MyAccount extends React.Component {
	state = {
		highlightAsset: null,
		activeView: 'grid',
		view: 'active-bid',
		otherTabs: ['saved-searches', 'profile', 'preferences'],
		activeTab: '',
	};

	componentDidMount() {
		let { tabView } = this.props.match.params;
		this.setState({ view: tabView });
	}
	componentDidUpdate(prevProps) {
		if (
			this.props.match.params.tabView !== prevProps.match.params.tabView
		) {
			const { tabView } = this.props.match.params;
			this.setState({ view: tabView });
		}
		if (!this.props.isLoggedIn) {
			this.props.history.push('/');
		}
	}
	toggleView = () => {
		const { activeView } = this.state;
		const nextView = activeView === 'grid' ? 'list' : 'grid';
		this.setState({ activeView: nextView });
	};

	// handleClick = (key) => {
	// 	// this.setState({ activeTab: key });
	// };

	render() {
		const { highlightAsset, activeView, view, otherTabs } = this.state;
		const { socket, setLoading, showMessage, isLivePanelOpen } = this.props;

		const changeView = (val) => {
			this.setState({ view: val });
			this.props.history.push(`/my-account/${val}`);
		};

		return (
			<div className="my-account">
				<Container>
					<Breadcrumb items={pages} />
				</Container>

				<Container>
					<Row>
						{!otherTabs.includes(view) && (
							<div
								id="grid-list"
								className={
									view === 'items-won'
										? 'grid-list-section alert-message'
										: 'grid-list-section'
								}
							>
								<div className="grid-list-button">
									<button
										onClick={this.toggleView}
										className={`btn ${
											activeView === 'list'
												? 'active'
												: ''
										}`}
									>
										<SvgComponent path="table_rows"></SvgComponent>{' '}
										List
									</button>
									<button
										onClick={this.toggleView}
										className={`btn ${
											activeView === 'grid'
												? 'active'
												: ''
										}`}
									>
										<SvgComponent path="grid_view"></SvgComponent>{' '}
										Grid
									</button>
								</div>
							</div>
						)}

						{/* <p>BELOW HERE</p> */}

						{/* {tabs.map((x, i) => {
						let activeWindow =
							window.location.origin + '/my-account/' + x.key;

						return (
							<a
								key={i}
								id={`nav${i}`}
								// onClick={this.handleClick(x.key)}
								onClick={() => this.handleClick(x.key)}
								href={
									window.location.origin +
									'/my-account/' +
									x.key
								}
							>
								{x.label}
							</a>
						);
					})} */}
						<Col lg="3">
							<ScrollableTabs
								autoScroll
								tabs={tabs}
								active={view}
								onChange={changeView}
							/>
						</Col>
						<Col lg="9">
							<div className="rendered-view">
								<RenderView
									renderView={view}
									socket={socket}
									highlightAsset={highlightAsset}
									activeView={activeView}
									setLoading={setLoading}
									showMessage={showMessage}
									isLivePanelOpen={isLivePanelOpen}
								/>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default MyAccount;
