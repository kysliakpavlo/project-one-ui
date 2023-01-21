import React from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import SvgComponent from "../SvgComponent";
import Visible from "../Visible";
import { lpad } from "../../../utils/helpers";

import "./BlockRenderer.scss";

const BlockRenderer = ({ days, hours, minutes, seconds, completed, ...others }) => {
	if (completed) {
		return (
			<div className="block-renderer  ">
				<div className="div-timecount">
					<div className="time-div">0</div>
					<div className="time-div">0</div>
					<div className="time-div">0</div>
				</div>
				<div className="countdown-labels ">
					<div className="div-time-label">
						<div className="time-label">(hrs/</div>
						<div className="time-label">min/</div>
						<div className="time-label">sec)</div>
					</div>
				</div>
			</div>
		);
	} else {
		let labels = [];
		let times = [];
		if (days !== 0) {
			labels = ["days", "hrs", "min"];
			times = [days, hours, minutes];
		} else if (!others.props.bonusTime) {
			times = [hours, minutes, seconds];
			labels = ["hrs", "min", "sec"];
		} else {
			times = [<SvgComponent path="bonus-time" />, minutes, seconds];
			labels = ["", "min", "sec"];
		}
		return (
			<div className={`block-renderer ${others.props.bonusTime ? "bonus-time" : ""}`}>
				<div className="countdown-labels">
					<div className="div-time-heading">{others.props.heading}</div>
					<div className="div-time-label">
						(
						{labels.map((item, i) => {
							let slash = "/";
							return (
								<div className="time-label" key={item}>
									{item}
									{i == 2 ? "" : slash}
								</div>
							);
						})}
						)
					</div>
				</div>
				<div className="div-timecount">
					{times.map((item, index) =>
						!isNaN(parseInt(item)) ? (
							<React.Fragment key={index}>
								<Visible when={others.props.bonusTime}>
									<OverlayTrigger placement="top" overlay={<Tooltip>Bonus Time Added</Tooltip>}>
										<div className="time-div" key={`${item} _${index} `}>
											{lpad(item)}
										</div>
									</OverlayTrigger>
								</Visible>
								<Visible when={!others.props.bonusTime}>
									<div className="time-div" key={`${item} _${index} `}>
										{lpad(item)}
									</div>
								</Visible>
							</React.Fragment>
						) : (
							<React.Fragment key={index}>
								<Visible when={others.props.bonusTime}>
									<OverlayTrigger placement="top" overlay={<Tooltip>Bonus Time Added</Tooltip>}>
										<div className="time-div bonus-time-indicator" key={"bonus-time"}>
											{item}
										</div>
									</OverlayTrigger>
								</Visible>
								<Visible when={!others.props.bonusTime}>
									<div className="time-div bonus-time-indicator" key={"bonus-time"}>
										{item}
									</div>
								</Visible>
							</React.Fragment>
						)
					)}
				</div>
			</div>
		);
	}
};

export default BlockRenderer;
