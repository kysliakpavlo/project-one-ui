import React from "react";
import _get from "lodash/get";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Visible from "../Visible";
import PdfViewer from "../PdfViewer";
import SvgComponent from "../SvgComponent";
import { ScrollableTabs } from "../Scrollable";
import { BidHistoryTable } from "../BidHistory";
import { ASSET_TYPE, SOCKET } from "../../../utils/constants";
import { splitWord, toUrlString, preventEvent, validateEmail } from "../../../utils/helpers";
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";
import "./AssetDetailsTabs.scss";
import { Fragment } from "react";

let tabsList = [
	{ label: "Details", key: "details" },
	{ label: "Bidding History", key: "bidding-history" },
	{ label: "Sales Notes & Fees", key: "sales-notes" },
	// { label: "Freight Calculator", key: "freight-calculator" },
	{ label: "Condition Report", key: "condition-report" },
	{ label: "Document Viewer", key: "document-viewer" },
];

class AssetDetailsTabs extends React.Component {
	constructor(props) {
		super(props);

		this.selectorRef = React.createRef(null);
	}
	state = {
		view: "details",
		assetTransportFee: [],
		bidHistories: [],
		auctionDocuments: [],
		viewdocument: null,
		currentSlide: 1,
		assetContact: { name: "", email: "", contactNum: "" },
		showKeyContact: false,
		targetContact: null,
	};

	componentDidMount() {
		this.openAssetDetailChannel();
	}
	componentDidUpdate(prevProps) {
		if (this.props.asset.assetId !== prevProps.asset.assetId) {
			this.setState({ view: "details" });
		}
	}
	componentWillMount() {
		this.closeAssetDetailChannel();
	}

