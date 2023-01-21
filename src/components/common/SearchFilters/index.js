import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from "../../../actions/app";
import {
  saveRemoveSearch,
  updateSavedSearchCrietria,
} from "../../../utils/api";

import SearchFilters from "./SearchFilters";

const mapSTP = () => ({});

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      saveRemoveSearch: secureApi(saveRemoveSearch),
      updateSavedSearchCrietria: secureApi(updateSavedSearchCrietria),
    },
    dispatch
  );

export default connect(mapSTP, mapDTP)(SearchFilters);
