import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { setLoading, secureApi } from "../../../actions/app";
import {
  getTransportFee,
  getCities,
  getTransportAssetTypes,
} from "../../../utils/api";
import { showMessage } from "../../../actions/toast";
import TransportView from "./TransportView";

const mapStateToProps = (state) => {
  const vendor = _get(state, "auth.vendor", {});
  const isLoading = _get(state, "app.isLoading", false);
  return {
    vendor,
    isLoading,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading,
      showMessage,
      getTransportFee: secureApi(getTransportFee),
      getCities: secureApi(getCities),
      getTransportAssetTypes: secureApi(getTransportAssetTypes),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TransportView);
