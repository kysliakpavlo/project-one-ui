import React from "react";
import Button from "react-bootstrap/Button";
import "./RelatedAssetItemCards.scss";
import RelatedAssetItemCard from "./RelatedAssetItemCard";

const RelatedAssetItemCards = ({ relatedAssets, isLoggedIn, toggleLogin, showMessage, navigatoToRelatedAssets, navigateToRelatedAsset, addToWatchlist }) => {
	return (
		<div className="related-assets">
			<div className="related-asset-head">
				<strong className="releated-assets-tag">Related Assets</strong>
			</div>
			<div className="related-assets-cards">
				{relatedAssets.map((relatedAsset) => (
					<RelatedAssetItemCard
						key={relatedAsset.assetId}
						relatedAsset={relatedAsset}
						isLoggedIn={isLoggedIn}
						toggleLogin={toggleLogin}
						showMessage={showMessage}
						navigateToRelatedAsset={navigateToRelatedAsset}
						addToWatchlist={addToWatchlist}
					/>
				))}
				{/* <div className="my-2 text-center view-more-btn">
          <Button className="w-100" onClick={navigatoToRelatedAssets} >View More</Button>
        </div> */}
			</div>
		</div>
	);
};

export default RelatedAssetItemCards;
