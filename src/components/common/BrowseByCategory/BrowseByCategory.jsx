import React from "react";
import { stringify } from "qs";
import { useHistory } from "react-router-dom";
import MultiCarousel from "react-multi-carousel";

import SvgComp from "../SvgComponent";
import { carouselResponsive, IT_AND_COMPUTERS } from "../../../utils/constants";

import "./BrowseByCategory.scss";

const responsive = carouselResponsive({ desktop: 8, tablet: 4, mobile: 2 });
const BrowseByCategory = ({ categories, homepageCategories }) => {
	const history = useHistory();
	categories = categories.filter((ele) => ele.groupName !== "All Categories");
	const handleClick = (category, event) => {
		if (category === "Buy Now") {
			const obj = stringify({
				assetType: "Buy Now",
				title: "Buy Now",
				buyingMethod: "All",
			});
			history.push(`/search-results?${obj}`);
		}
		if (category === IT_AND_COMPUTERS) {
			const obj = stringify({
				subCategory: IT_AND_COMPUTERS,
				title: "IT",
				buyingMethod: "All",
			});
			history.push(`/search-results?${obj}`);
		} else if (category !== "Buy Now" && category !== IT_AND_COMPUTERS) {
			const obj = stringify({ category, buyingMethod: "All" });
			history.push(`/search-results?${obj}`);
		}
	};

	return (
		<div className="browse-by-category">
			<MultiCarousel
				swipeable
				draggable
				keyBoardControl
				showDots={false}
				autoPlay={false}
				infinite={false}
				responsive={responsive}
				customTransition="all .5"
				transitionDuration={500}
				containerClass="carousel-container"
				dotListClass="custom-dot-list-style"
				itemClass="carousel-item-padding-40-px"
				className="category-list container "
			>
				{/* Limit to only 6 items */}
				{
					homepageCategories && homepageCategories.map((category, i) => {
						return (<div 
							key={i}
							className="category-item-wrap category__bgimg" 
							style={{backgroundImage: `url(${category.categoryImg})` }}
						>
							<a
								key={i}
								className="category-item"
								href={category.categoryUrl}
							>
								{/* <SvgComp path={item.featuredImage} /> */}
								{category.categoryTitle}
							</a>
						</div>)
					})
				}
				{/* <a
          className="category-item"
          href={`/search-results?${stringify({
            subCategory: IT_AND_COMPUTERS,
            title: "IT",
            buyingMethod: "All",
          })}`}
        >
          <SvgComp path="desktop" />
          {IT_AND_COMPUTERS}
        </a> */}
				{/* <a
          className="category-item"
          href={`/search-results?${stringify({
            assetType: "Buy Now",
            title: "Buy Now",
            buyingMethod: "All",
          })}`}
        >
          <SvgComp path="car-buy" />
          Buy now
        </a> */}
			</MultiCarousel>
		</div>
	);
};

export default BrowseByCategory;
