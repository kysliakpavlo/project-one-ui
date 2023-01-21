import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { toggleLogin } from '../../../actions/auth';
import { showMessage } from '../../../actions/toast';
import { secureApi, setLoading } from '../../../actions/app';
import { setHomeAuction, setHomeFiltersState } from '../../../actions/advanceSearch';
import { getBannerImages, getAuctions, getFeatured, getExpOfInterest } from '../../../utils/api';

import HomeView from "./HomeView";

const mapStateToProps = (state) => {
  const vendor = _get(state, "auth.vendor", {});
  const sideBar = _get(state, "app.sideBar", false);
  const isLoading = _get(state, "app.isLoading", false);
  const categories = _get(state, "app.categories", []);
  const homepageCategories = _get(state, "app.homepageCategories", []);
  const locations = _get(state, "app.locations", []);
  const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
  const showLogin = _get(state, "auth.showLogin", false);
  const homeFilters = _get(state, "advanceSearch.homeFilters", {});
  const homeAuction = _get(state, "advanceSearch.homeAuction", false);

  return {
    showLogin,
    vendor,
    isLoading,
    locations,
    categories,
	homepageCategories,
    isLoggedIn,
    sideBar,
    homeFilters,
    homeAuction,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
  setLoading,
  toggleLogin,
  showMessage,
  setHomeAuction,
  setHomeFiltersState,

  getBannerImages: secureApi(getBannerImages),
  getAuctions: secureApi(getAuctions),
  getFeatured: secureApi(getFeatured),
  getExpOfInterest: secureApi(getExpOfInterest)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
