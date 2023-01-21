import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import SvgComp from "../SvgComponent";
import _map from "lodash/map";
import { TextField, MultiSelectField } from "../FloatingField";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import * as Yup from "yup";
import { Form as FormikForm, Field, withFormik } from "formik";
import { setAppTitle } from "../../../utils/helpers";
import SearchBar from "../SearchBar";
import _isEmpty from "lodash/isEmpty";
import validator from "../../../utils/validator";
import Breadcrumb from "../Breadcrumb";
import StaticHeader from "../StaticHeader";
import SvgComponent from "../SvgComponent";
import { IT_AND_COMPUTERS, MESSAGES } from "../../../utils/constants";
import _cloneDeep from "lodash/cloneDeep";
import useWindowSize from "../../../hooks/useWindowSize";
import "./SellWithUs.scss";
import { set } from "lodash";

import FourTiles from "../FourTiles/FourTiles";
import TextImagePanel from "../TextImagePanel/TextImagePanel";
import PageBanner from "../PageBanner";

let successMessage;
let categoryList = [];
let categoryLists = [];
let showForm;
let CategoryId = [];
const SellWithUs = ({ categories = [], locations = [], vendor, setLoading }) => {
	const locationOptions = _map(locations, (item) => ({
		key: item.name,
		label: item.name,
	}));
	//Added for new layout
	const categoryOptions = _map(categories, (category) => ({
		key: category.categoryGroupId,
		label: category.groupName,
	}));
	const [showInputForm, setShowInputForm] = useState(true);
	const [showSuccess, setShowSuccess] = useState(false);
	const [itemId] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState([]);
	const [width] = useWindowSize();

	categories = categories.filter((ele) => ele.groupName !== "All Categories");
	successMessage = setShowSuccess;
	showForm = setShowInputForm;

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle("Sell with Us", vendor.name);
		}
		setLoading(false);
	}, [vendor]);

	const enableList = (event, groupName, index) => {
		let updated = [...selectedCategory];
		if (!updated.includes(groupName)) {
			updated.push(groupName);
			itemId.push(index);
		} else {
			updated = updated.filter((name) => name !== groupName);
			itemId.push(index);
		}
		setSelectedCategory(updated);
		categoryList = updated;
		CategoryId = itemId;
	};

	const removeSelection = (event, item) => {
		event.preventDefault();
		const clonedData = _cloneDeep(selectedCategory);
		const indexItem = clonedData && clonedData.indexOf(item);
		clonedData.splice(indexItem, 1);
		setSelectedCategory(clonedData);
		categoryList = selectedCategory;
	};

	const handleClick = () => {
		for (let i = 0; i < CategoryId.length; i++) {
			document.getElementById(`cat${CategoryId[i]}`).classList.remove("category-selected");
		}
	};

	const [modalShow, setModalShow] = useState(false);
	const [videoUrl, setVideoUrl] = useState("");

	function MyVerticallyCenteredModal(props) {
		return (
			<Modal
				show={props.show}
				onHide={props.onHide}
				className="videoModal"
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Body>
					<iframe
						id="ytplayer"
						type="text/html"
						width="1080"
						height="607.5"
						allow="autoplay"
						src={videoUrl}
						frameBorder="0"
						allowFullScreen
						title="sellWithUsModal"
					/>
				</Modal.Body>
			</Modal>
		);
	}

	function smoothScroll() {
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener("click", function (e) {
				e.preventDefault();
				const element = document.querySelector(this.getAttribute("href"));
				const yOffset = -100;
				const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
				window.scrollTo({ top: y, behavior: "smooth" });

				// document.querySelector(this.getAttribute('href')).scrollIntoView({
				//     behavior: 'smooth',
				//     offset: {top: -280}
				// });
			});
		});
	}
	smoothScroll();

	const pages = [{ label: "Home", path: "/" }, { label: "Sell With Us" }];

	return (
		<div>
			<MyVerticallyCenteredModal
				show={modalShow}
				onHide={() => setModalShow(false)}
			/>

			<section>
				{/* <div
					className="PageBanner"
					style={{
						backgroundImage:
							"linear-gradient(90deg, var(--cta-color-1-RGB) -9%, rgba(255, 255, 255, 0) 65%)," + "url(" + window.location.origin + "/assets/car_in_field.png)",
						// "linear-gradient(90deg, rgb(2, 0, 36) 0%, " + "var(--cta-color-1)" + "/ 0%) 100%)," +
						// "url(" + window.location.origin + "/assets/car_in_field.png" + ")",
						backgroundPosition: "center",
						backgroundSize: "cover",
						backgroundRepeat: "no-repeat",
					}}
				> */}
					{/* <div className="container-xxl">
						<div className="PageBanner__container">
							<div className="PageBanner__content">
								<div className="PageBanner__content-wrapper">
									<h2>Sell With Us</h2>
									<p>
										Want to sell or upgrade your fleet?
										<br /> Get them hammered at Slattery Auctions.
									</p>
									<a
										href="#formSection"
										className="btn btn-primary btn-submit btn btn-primary"
									>
										Submit a listing
									</a>
								</div>
							</div> */}
							{/* <div className="PageBanner__image">{/* <img src={window.location.origin + "/assets/hammered_main_banner.png"} /> */}
							{/*</div> */}
						{/* </div>
					</div>
				</div> */}

				<PageBanner 
					title={"Sell With Us"}
					subheading={'test'}
					/>
					
			</section>

			<section id="formSection">
				<div className="formSection">
					<div className="container">


					<div className="row">
							<div className="col-lg-12">
								<Breadcrumb items={pages} />
							</div>
					</div>

						<div className="row">
							<div className="col-lg-12">
								<div className="seller-form__content">
									<h2>What do you want to sell</h2>
									{/* <h6>Results that are a step ahead</h6> */}
									<p className="p-desc">
										When you need an asset valued and sold, the experts at Slattery Auctions and Valuations will tailor an individual remarketing plan informed
										by target audience profiling and specialist industry and asset expertise. Contact Slattery today for tomorrow’s solutions.
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="container">
						<div className="div-Sellwithus enquireForm">
							<div className="div-desc">
								<div className="div-form enquireForm__wrapper">
									{showInputForm && (
										<div className="div-show-cat">
											{selectedCategory.length > 0 &&
												selectedCategory.map((list) => (
													<div
														className="filtered-list"
														key={list}
													>
														{list}
														<span onClick={(event) => removeSelection(event, list)}>
															<SvgComponent
																className="close-icon-svg"
																path="close_black_24dp"
															/>
														</span>
													</div>
												))}
										</div>
									)}
									{showInputForm && (
										<div className="div-formik">
											<FormikForm
												noValidate
												autoComplete="off"
											>
												<Row className="form-categories">
													<Col>
														<Field
															className="mb-0"
															label="Select Category"
															// placeholder="Select Category"
															component={MultiSelectField}
															name="categoryList"
															options={categoryOptions}
															required
														/>
													</Col>
												</Row>

												<Row className="gx-1">
													<Col xs={width < 1024 ? 12 : 6}>
														<Field
															component={TextField}
															label="First Name"
															name="firstName"
															required
														/>
													</Col>
													<Col xs={width < 1024 ? 12 : 6}>
														<Field
															component={TextField}
															label="Last Name"
															name="lastName"
															required
														/>
													</Col>
												</Row>
												<Row className="gx-1">
													<Col xs={width < 1024 ? 12 : 6}>
														<Field
															component={TextField}
															label="Phone"
															name="phone"
															required
														/>
													</Col>
													<Col xs={width < 1024 ? 12 : 6}>
														<Field
															component={TextField}
															label="Email"
															name="email"
															required
														/>
													</Col>
												</Row>
												<Row>
													<Col>
														<Field
															className="mb-0"
															// label="All locations"
															label="All locations"
															component={MultiSelectField}
															name="location"
															options={locationOptions}
															required
														/>
													</Col>
												</Row>
												<Row className="form-textarea">
													<Col>
														<Field
															component={TextField}
															name="comments"
															label="What are you looking to sell?"
															fieldAs="textarea"
															rows={6}
															className="txtarea-field"
														/>
													</Col>
												</Row>
												<Row>
													{/* <Col className="submit-display"></Col> */}
													<Col className="d-flex justify-content-center">
														<Button
															className="btn btn-secondary btn-submit"
															type="submit"
															onClick={handleClick}
														>
															Submit
														</Button>
													</Col>
												</Row>
											</FormikForm>
										</div>
									)}
									{showSuccess && (
										<div className="divSuccessmsg">
											<h2 className="">Success</h2>
											<SvgComponent path="check_circle_blac" />
											<p>We have successfully placed your request. Our team member will get in touch with you for further details.</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* <TextImagePanel />
      

            <FourTiles /> */}
		</div>
	);
};
export default withFormik({
	mapPropsToValues: ({ firstName = "", lastName = "", phone = "", email = "", stateId = [], comments = "", categoryList = [] }) => {
		return {
			firstName,
			lastName,
			phone,
			email,
			location: stateId,
			comments,
			categoryList
		};
	},
	validationSchema: Yup.object().shape({
		firstName: Yup.string().required("First Name Required").max(40, "Max 40 chars"),
		lastName: Yup.string().required("Last Name Required"),
		phone: validator.phone,
		email: validator.email,
		comments: validator.requiredString("Comments is required"),
		location: Yup.array().min(1, "Please select atleast one state"),
		category: Yup.array().min(1, "Please select atleast one category")
	}),
	handleSubmit: (values, { props, ...formikProps }) => {
		let {categoryList} = values;
		if (categoryList.length === 0) {
			props.showMessage({
				message: MESSAGES.SELECT_CATERGORY,
				type: "error",
			});
		} else if (categoryList.includes("IT & Computers") && categoryList.includes("General Goods")) {
			let index = categoryList.indexOf("IT & Computers");
			categoryList.splice(index, 1);
			categoryLists = categoryList;
			props
				.sellForm({
					firstName: values.firstName,
					lastName: values.lastName,
					assetInterests: categoryLists,
					state: values.location.join(";"),
					phone: values.phone,
					email: values.email,
					comments: values.comments,
				})
				.then(
					(response) => {
						successMessage(true);
						showForm(false);
					},
					(err) => {
						props.showMessage({
							message: err.message,
							type: "error",
						});
					}
				);
		} else if (categoryList.includes("IT & Computers")) {
			let indexIt = categoryList.indexOf("IT & Computers");
			categoryList.splice(indexIt, 1, "General Goods");
			categoryLists = categoryList;
			props
				.sellForm({
					firstName: values.firstName,
					lastName: values.lastName,
					assetInterests: categoryList,
					state: values.location.join(";"),
					phone: values.phone,
					email: values.email,
					comments: values.comments,
				})
				.then(
					(response) => {
						successMessage(true);
						showForm(false);
						document.getElementById("cat5").classList.remove("category-selected");
					},
					(err) => {
						props.showMessage({
							message: err.message,
							type: "error",
						});
					}
				);
		} else {
			props
				.sellForm({
					firstName: values.firstName,
					lastName: values.lastName,
					assetInterests: categoryList,
					state: values.location.join(";"),
					phone: values.phone,
					email: values.email,
					comments: values.comments,
				})
				.then(
					(response) => {
						successMessage(true);
						showForm(false);
					},
					(err) => {
						props.showMessage({
							message: err.message,
							type: "error",
						});
					}
				);
		}
	},
})(SellWithUs);
