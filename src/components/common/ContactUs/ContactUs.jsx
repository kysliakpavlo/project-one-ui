import React, { Component } from "react";
import _isEmpty from "lodash/isEmpty";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";
import EnquireForm from "../EnquireForm";
import Card from "react-bootstrap/Card";
import "./ContactUs.scss";
import { Map, GoogleApiWrapper, InfoWindow, Marker } from "google-maps-react";
import marker from "./Icons/google-marker.png";
import { GOOGLE_API_KEY } from "../../../utils/constants";
import { setAppTitle, offset, toUrlString, preventEvent } from "../../../utils/helpers";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import StaticHeader from "../../common/StaticHeader";
import Container from "react-bootstrap/Container";
import SvgComponent from "../SvgComponent";
import InfoWindowEx from "./InfoWindowEx";

import PageBanner from "../PageBanner";
import ContactLocations from "../ContactLocations/ContactLocations";
import Breadcrumb from "../../common/Breadcrumb";

const pages = [{ label: "Home", path: "/" }, { label: "Auction" }];

export class ContactUs extends Component {
	state = {
		contactDetail: null,
		showingInfoWindow: false, // Hides or shows the InfoWindow
		activeMarker: {}, // Shows the active marker upon click
		selectedPlace: {}, // Shows the InfoWindow to the selected place upon a marker
		selectedLon: null,
		selectedLat: null,
		cityName: "",
		locationLatLng: [],
		zoomMap: window.screen.width < 767 ? 3 : 4,
		reCenterLat: -33.833578,
		reCenterLng: window.screen.width < 767 ? 135.190872 : 140.190872,
		showConfirmation: false,
		contactContent: "",
	};

	componentDidMount() {
		if (!_isEmpty(this.props.vendor) && !this.props.isCareersPage) {
			setAppTitle("Contact Us", this.props.vendor.name);
		}
		this.props
			.getCities()
			.then((response) => {
				this.setState({ contactDetail: response.result });
				let locArr = [];
				response.result.map((item) => {
					const google = window.google;
					let geocoder = new google.maps.Geocoder();
					let latitude = null;
					let longitude = null;
					geocoder.geocode({ address: item.address }, (results, status) => {
						if (status == google.maps.GeocoderStatus.OK) {
							latitude = results[0].geometry.location.lat();
							longitude = results[0].geometry.location.lng();
							locArr.push({
								lat: latitude,
								lng: longitude,
								cityName: item.name ? item.name : "",
								address: item.address ? item.address : "",
							});
							this.setState({
								locationLatLng: locArr,
							});
						} else {
						}
					});
				});
				this.props.setLoading(false);
			})
			.catch((err) => {
				this.props.setLoading(false);
			});
		this.props.getContactContent().then((response) => {
			console.log("Contact Us2 : ", response);
			if (!response) {
				return;
			}
			this.setState({
				contactContent: response,
			});
		});
	}

	onMarkerClick = (location, marker, e) => {
		this.setState({
			selectedPlace: {
				name: location.name,
				city: location.title,
				id: location.stateId,
			},
			activeMarker: marker,
			showingInfoWindow: true,
		});
	};
	onMapClicked = (props) => {
		if (this.state.showingInfoWindow) {
			this.setState({
				showingInfoWindow: false,
				activeMarker: null,
			});
		}
	};

	onClose = (props) => {
		if (this.state.showingInfoWindow) {
			this.setState({
				showingInfoWindow: false,
				activeMarker: null,
			});
		}
	};

	navigateToAuction = (e) => {
		preventEvent(e);
		const { history } = this.props;
		const { selectedPlace } = this.state;
		history.push(`/auctions?${toUrlString({ stateId: selectedPlace.id })}`);
	};

	getLocationDetail = (item) => {
		const google = window.google;
		let geocoder = new google.maps.Geocoder();
		let address = item.address ? item.address : "";
		let latitude = null;
		let longitude = null;
		let locArr = [];
		let marker = {};
		geocoder.geocode({ address: address }, (results, status) => {
			if (status == google.maps.GeocoderStatus.OK) {
				latitude = results[0].geometry.location.lat();
				longitude = results[0].geometry.location.lng();
				locArr.push({ lat: latitude, lng: longitude, cityName: item.address });
				marker = new google.maps.Marker({
					position: { lat: latitude, lng: longitude },
					clickable: true,
				});
				this.setState({
					zoomMap: 12,
					reCenterLat: latitude,
					reCenterLng: longitude,
					showingInfoWindow: true,
					selectedPlace: {
						name: item.address ? item.address : "",
						city: item.name ? item.name : "",
						id: item.stateId,
					},
					activeMarker: marker,
				});
			}
		});
		var googleMapContainer = document.getElementById("google-maps-container");
		window.scroll({
			top: offset(googleMapContainer).top - 200,
			left: 0,
			behavior: "smooth",
		});
	};
	updateSuccesMessage = () => {
		this.setState({ showConfirmation: true });
	};

