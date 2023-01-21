import AppTermsCondition from "./AppTermsCondition";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from "../../../actions/app";
import { updateTermsCondition } from "../../../utils/api";
import _get from "lodash/get";
const mapStateToProps = (state) => {
  const vendor = _get(state, "auth.vendor", {});
  return { vendor };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateTermsCondition: secureApi(updateTermsCondition),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AppTermsCondition);
