import React from "react";
import Card from "react-bootstrap/Card";

import './CountCards.scss';

const CountCards = ({ data = [], openStatisticsModal }) => {
    const openStatsModal = (val) => {
        if (val.count && (val.count >= 0 || val.count < 0)) {
            openStatisticsModal(val);
        }
    }

    return (
        <div className="count-cards row ml-1">
            {data.map((item, index) => {
                return (
                    <Card key={index} className={`bg-${item.color} mb-2 text-white`}>
                        <Card.Body>
                            <Card.Text className="card-content time-detail pt-3"><h3><strong>{item.count}</strong></h3></Card.Text>
                            <Card.Title className="card-title text-truncate text-right">{item.label}</Card.Title>
                            <Card.Footer className="text-center view-details" onClick={() => openStatsModal(item)}>View Details</Card.Footer>
                        </Card.Body>
                    </Card>
                )
            })}
        </div>
    )
}

export default CountCards;