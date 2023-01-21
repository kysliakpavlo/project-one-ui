import React, { lazy, useState, useEffect, Suspense } from 'react';
import _map from 'lodash/map';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, withRouter, useHistory } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import { setItem } from '../../../utils/storage';
import Visible from '../Visible';
import { stringify } from 'qs';

import NavLinks from '../../../data/nav-links.json';
import { SOCKET, IT_AND_COMPUTERS } from '../../../utils/constants';
import { screenWidth, toUrlString } from '../../../utils/helpers';
import ShowOnScroll from '../../common/SearchBox/ShowOnScroll';
import { CSSTransition } from 'react-transition-group';
import SvgComponent from '../SvgComponent';
import SearchBox from '../SearchBox';
import AppSpinner from '../AppSpinner';
import useWindowSize from '../../../hooks/useWindowSize';

import './Header.scss';

const SideHeaderBar = lazy(() => import('../../views/SideHeaderBarView'));
const LoginModal = lazy(() => import('../LoginModal'));

const Header = ({
	categories,
	showMessage,
	headerAssetTypes,
	showLogin,
	toggleLogin,
	doLogout,
	submitLogin,
	socket,
	loggedInUser,
	setLoading,
	isLoading,
	liveNotificationOpen,
	hidePublicHeader,
}) => {
	const history = useHistory();
	const [renderMenu, setRenderMenu] = useState(true);
	const isVisible = ShowOnScroll(57);
	const isLoggedIn = !!loggedInUser;
	const [showAdminAlert, setShowAdminAlert] = useState(false);
	const handleClose = () => setShowAdminAlert(false);
	const pathName =
		history.location.pathname.split('/').includes('bidder-history') ||
		history.location.pathname.split('/').includes('buyer-card') ||
		history.location.pathname.split('/').includes('watchers');
	const isPublicConsole = history.location.pathname.split('/').includes('simulcast-auction') ? true : false;
	const [width] = useWindowSize();

	useEffect(() => {
		if (socket && loggedInUser && loggedInUser.accountId && loggedInUser.role !== 'Admin' && !history.location.pathname.split('/').includes('admin-console')) {
			connectOutBidNotifications(loggedInUser);
		}
		return () => {
			if (socket && loggedInUser && loggedInUser.accountId) {
				disConnectOutBidNotifications(loggedInUser);
			}
		};
	}, [socket, loggedInUser]);

	const showAlert = () => {
		setShowAdminAlert(true);
	};
	const navigationClick = (title, subMenuName, category, event) => {
		if (title === 'IT' && subMenuName === 'Asset') {
			event.preventDefault();
			const obj = stringify({
				subCategory: IT_AND_COMPUTERS,
				title,
				buyingMethod: 'All',
			});
			history.push(`/redirect/search-results?${obj}`);
		} else if (subMenuName === 'Asset' && title === 'Browse by Asset Types') {
			const obj = stringify({ buyingMethod: 'All' });
			history.push(`/redirect/search-results?${obj}`);
		} else if (subMenuName === 'Asset') {
			const obj = stringify({ category: category, buyingMethod: 'All', title });
			history.push(`/redirect/search-results?${obj}`);
		} else if (subMenuName === 'Auctions') {
			event.preventDefault();
			const obj = toUrlString({ categoryId: category });
			history.push(category ? `/redirect/auctions?${obj}` : `/redirect/auctions`);
		} else if (title === 'Buy now') {
			event.preventDefault();
			const obj = stringify({
				assetType: 'Buy Now',
				title: 'Buy Now',
				buyingMethod: 'All',
			});
			history.push(`/redirect/search-results?${obj}`);
		} else if (title === 'Expression of Interest') {
			event.preventDefault();
			history.push(`/redirect/expression-of-interest`);
		} else if (title === 'Finance Options') {
			event.preventDefault();
			history.push(`/redirect/finance`);
		} else if (title === 'Transport') {
			event.preventDefault();
			history.push(`/redirect/transport`);
		}
		if (window.screen.width < 1024) {
			document.body.click();
		}
		handleMenu();
		liveNotificationOpen(false);
		document.body.style.overflow = '';
	};

	const handleMenu = () => {
		setRenderMenu(false);
		setTimeout(() => setRenderMenu(true), 1000);
	};
	const handleLogout = () => {
		doLogout();
		if (history.location.pathname.split('/').includes('simulcast-auction') || history.location.pathname.split('/').includes('admin-console')) {
			history.push(`/`);
		}
	};
	const showOutBidNotificaton = (param) => {
		const assetLink = `/asset?${stringify({
			auctionNum: param.asset.associatedAssets?.associatedAssetAuction?.auctionNum,
			consignmentNo: param.asset.consignmentNo,
		})}`;
		showMessage({
			type: 'error',
			duration: 7000,
			message: (
				<div>
					<div>You have been Outbid on {param.asset.title}</div>
					<div>
						<Link
							target="_blank"
							to={assetLink}
						>
							View Item
						</Link>
					</div>
				</div>
			),
			messageId: param.asset.assetId,
		});
	};

	const connectOutBidNotifications = (userObj) => {
		let encodeUserstr = `${userObj.accountId}`;
		socket.on(`${SOCKET.OUTBID_FUNCTIONALITY}${encodeUserstr}`, (outBidResponse) => {
			if (loggedInUser && loggedInUser.accountId && loggedInUser.role !== 'Admin' && !history.location.pathname.split('/').includes('admin-console')) {
				showOutBidNotificaton(outBidResponse);
			}
		});
	};

	const disConnectOutBidNotifications = (userObj) => {
		let encodeUserstr = `${userObj.accountId}`;
		socket.off(`${SOCKET.OUTBID_FUNCTIONALITY}${encodeUserstr}`);
	};

	const menuIndex = NavLinks.findIndex((NavLink) => NavLink.groupName === 'Buy');
	const browseMenuIndex = NavLinks[menuIndex].subMenu.findIndex((NavLink) => NavLink.groupIdentifier === 'Asset');

	// Main nav subMenu, asset categories
	// ASSET CATEGORIES
	NavLinks[menuIndex].subMenu[browseMenuIndex].subSubMenu = headerAssetTypes;

	const auctionMenuIndex = NavLinks[menuIndex].subMenu.findIndex((NavLink) => NavLink.groupIdentifier === 'Auctions');
	const found = categories.find((element) => element.groupName === 'All Categories');

	if (!found) {
		categories.push({
			categoryGroupId: 'all',
			categoryIdString: '',
			featuredImage: '',
			groupCategories: [],
			groupName: 'All Categories',
		});
	}

	// AUCTION CATEGORIES
	NavLinks[menuIndex].subMenu[auctionMenuIndex].subSubMenu = categories;
	const assetTypesCategories = _map(headerAssetTypes, 'headerAssetTypeId').join();

	const myAccountClick = () => {
		liveNotificationOpen(false);
		document.body.style.overflow = '';
	};

	function MenuItemWrapper(props) {
		if (props.itemName !== 'aboutUs') {
			return <div className="card"> {props.children}</div>;
		}
		return props.children;
	}

	return (
		<Suspense fallback={<AppSpinner variant="overlay" />}>
			<div className={`app-header ${isPublicConsole && width <= 1024 ? 'position-relative' : `${isPublicConsole && width > 1024 && hidePublicHeader ? 'd-none' : ''}`}`}>
				<div className="container-fluid">
					<Navbar
						collapseOnSelect
						expand={screenWidth()}
						className="navbar-custom navbar-dark"
					>
						{/* Logo */}
						<Navbar.Brand
							as="a"
							href={'/'}
							onClick={() => setItem('logoClick', true)}
							className="div-desk-img"
							alt="header-logo"
						>
							<img
								alt="header"
								//Change to be dynamic
								src={window.location.origin + '/ev-green-logo.svg'}
								width="196"
								height="36"
								className="d-inline-block align-top"
								id="header-logo"
							/>{' '}
						</Navbar.Brand>
						{/* Logo */}

						{/* Nav */}
						<Navbar.Toggle aria-controls="responsive-navbar-nav" />
						{!pathName ? (
							<Navbar.Collapse
								id="responsive-navbar-nav"
								className={isVisible ? 'show-header-search justify-content-between' : 'hide-header-search justify-content-between'}
							>
								{/* Main nav - START */}
								<Nav className="mr-auto">
									{NavLinks.map(({ url, groupName, subMenu }, index) => (
										<div
											className={subMenu && subMenu.length > 0 ? 'nav-dropdown' : 'menu-header'}
											key={`navLink_${index}`}
										>
											{subMenu && subMenu.length > 0 ? (
												<NavDropdown
													renderMenuOnMount={renderMenu}
													className={`main-menu ${!renderMenu ? 'dropdown-panel' : ''}`}
													title={groupName}
												>
													{subMenu.map(({ url, groupName, subSubMenu, groupIdentifier }, index) => (
														// <div
														// 	className="card"
														// 	key={`navLink_${index + groupName}`}
														// >
														<>
															<MenuItemWrapper itemName={subMenu[index].groupIdentifier}>
																<NavDropdown.Item
																	as={Link}
																	className={subMenu[index].groupIdentifier === 'aboutUs' ? 'subMenuTypes' : 'subMenuTypes1'}
																	onClick={(event) =>
																		navigationClick(
																			groupName,
																			groupIdentifier,
																			subMenu[index].groupName === 'Browse by Asset Types' ? assetTypesCategories : '',
																			event
																		)
																	}
																	to={
																		subMenu[index].groupName === 'Browse by Asset Types'
																			? `/search-results?${stringify({
																					buyingMethod: 'All',
																			  })}`
																			: url
																	}
																>
																	{groupName}
																</NavDropdown.Item>

																{subSubMenu &&
																	subSubMenu.map((item, idx) => (
																		<>
																			{subMenu[index].groupIdentifier === 'Asset' && (
																				<NavDropdown.Item
																					className="nav-item"
																					onClick={(event) => navigationClick(item.groupName, 'Asset', item.headerAssetTypeId, event)}
																					key={item.headerAssetTypeId}
																					to="/search-results"
																				>
																					{item.groupName}
																				</NavDropdown.Item>
																			)}
																			{subMenu[index].groupIdentifier === 'Auctions' && (
																				<NavDropdown.Item
																					className={item.groupName === 'All' ? 'nav-item auctions-list' : 'nav-item'}
																					onClick={(event) => navigationClick(item.groupName, 'Auctions', item.categoryIdString, event)}
																					key={item.categoryIdString}
																					to="/auctions"
																				>
																					{item.groupName} Auctions
																				</NavDropdown.Item>
																			)}
																			{subMenu[index].groupIdentifier === 'others' && (
																				<NavDropdown.Item
																					className="nav-item"
																					onClick={(event) => navigationClick(item.groupName, '', item.categoryIdString, event)}
																					key={item.categoryIdString}
																					to={item.url}
																				>
																					{item.groupName}
																				</NavDropdown.Item>
																			)}
																		</>
																	))}
															</MenuItemWrapper>
														</>
														// </div>
													))}
												</NavDropdown>
											) : (
												// <Nav.Item>

												// 	<Link
												// 		to="/sell-with-us"
												// 		className="val-link"
												// 	>
												// 		Sell with Us
												// 	</Link>

												// </Nav.Item>
												''
											)}
										</div>
									))}
								</Nav>
								{/* Main nav - END */}

								<div className="d-flex">
									{/* Sell with us button - START */}
									<Nav.Item
										className="header-buttons1 d-flex"
										onClick={(e) => myAccountClick(e)}
									>
										<Link
											to="/sell-with-us"
											type="button"
											className="btn btn-sm btn-outline-warning sell-button"
										>
											Sell with us
										</Link>
									</Nav.Item>
									{/* Sell with us button - END */}

									{/* Loggedin User Actions - START */}
									<Visible when={isLoggedIn && loggedInUser}>
										<Nav.Item className="header-buttons d-flex user-actions">
											{loggedInUser && loggedInUser.profilePicURL ? (
												<img
													className="img img-fluid profile-pic"
													src={loggedInUser.profilePicURL}
												/>
											) : (
												<SvgComponent path="account_circle" />
											)}
											<NavDropdown
												renderMenuOnMount={renderMenu}
												onClick={(e) => myAccountClick(e)}
												className="dropdown-panel"
												title={
													loggedInUser && loggedInUser?.role.includes('Vendor;Buyer')
														? `${loggedInUser.name}`
														: `${loggedInUser && loggedInUser.firstName} ${loggedInUser && loggedInUser.lastName ? loggedInUser.lastName : ''}`
												}
												id="basic-nav-dropdown-account"
											>
												<NavDropdown.Item
													as={Link}
													to="/my-account/active-bid"
													key="active-bid"
												>
													My Account
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/active-bid"
												>
													Active Bids
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/watchlist"
												>
													Watchlist
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/recently-viewed"
												>
													Recently Viewed
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/items-won"
												>
													Items Won
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/referred-assets"
												>
													Referred Assets
												</NavDropdown.Item>
												{/* <NavDropdown.Item as={Link} to="/my-account/payment-history">Payments</NavDropdown.Item> */}
												<NavDropdown.Item
													as={Link}
													to="/my-account/saved-searches"
												>
													Saved Searches
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/profile"
												>
													Profile
												</NavDropdown.Item>
												<NavDropdown.Item
													as={Link}
													to="/my-account/preferences"
												>
													Preferences
												</NavDropdown.Item>
												<NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
											</NavDropdown>
										</Nav.Item>
									</Visible>
									{/* Loggedin User Actions - End */}

									{/* Login Button - START */}
									<Nav.Item className="header-buttons3">
										<Visible when={!isLoggedIn}>
											<button
												tabIndex="0"
												type="button"
												onClick={toggleLogin}
												className="btn btn-sm btn-secondary reg-login"
											>
												Sign in / Join
											</button>
										</Visible>
									</Nav.Item>
									{/* Login Button - END */}
								</div>
							</Navbar.Collapse>
						) : null}
					</Navbar>
					{/* <Visible
						when={
							!history.location.pathname.split("/").includes("admin-console")
						}
					>
						<div
							className={` ${isVisible ? "short-search" : "hide-header-search"
								}`}
						>
							<Container>
								<SearchBox isLoggedIn={isLoggedIn} />
							</Container>
						</div>
					</Visible> */}
				</div>
				<SideHeaderBar
					NavLinks={NavLinks}
					loggedInUser={loggedInUser}
					handleloginClick={toggleLogin}
					doLogout={handleLogout}
					onClickcallback={navigationClick}
					isPublicConsole={isPublicConsole}
					width={width}
				></SideHeaderBar>
				<CSSTransition
					in={showLogin}
					transitionAppear={true}
					classNames="login-div"
					unmountOnExit
					timeout={300}
				>
					<div className="container-fluid relative transitionDiv">
						<LoginModal
							className="panel"
							showAlert={showAlert}
							handleloginClick={toggleLogin}
							show={showLogin}
							onClose={toggleLogin}
							submitLogin={submitLogin}
						/>
					</div>
				</CSSTransition>
				{loggedInUser ? (
					<Modal
						show={showAdminAlert}
						onHide={handleClose}
						className="admin-alert-modal"
					>
						<Modal.Header closeButton>
							<Modal.Title>Alert!</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>
								User {loggedInUser.firstName} {loggedInUser.lastName} is already logged in. Would you like to continue ?
								<div>Click continue if you would like to continue with same user id.</div>
								<div>Click close to logout from this user id</div>
							</p>
						</Modal.Body>
						<Modal.Footer>
							<Button
								variant="secondary"
								className="btn btn-outline-warning"
								onClick={handleLogout}
							>
								Close
							</Button>
							<Button
								variant="primary"
								onClick={handleClose}
							>
								Continue
							</Button>
						</Modal.Footer>
					</Modal>
				) : null}
			</div>
		</Suspense>
	);
};

export default withRouter(Header);
