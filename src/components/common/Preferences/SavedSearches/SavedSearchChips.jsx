import React from "react";
import _get from "lodash/get";
import _map from "lodash/map";
import _join from "lodash/join";
import _concat from "lodash/concat";
import _filter from "lodash/filter";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { removeNumber } from "../../../../utils/helpers";

import "./SavedSearchChips.scss";

function groupCriteria(searchPath, filterPath, search) {
  const searchItem = _get(search, searchPath);
  const filterItem = _map(_get(search, filterPath), "name");
  return removeNumber(_join(_filter(_concat([searchItem, filterItem])), ", "));
}

const SavedSearchChip = ({ label, value }) => {
  return value ? (
    <OverlayTrigger placement="top" overlay={<Tooltip>{value}</Tooltip>}>
      <div className="saved-search-chip">
        {label}: {value}
      </div>
    </OverlayTrigger>
  ) : null;
};

const SavedSearchChips = ({ search }) => {
  const keyword = _get(search, "keyword");

  const categories = groupCriteria(null, "appliedFilters.categoryId", search);
  const cityId = groupCriteria(null, "appliedFilters.cityId", search);
  const subCategories = groupCriteria(
    null,
    "appliedFilters.subCategoryId",
    search
  );
  const makes = groupCriteria(null, "appliedFilters.make", search);
  const models = groupCriteria(null, "appliedFilters.model", search);
  const assetTypes = groupCriteria(null, "appliedFilters.assetType", search);

  return (
    <div className="saved-search-chips">
      <SavedSearchChip label="Keyword" value={keyword} />
      <SavedSearchChip label="Category" value={categories} />
      <SavedSearchChip label="Sub Category" value={subCategories} />
      <SavedSearchChip label="Location" value={cityId} />
      <SavedSearchChip label="Make" value={makes} />
      <SavedSearchChip label="Model" value={models} />
      <SavedSearchChip label="Asset Type" value={assetTypes} />
    </div>
  );
};

export default SavedSearchChips;
