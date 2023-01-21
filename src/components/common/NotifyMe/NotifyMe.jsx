import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import dayjs from "dayjs";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import BSForm from "react-bootstrap/Form";
import { Form as FormikForm, withFormik } from "formik";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import SvgComponent from "../SvgComponent";
import { preventEvent, toTimeStr } from "../../../utils/helpers";
import { AUCTION_TYPES, AUCTION_TYPES_MAP, ONE_MINUTE } from "../../../utils/constants";
import Visible from "../Visible";

import "./NotifyMe.scss";
import { Link } from "react-router-dom";

let hideNotifyMe = {};
const Component = ({
	view,
	className,
	assetId,
	auctionId,
	dataTimeClose,
	values,
	setValues,
	setFieldValue,
	handleSubmit,
	notificationUpdate,
	loggedInUser,
	toggleLogin,
	container,
	onNotifyMeToggle,
	getNotifyMe,
	notifiedUser = false,
	displayText,
	variant
}) => {
	const [showNotifyMe, setShowNotifyMe] = useState(false);

	const isLoggedIn = !!loggedInUser;

	useEffect(() => {
		if (className === false) {
			setShowNotifyMe(false);
		}
	}, [className, setShowNotifyMe]);

	const getNotification = async (e) => {
		preventEvent(e);
		if (container) {
			onNotifyMeToggle && onNotifyMeToggle(true);
		}

		getNotifyMe({ assetId, auctionId })
			.then((res) => {
				let notifications = [];
				if (res.result.notifications?.length === 1) {
					notifications = res.result.notifications.map((item) => ({
						...item,
						selected: true,
					}));
				} else {
					notifications = res.result.notifications;
				}
				setValues({
					email: res.result.type?.includes("Email") || false,
					sms: res.result.type?.includes("SMS") || false,
					time: res.result.time,
					auctionType: res.result.auctionType,
					notifications,
				});
				setShowNotifyMe(true);
				onNotifyMeToggle && onNotifyMeToggle(true);
			})
			.catch((err) => {
				hideNotifyMe[assetId]();
				notificationUpdate(err.message);
			});
	};

	if (!isLoggedIn) {
		const onClickNotifyMe = (e) => {
			preventEvent(e);
			toggleLogin(true, getNotification);
		};
		return (
			<Button
				type="button"
				className={`btn-notifyme ${className}`}
				onClick={onClickNotifyMe}
			>
				{/* "notify me SVG toggled for single asset page" */}
				{displayText ? "Notify Me" : <SvgComponent path="notifications_white" />}
			</Button>
		);
	}

	hideNotifyMe[assetId] = () => {
		onNotifyMeToggle && onNotifyMeToggle(false);
		setTimeout(() => {
			setShowNotifyMe(false);
		}, 100);
	};

	const { notifications, time, auctionType, email, sms } = values;
	const closeTime = dayjs(dataTimeClose);
	const now = dayjs();
	const diffTime = closeTime.diff(now);
	notifications.forEach((notify) => {
		if (notify.frequency > diffTime / ONE_MINUTE) {
			notify.disabled = true;
		}
	});
	const onChange = (e, index) => {
		preventEvent(e);
		const isChecked = _get(notifications, `[${index}].selected`);
		const isDisabled = _get(notifications, `[${index}].disabled`);
		if (!isDisabled) {
			setFieldValue(`notifications[${index}].selected`, !isChecked);
		}
	};

	const onTypeChange = (e, name) => {
		setFieldValue(name, !values[name]);
	};

	const selectedAny = notifications?.some((item) => item.selected);

	const beforeWhen = AUCTION_TYPES_MAP[auctionType] === AUCTION_TYPES.ONLINE && time === "Start" ? "When" : "Before";
	const popover = (
		<Popover
			id="popover-basic"
			onClick={preventEvent}
			className={`notify-me-popover ${view}`}
		>
			<Popover.Title className="header">
				<div
					className="close-btn"
					onClick={hideNotifyMe[assetId]}
				>
					<SvgComponent path="close" />
				</div>
				<Visible when={view !== "horizontal"}>
					<div className="header-text">
						Notify Me?
						<p className="disclaimer">Once this auction ends this notification will automatically unsubscribe from your communication method selected.</p>
					</div>
				</Visible>
			</Popover.Title>
			<Popover.Content>
				<FormikForm
					noValidate
					autoComplete="off"
					className="row mx-0"
				>
					<div className={`${view === "horizontal" ? "col-4 px-1 right-border" : "col-12 px-0"}`}>
						<div className="notify-header">
							Notify Me {beforeWhen} This {assetId ? "Asset" : "Auction"} {time}s
						</div>
						<div className="row mx-0">
							{notifications?.length > 1 &&
								notifications.map((item, index) => (
									<div
										key={`notification_${index}`}
										className="col-6 px-0"
									>
										<BSForm.Group
											controlId={item.frequency}
											className="mb-0"
											onClick={(e) => onChange(e, index)}
										>
											<BSForm.Label className="mb-0">{`${toTimeStr(item.frequency)}`}</BSForm.Label>
											<BSForm.Check
												readOnly
												value={true}
												type="switch"
												disabled={item.disabled}
												style={{ pointerEvents: "none" }}
												checked={notifications[index].selected || false}
											/>
										</BSForm.Group>
									</div>
								))}
							<Visible when={!selectedAny}>
								<div className="text-danger">Please select atleast one.</div>
							</Visible>
							<Visible when={notifiedUser}>
								<div className="">
									To remove nofications please go to <Link to={`/my-account/saved-searches?notify`}>My Account</Link>
								</div>
							</Visible>
						</div>
					</div>
					<div className={`${view === "horizontal" ? "col-4 right-border" : "row mx-0"}`}>
						<div className="notify-header com-method">Communication Method</div>
						<Row className="col-12 mx-0 row px-0 notify-type">
							<Col
								xs={6}
								className="px-0"
							>
								<BSForm.Group
									controlId="email"
									className="mb-0"
									onClick={(e) => onTypeChange(e, "email")}
								>
									<BSForm.Label className="mb-0">Email</BSForm.Label>
									<BSForm.Check
										readOnly
										value={true}
										type="switch"
										checked={email || false}
										style={{ pointerEvents: "none" }}
									/>
								</BSForm.Group>
							</Col>
							<Col
								xs={6}
								className="px-0"
							>
								<BSForm.Group
									controlId="sms"
									className="mb-0"
									onClick={(e) => onTypeChange(e, "sms")}
								>
									<BSForm.Label className="mb-0">SMS</BSForm.Label>
									<BSForm.Check
										readOnly
										value={true}
										type="switch"
										checked={sms || false}
										style={{ pointerEvents: "none" }}
									/>
								</BSForm.Group>
							</Col>
							<Visible when={!sms && !email}>
								<Col
									xs={12}
									className="px-0 text-danger"
								>
									Please select atleast one.
								</Col>
							</Visible>
						</Row>
						<Button
							className="apply-button"
							variant="primary"
							disabled={(!sms && !email) || !selectedAny}
							onClick={handleSubmit}
						>
							Apply
						</Button>
					</div>
					<Visible when={view === "horizontal"}>
						<div className={`${view === "horizontal" ? "col-4" : ""}`}>
							<div className="header-text">
								Notify Me?
								<p className="disclaimer">Once this auction ends this notification will automatically unsubscribe from your communication method selected.</p>
							</div>
						</div>
					</Visible>
				</FormikForm>
			</Popover.Content>
		</Popover>
	);
	return (
		<OverlayTrigger
			container={container}
			show={showNotifyMe}
			placement="bottom"
			overlay={popover}
			rootClose
		>
			{notifiedUser ? (
				<Button
					className={`btn-notifyme ${className}`}
					onClick={getNotification}
				>
					{displayText ? "Notified" : <SvgComponent path="notifications_white" />}
				</Button>
			) : (
				<Button
					className={`btn-notifyme slt-dark ${className}`}
					onClick={getNotification}
					variant={variant ? variant : 'primary'}
				>
					{displayText ? "Notify Me" : <SvgComponent path="notifications_white" />}
				</Button>
			)}
		</OverlayTrigger>
	);
};
const NotifyMe = withFormik({
	mapPropsToValues: () => {
		return {
			time: "Start",
			notifications: [],
		};
	},
	handleSubmit: (values, { props, ...formikProps }) => {
		const { email, sms } = values;
		let type = [];
		if (email) type.push("Email");
		if (sms) type.push("SMS");
		const payload = {
			type: type.join(";"),
			time: values.time,
			auctionId: props.auctionId,
			frequency: values.notifications.filter((item) => item.selected).map((item) => item.frequency),
		};

		if (props.assetId) {
			payload.assetId = props.assetId;
		}

		props
			.saveNotifyMe(payload)
			.then((res) => {
				props.notificationUpdate(res.message);
				hideNotifyMe[props.assetId]();
			})
			.catch((err) => {
				props.notificationUpdate(err.message);
				hideNotifyMe[props.assetId]();
			});
	},
})(Component);
export default NotifyMe;