	openAssetDetailChannel() {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.on(SOCKET.ON_ASSET_CHANGE, (res) => {
				if (this.state.view === "bidding-history") {
					this.getBiddingHistory();
				}
			});
		}
	}

	closeAssetDetailChannel = () => {
		const { socket } = this.props;
		if (socket && socket.on) {
			socket.off(`${SOCKET.ON_ASSET_CHANGE}`);
		}
	};

	getBiddingHistory = () => {
		const auctionId = this.props.asset?.auctionData?.auctionId;
		const assetId = this.props.asset?.assetId;
		const offset = 1 - 1;
		const limit = 50;
		const req = {
			offset,
			limit,
			auctionId,
			assetId,
		};
		this.props.bidHistory(req).then((response) => {
			const bids = response.result.map((item) => {
				if (item.accountId === this.props.loggedInUser?.accountId) {
					item.accountData.accountAlias = "Your Bid";
				}
				return item;
			});
			this.setState({ bidHistories: bids });
		});
	};
	getFreightCalc = () => {
		const reqObj = {
			assetType: this.props.asset?.assetCategory?.recordTypeId,
			fromLocation: this.props.asset?.city?.cityId,
		};

		this.props.getTransportFee(reqObj).then((res) => {
			const result = res.result && res.result.filter((transport) => transport.toCity !== null || transport.distance);
			this.setState({ assetTransportFee: result });
		});
	};

	getAuctionDocuments = () => {
		const params = {};
		if (this.props.asset?.auctionData?.auctionId) params.auctionId = this.props.asset?.auctionData?.auctionId;
		if (this.props.asset?.assetId) params.assetId = this.props.asset?.assetId;
		this.props.getAuctionDocuments(params).then((documents) => {
			this.setState({ auctionDocuments: documents.result });
		});
	};

	changeView = (key) => {
		if (key === "freight-calculator") {
			this.getFreightCalc();
		} else if (key === "document-viewer") {
			this.getAuctionDocuments();
		}
		this.setState({ view: key });
	};

	downloadConditionReport = (e) => {
		preventEvent(e);
		const { asset } = this.props;
		window.open(asset.conditionReport);
	};

	onChangeDocument = (e) => {
		this.setState({ viewdocument: e.target.value });
	};
	onKeyContact = (e) => {
		const { targetContact } = this.state;
		this.setState({
			showKeyContact: !this.state.showKeyContact,
		});
		!targetContact && this.setState({ targetContact: e.target });
	};
	getContactName = (sting) => {
		let name = sting.split(",");
		let contactObj = {};
		name.map((val) => {
			if (val !== "null") {
				if (validateEmail(val)) {
					contactObj.email = val;
				} else if (/^[A-Za-z\s]*$/.test(val)) {
					contactObj.contactName = val;
				} else if (/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(val)) {
					contactObj.phoneNum = val;
				}
			}
		});
		return contactObj;
	};
	render() {
		const { view, assetTransportFee, bidHistories, auctionDocuments, viewdocument, showKeyContact, targetContact } = this.state;
		const { asset, loggedInUser, displayBidderTab } = this.props;

		const tabs = tabsList.filter((tab) => {
			switch (tab.key) {
				case "bidding-history":
					return asset?.assetType !== ASSET_TYPE.BUY_NOW && !asset?.auctionData?.isEOI && !displayBidderTab;
				case "sales-notes":
					return asset?.auctionData?.isEOI || asset?.assetType !== ASSET_TYPE.BUY_NOW;
				case "document-viewer":
					return asset?.totalDocuments > 0;
				case "condition-report":
					return asset?.conditionReport;
				case "details":
				case "freight-calculator":
				default:
					return true;
			}
		});

		return (
			<div className="asset-details-tabs">
				<ScrollableTabs
					tabs={tabs}
					active={view}
					onChange={this.changeView}
					autoScroll={view === "condition-report"}
				/>
				<div className="rendered-view">
					<Visible when={view === "details"}>
						{asset ? (
							<>
								{asset.details &&
									Object.keys(asset.details).map((key, index) => (
										<Accordion
											defaultActiveKey={index.toString()}
											key={index}
										>
											<Card
												className="details-card"
												key={index}
											>
												<Accordion.Toggle
													as={Card.Header}
													variant="link"
													eventKey={index.toString()}
												>
													<span className="details-title">{splitWord(key)}</span>
													<SvgComponent path="expand-more" />
												</Accordion.Toggle>
												<Accordion.Collapse eventKey={index.toString()}>
													<Card.Body className="description">
														<div className="div-item-details">
															<Table
																borderless
																size="sm"
															>
																<tbody>
																	{Object.keys(asset.details[key]).map((innerKey) =>
																		asset.details[key][innerKey] ? (
																			typeof asset.details[key][innerKey] !== "object" ? (
																				<Fragment key={innerKey}>
																					{innerKey === "assetContact" ? (
																						<tr key={innerKey}>
																							<th>{splitWord(innerKey)}</th>
																							<td className="details">
																								<Overlay
																									trigger="click"
																									placement="bottom"
																									show={showKeyContact}
																									target={targetContact}
																									rootClose
																									container={this.selectorRef.current}
																									containerPadding={20}
																									onHide={(e) => this.onKeyContact(e)}
																								>
																									<Popover className="contact-popup">
																										<Popover.Title as="h3">
																											Key Contacts
																											<div
																												className="close-btn"
																												onClick={(e) => this.onKeyContact(e)}
																											>
																												<SvgComponent path="close" />
																											</div>
																										</Popover.Title>
																										<Popover.Content>
																											{this.getContactName(asset.details[key][innerKey])?.contactName && (
																												<div className="row mt-2">
																													<div className="col-4 label">Name</div>
																													<div className="col-8 val">
																														{
																															this.getContactName(asset.details[key][innerKey])
																																?.contactName
																														}
																													</div>
																												</div>
																											)}
																											{this.getContactName(asset.details[key][innerKey])?.phoneNum && (
																												<div className="row mt-2">
																													<div className="col-4 label">Phone</div>
																													<div className="col-8 val">
																														<a
																															href={
																																"tel:" +
																																this.getContactName(asset.details[key][innerKey])
																																	?.phoneNum
																															}
																														>
																															{
																																this.getContactName(asset.details[key][innerKey])
																																	?.phoneNum
																															}
																														</a>
																													</div>
																												</div>
																											)}
																											{/* {contact?.mobile && (
                                                          <div className="row mt-2">
                                                            <div className="col-4 label">
                                                              Mobile
                                                            </div>
                                                            <div className="col-8 val">
                                                              <a
                                                                href={
                                                                  "tel:" +
                                                                  contact.mobile
                                                                }
                                                              >
                                                                {contact.mobile}
                                                              </a>
                                                            </div>
                                                          </div>
                                                        )} */}
																											{this.getContactName(asset.details[key][innerKey])?.email && (
																												<div className="row mt-2">
																													<div className="col-4 label">Email</div>
																													<div className="col-8 val">
																														<a
																															href={
																																"mailto:" +
																																this.getContactName(asset.details[key][innerKey])
																																	?.email
																															}
																														>
																															{
																																this.getContactName(asset.details[key][innerKey])
																																	?.email
																															}
																														</a>
																													</div>
																												</div>
																											)}
																										</Popover.Content>
																									</Popover>
																								</Overlay>
																								<span
																									className="key-contact"
																									onClick={(e) => this.onKeyContact(e)}
																								>
																									{this.getContactName(asset.details[key][innerKey]).contactName
																										? this.getContactName(asset.details[key][innerKey]).contactName
																										: this.getContactName(asset.details[key][innerKey]).phoneNum
																										? this.getContactName(asset.details[key][innerKey]).phoneNum
																										: this.getContactName(asset.details[key][innerKey]).email
																										? this.getContactName(asset.details[key][innerKey]).email
																										: ""}
																								</span>
																							</td>
																						</tr>
																					) : innerKey === "odometer" ? (
																						<tr key={innerKey}>
																							<th>{splitWord(innerKey)}</th>
																							<td
																								className="details"
																								dangerouslySetInnerHTML={{
																									__html: Number(asset.details[key][innerKey])?.toLocaleString() + " Showing",
																								}}
																							></td>
																						</tr>
																					) : (
																						<tr key={innerKey}>
																							<th>{splitWord(innerKey)}</th>
																							<td
																								className="details"
																								dangerouslySetInnerHTML={{
																									__html: asset.details[key][innerKey],
																								}}
																							></td>
																						</tr>
																					)}
																				</Fragment>
																			) : (
																				Object.keys(asset.details[key][innerKey]).map((innerInnerKey) => (
																					<tr key={innerInnerKey}>
																						<th>{splitWord(innerInnerKey)}</th>
																						<td
																							className="details"
																							dangerouslySetInnerHTML={{
																								__html: asset.details[key][innerKey][innerInnerKey],
																							}}
																						></td>
																					</tr>
																				))
																			)
																		) : null
																	)}
																	{splitWord(key) === "Asset Condition" && asset.conditionReport && (
																		<>
																			<tr key={`conditionReport_${asset.consignmentNo}`}>
																				<th>
																					<br></br>
																					<Link
																						onClick={() => {
																							this.setState({
																								view: "condition-report",
																							});
																						}}
																					>
																						View Condition Report
																					</Link>
																				</th>
																				<td></td>
																			</tr>
																		</>
																	)}
																</tbody>
															</Table>
														</div>
													</Card.Body>
												</Accordion.Collapse>
											</Card>
										</Accordion>
									))}
							</>
						) : null}
					</Visible>
					<Visible when={view === "bidding-history"}>
						<Accordion defaultActiveKey="0">
							<Card>
								<Card.Header>
									<Accordion.Toggle
										as={Button}
										variant="link"
										eventKey="0"
									>
										Bidding History
									</Accordion.Toggle>
								</Card.Header>
								<Accordion.Collapse eventKey="0">
									<Card.Body>
										<div className="div-bidding-hist">
											<BidHistoryTable
												bidHistories={bidHistories}
												loggedInUser={loggedInUser}
												assetId={asset?.assetId}
												auctionId={asset?.auctionData?.auctionId}
												status={asset?.status}
											/>
										</div>
									</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</Visible>
					<Visible when={view === "sales-notes"}>
						<div>
							<div className="description-detail">
								{asset.auctionData.longDesc !== null ? (
									<>
										<h5>Buyer's Premium</h5>
										<div
											className="description-bp"
											dangerouslySetInnerHTML={{
												__html: _get(asset.auctionData, "longDesc"),
											}}
										></div>
									</>
								) : (
									<h5>Description is not updated</h5>
								)}
							</div>

							<div className="inspection-detail">
								{asset.auctionData.inspection !== null ? (
									<>
										<h5>Inspection</h5>
										<div
											className="description-bp"
											dangerouslySetInnerHTML={{
												__html: _get(asset.auctionData, "inspection"),
											}}
										></div>{" "}
									</>
								) : (
									<>
										{" "}
										<h5>Inspection is not updated</h5>{" "}
									</>
								)}
							</div>
							<div className="delivery-detail">
								{asset.auctionData.delivery !== null ? (
									<>
										<h5>Delivery and Pick Up</h5>
										<div
											className="description-bp"
											dangerouslySetInnerHTML={{
												__html: _get(asset.auctionData, "delivery"),
											}}
										></div>
									</>
								) : (
									<>
										<h5>Delivery and pick up details are not updated</h5>{" "}
									</>
								)}
							</div>
							<div className="delivery-detail">
								{asset.auctionData.paymentType !== null ? (
									<>
										<h5>Payment Type</h5>
										<div
											className="description-bp"
											dangerouslySetInnerHTML={{
												__html: _get(asset.auctionData, "paymentType"),
											}}
										></div>
									</>
								) : (
									<>
										<h5>Payment Type details are not updated</h5>{" "}
									</>
								)}
							</div>
							<div className="contact-detail">
								<h5>Enquiries Please Email</h5>
								{asset.auctionData.contact && (
									<>
										{asset.auctionData.contact.name !== null ? (
											<div className="contact-name">Contact : {_get(asset.auctionData.contact, "name")} </div>
										) : (
											<> </>
										)}
										{asset.auctionData.contact.phone !== null ? (
											<div className="contact-phone">Phone : {_get(asset.auctionData.contact, "phone")} </div>
										) : (
											<> </>
										)}
										{asset.auctionData.contact.mobile !== null ? (
											<div className="contact-phone">Mobile : {_get(asset.auctionData.contact, "mobile")} </div>
										) : (
											<> </>
										)}
										{asset.auctionData.contact.email !== null ? (
											<div className="contact-mail">
												{" "}
												Email : <a href={`mailto:${_get(asset.auctionData.contact, "email")}`}>{_get(asset.auctionData.contact, "email")} </a>
											</div>
										) : (
											<> </>
										)}
									</>
								)}
							</div>
							<div className="sales-notes">
								<h5>Sales Notes</h5>
								<div
									className="dv-salesnote"
									dangerouslySetInnerHTML={{
										__html: asset.auctionData.saleNote,
									}}
								></div>
							</div>
						</div>
					</Visible>
					<Visible when={view === "freight-calculator"}>
						<Accordion defaultActiveKey="0">
							<Card>
								<Card.Header>
									<Accordion.Toggle
										as={Button}
										variant="link"
										eventKey="0"
									>
										Frieght and Transport costs
									</Accordion.Toggle>
								</Card.Header>
								<Accordion.Collapse eventKey="0">
									<Card.Body>
										<div className="div-frieght-calc">
											<Table
												bordered
												size="sm"
											>
												<tbody>
													<tr>
														<th>To Location</th>
														<th>Approx.Price</th>
													</tr>
													{assetTransportFee &&
														assetTransportFee.map((transport) => {
															return (
																<tr key={transport.transportFeeId}>
																	<td> {_get(transport.toCity, "name") || transport.distance}</td>
																	<td>{transport.approximatePrice}</td>
																</tr>
															);
														})}
												</tbody>
											</Table>
											<Button
												as={Link}
												to={`/transport?${toUrlString({
													assetType: asset?.assetCategory?.recordTypeId,
												})}`}
												className="btn btn-primary btn-loc"
											>
												More Locations
											</Button>
										</div>
									</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</Visible>
					<Visible when={view === "condition-report"}>
						<Accordion defaultActiveKey="0">
							<Card className="condition-report">
								<Card.Header>
									{asset && asset.conditionReport && (
										<Accordion.Toggle
											as={Button}
											variant="link"
											eventKey="0"
										>
											<span className="title">Condition Report</span>
											<Button
												variant="outline-primary"
												className="download-report"
												onClick={this.downloadConditionReport}
											>
												<SvgComponent path="file_download" /> Download Condition Report
											</Button>
										</Accordion.Toggle>
									)}

									{(!asset || !asset.conditionReport) && (
										<Accordion.Toggle
											as={Button}
											variant="link"
											eventKey="0"
										>
											No condition report present
										</Accordion.Toggle>
									)}
								</Card.Header>
								<Accordion.Collapse eventKey="0">
									<Card.Body>{asset && asset.conditionReport && <PdfViewer pdf={asset.conditionReport} />}</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</Visible>
					<Visible when={view === "document-viewer"}>
						<Accordion defaultActiveKey="0">
							<Card>
								<Card.Header className="document-viewer">
									{auctionDocuments && (
										<Accordion.Toggle
											as={Button}
											variant="link"
											eventKey="0"
										>
											Document Viewer
										</Accordion.Toggle>
									)}
									{!auctionDocuments && (
										<Accordion.Toggle
											as={Button}
											variant="link"
											eventKey="0"
										>
											No document to view
										</Accordion.Toggle>
									)}
									<Form.Group
										controlId="documents-to-view"
										className="floating-input documents-to-view"
									>
										<Form.Control
											as="select"
											name="documenttoView"
											onChange={this.onChangeDocument}
										>
											<option
												key="select"
												value="select-document"
											>
												Select Document{" "}
											</option>
											{auctionDocuments.map((document) => (
												<option
													key={document.name}
													value={document.imageUrl}
												>
													{document.name}
												</option>
											))}
										</Form.Control>
										<Form.Label>Document to view</Form.Label>
										<SvgComponent
											className="select-icon"
											path="angle-down-solid"
										/>
									</Form.Group>
								</Card.Header>
								<Accordion.Collapse eventKey="0">
									<Card.Body>{viewdocument && <PdfViewer pdf={viewdocument} />}</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</Visible>
				</div>
			</div>
		);
	}
}

export default AssetDetailsTabs;
