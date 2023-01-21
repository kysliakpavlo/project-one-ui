import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import SavedSearches from "./SavedSearches";
import { secureApi } from "../../../../actions/app";
import {
  getSavedSearch,
  removeSavedSearch,
  updateSavedSearch,
  getAllNotifyMe,
  saveNotifyMe,
  deleteNotifyme,
  clearSavedSearchCount,
} from "../../../../utils/api";

const mapSTP = (state) => {
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
  return {
    isLivePanelOpen,
  };
};

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      saveNotifyMe: secureApi(saveNotifyMe),
      deleteNotifyme: secureApi(deleteNotifyme),
      getAllNotifyMe: secureApi(getAllNotifyMe),
      getSavedSearch: secureApi(getSavedSearch),
      updateSavedSearch: secureApi(updateSavedSearch),
      removeSavedSearch: secureApi(removeSavedSearch),
      clearSavedSearchCount: secureApi(clearSavedSearchCount),
    },
    dispatch
  );

export default connect(mapSTP, mapDTP)(SavedSearches);
