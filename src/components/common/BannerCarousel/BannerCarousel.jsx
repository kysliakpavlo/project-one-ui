import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import SvgComponent from '../SvgComponent';
import { constructImageUrl } from '../../../utils/helpers';
import {
	ONE_DAY,
	BANNER_CAROUSEL_INTERVAL,
	DEFAULT_IMAGE,
} from '../../../utils/constants';

import './BannerCarousel.scss';

let intervalId;
let itemLength = 0;
let activeIndex = 0;

const BannerCarousel = ({ items = [], onClick, showText = true }) => {
	const hasVideo = items.some((item) => item.video);
	itemLength = items.length;
	const [playing, setPlaying] = useState(true);
	const [videoMuted, setVideoMuted] = useState(true);
	const [index, setIndex] = useState(activeIndex);

	const handleSelect = (selectedIndex, e) => {
		setIndex(selectedIndex);
	};

	const togglePlaying = useCallback(() => {
		const videos = document.querySelectorAll('.banner-carousel video');
		setPlaying((playing) => {
			if (!playing) {
				videos[index].play();
			} else {
				videos[index].pause();
			}
			return !playing;
		});
	}, [setPlaying, index]);

	useEffect(() => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		if (!hasVideo) {
			intervalId = setInterval(() => {
				activeIndex++;
				activeIndex = activeIndex === itemLength ? 0 : activeIndex;
				setIndex(activeIndex);
			}, BANNER_CAROUSEL_INTERVAL);
		}
	}, [hasVideo, items, setIndex]);

	useEffect(() => {
		// in development ignore video,
		// if not we see a lot of red in the console
		if (process.env.NODE_ENV === 'development') {
			return;
		}

		//UAT also return immediately
		return;

		const videos = document.querySelectorAll('.banner-carousel video');

		if (items && items[index]?.video) {
			videos[index].currentTime = 0;
			if (videos && videos[index] && playing) {
				videos[index].play();
			} else {
				videos[index].pause();
			}
		}
	}, [items, index]);

	const onClickSeeMore = (item) => (e) => {
		if (
			item.linkUrl &&
			item.linkUrl.toLowerCase().includes(window.location.host)
		) {
			window.location.href = item.linkUrl;
		} else {
			// BELOW HIDDEN FOR FUTURE BANNE INTEGRATION
			// window.open(item.linkUrl, '_blank');

			//BELOW ADDED TEMPORARILY
			const auctions = window.location + 'auctions';
			window.open(auctions, '_blank');
		}
	};

	console.log('items -> ', items);

	return (
		<Carousel
			className="banner-carousel"
			interval={ONE_DAY}
			touch
			activeIndex={index}
			onSelect={handleSelect}
		>
			{/* MAP BELOW HIDDEN FOR FUTURE BANNER INTEGRATION */}

			{/* {items &&
				items.map((item) => (
					<Carousel.Item
						key={item.featuredBannerId}
						onClick={(e) => onClick && onClick(item, e)}
					>
						{!item.video ? (
							<img
								className="d-block w-100"
								src={DEFAULT_IMAGE}
								onLoad={(e) =>
									constructImageUrl(item.imageUrl, e.target)
								}
								alt={item.linkText}
								loading="lazy"
							/>
						) : // in development ignore video,
						// if not we see a lot of red in the console
						process.env.NODE_ENV === 'development' ? (
							<div>Video Placeholder</div>
						) : (
							<video
								loop
								muted={videoMuted}
								src={item.imageUrl}
								className="d-block w-100"
							/>
						)}
						{showText && (
							<Carousel.Caption>
								<div className="container">
									<h2>{item.name}</h2>
									<h3>
										{item.subHeading}

										{item.video && (
											<div className="video-control">
												<span
													className="play-pause-control"
													onClick={() =>
														togglePlaying()
													}
												>
													<SvgComponent
														path={
															playing
																? 'pause'
																: 'play'
														}
													/>
												</span>
												<span
													className="volume-control"
													onClick={() =>
														setVideoMuted(
															!videoMuted
														)
													}
												>
													<SvgComponent
														path={
															videoMuted
																? 'volume-off'
																: 'volume-up'
														}
													/>
												</span>
											</div>
										)}
									</h3>
									<Button
										type="button"
										disabled={!item.linkUrl}
										className="auction-button"
										onClick={onClickSeeMore(item)}
									>
										{item.linkText || 'See More'}
									</Button>
								</div>
							</Carousel.Caption>
						)}
					</Carousel.Item>
				))} */}

			{/* CAROUSEL ITEM ADDED TEMPORARILY */}
			<Carousel.Item key={'placeholder'}>
				<div
					className="d-block w-100"
					loading="lazy"
					style={{
						backgroundImage:
							'linear-gradient(90deg, var(--cta-color-1) -9%, rgba(255, 255, 255, 0) 65%),' +
							'url(' +
							window.location.origin +
							'/assets/family-car.png' +
							')',
						backgroundPosition: 'center',
						backgroundSize: 'cover',
						backgroundRepeat: 'no-repeat',
						height: '100%',
					}}
				>
					{/* <img
						className="d-block w-100"
						// src={window.location.origin + '/assets/family-car.png'}
						// onLoad={(e) => constructImageUrl(item, e.target)}
						src={window.location.origin + '/assets/family-car.png'}
						alt={'Auctions & Valuations'}
						loading="lazy"
						style={{
							// backgroundImage:
							// 	'linear-gradient(90deg, var(--cta-color-1) -9%, rgba(255, 255, 255, 0) 65%)' +
							// 	',url(' +
							// 	window.location.origin +
							// 	'/assets/family-car.png' +
							// 	')',
							backgroundPosition: 'center',
							backgroundSize: 'cover',
							backgroundRepeat: 'no-repeat',
						}}
					/> */}
				</div>
				<Carousel.Caption>
					<div className="container">
						<h2>{items[0]?.name}</h2>
						<h3>{items[0]?.subHeading}</h3>
						<Button
							type="button"
							disabled={!items[0]?.linkUrl}
							className="auction-button"
							// onClick={onClickSeeMore(items[0])}
						>
							{items[0]?.linkText || 'See More'}
						</Button>
					</div>
				</Carousel.Caption>
			</Carousel.Item>
		</Carousel>
	);
};

export default BannerCarousel;
