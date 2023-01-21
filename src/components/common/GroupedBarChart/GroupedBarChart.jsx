import React from 'react'
import { Bar } from 'react-chartjs-2';

const chartOptions = {
    scales: {
        yAxes: [
            {
                ticks: {
                    beginAtZero: true,
                },
            }
        ],
        xAxes: [
            {
                gridLines: {
                    color: '#aaa',
                    borderDash: [1, 3],
                },
                display: false, // this will hide vertical lines
            }
        ]
    }
}


const GroupedBarChart = ({ data = [] }) => {
    const chartData = {
        labels: [],
        datasets: [
            {
                label: '# Highest Bid Amount',
                data: [],
                backgroundColor: '#a3cf27',
            },
            {
                label: '# Reserve Price',
                data: [],
                backgroundColor: '#6a8619',
            }
        ]
    };

    data.forEach(item => {
        chartData.labels.push(item.title);
        chartData.datasets[0].data.push(item.currentBidAmount)
        chartData.datasets[1].data.push(item.reservePrice)
    })

    return (
        <>
            <div className='header'>
                <h4 className='title mt-2'><strong>Auction Asset Stats</strong></h4>
            </div>
            <Bar data={chartData} options={chartOptions} />
        </>
    )
}

export default GroupedBarChart;