	render() {
		const { contactDetail, showConfirmation } = this.state;
		const pages = [{ label: "Home", path: "/" }, { label: "Contact Us" }];

		return (
			<div className="div-contact">
				<PageBanner
					title={"Contact Us"}
					subheading={this.state.contactContent.subHeading}
				/>

				<Container>
					<Breadcrumb items={pages} />
					{/* <StaticHeader header="Contact Us"></StaticHeader> */}
					<div className="section section--contact-header">
						<Row>
							<ContactLocations contactContent={this.state.contactContent} />
						</Row>

						<div className="location-contents">
							<div className="city-block">
								{contactDetail &&
									contactDetail.map((item, index) => (
										<Accordion
											key={index}
											defaultActiveKey={contactDetail}
										>
											<Card>
												<Accordion.Toggle
													as={Card.Header}
													eventKey={item}
												>
													{item.name}
													<SvgComponent path="expand-more" />
												</Accordion.Toggle>
												<Accordion.Collapse eventKey={item}>
													<Card.Body>
														{item.contactNo !== null && (
															<p>
																P: <a href={`tel:` + item.contactNo}>{item.contactNo}</a>
															</p>
														)}
														{item.abn !== null ? <p>ABN: {item.abn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} </p> : <></>}
														{item.contactEmail !== null ? <a href={`mailto:${item.contactEmail}`}>E-mail</a> : <> </>}
														{item.address !== null ? <p>{item.address} </p> : <> </>}
														{item.address && (
															<div
																className="div-viewmap"
																onClick={(e) => this.getLocationDetail(item)}
															>
																<span data-location="">View on map</span>
															</div>
														)}
													</Card.Body>
												</Accordion.Collapse>
											</Card>
										</Accordion>
									))}
							</div>
						</div>

						<div
							className="map-contents"
							id="google-maps-container"
						>
							<Map
								google={this.props.google}
								style={{ width: "100%", height: "100%", position: "relative" }}
								className={"map"}
								zoom={this.state.zoomMap}
								center={{
									lat: this.state.reCenterLat,
									lng: this.state.reCenterLng,
								}}
							>
								{this.state.locationLatLng.length > 0 &&
									this.state.locationLatLng.map((item) => {
										return (
											<Marker
												title={item.cityName}
												onClick={this.onMarkerClick}
												name={`${item.address}`}
												position={{ lat: item.lat, lng: item.lng }}
												className="marker-icon"
												key={item.lat}
											/>
										);
									})}

								<InfoWindowEx
									marker={this.state.activeMarker}
									visible={this.state.showingInfoWindow}
									position={{
										lat: this.state.reCenterLat,
										lng: this.state.reCenterLng,
									}}
								>
									<div className="info-window">
										<div className="img-block">
											<img src={marker} />
										</div>
										<div className="content-block">
											<h4 onClick={this.handleToggle}>{this.state.selectedPlace.city}</h4>
											<span>{this.state.selectedPlace.name}</span>
											<div className="text-center mt-2">
												<a
													href="#"
													onClick={this.navigateToAuction}
												>
													View Auctions
												</a>
											</div>
										</div>
									</div>
								</InfoWindowEx>
							</Map>
						</div>
					</div>

					<h2 className="form-title">Contact form</h2>

					{!showConfirmation ? (
						<div className="div-enquire-form enquireForm">
							<div className="enquireForm__wrapper">
								<EnquireForm
									showMessage={this.props.showMessage}
									updateSuccesMessage={this.updateSuccesMessage}
									enquireLocation="Contact Us Enquire"
								></EnquireForm>
							</div>
						</div>
					) : (
						<div className="divSuccessmsg">
							<h2 className="">Success</h2>
							<SvgComponent path="check_circle_black" />
							<p>
								Thank you for getting in contact. One of our friendly team will be in touch. If your question is urgent please contact your local office on the
								numbers above.
							</p>
						</div>
					)}
				</Container>
			</div>
		);
	}
}
export default GoogleApiWrapper({
	apiKey: GOOGLE_API_KEY,
})(ContactUs);
