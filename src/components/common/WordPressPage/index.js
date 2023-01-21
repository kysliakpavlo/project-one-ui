import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { setLoading } from "../../../actions/app";
import CommonIframe from "./CommonIframe";
import { showMessage } from "../../../actions/toast";

const mapStateToProps = (state) => {
  const vendor = _get(state, "auth.vendor", {});
  const locations = _get(state, "app.locations", []);
  
  return {
    vendor,
    locations,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showMessage,
      setLoading,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(CommonIframe);
