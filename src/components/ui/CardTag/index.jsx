import "./CardTag.scss";

const CardTag = ({
	statusClass,
	statusTag
}) => {
	return (
		<div className={`cardTag status-tag cardTag--${statusClass}`}>
			<div className="cardTag__label">{statusTag}</div>
		</div>
	);
};

export default CardTag;