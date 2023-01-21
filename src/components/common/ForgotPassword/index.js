import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showMessage } from "../../../actions/toast";
import ForgotPassword from "./ForgotPassword";
import { secureApi } from "../../../actions/app";
import { getForgotPassword } from "../../../utils/api";
import { setLoading } from "../../../actions/app";
const mapSTP = () => ({});

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      setLoading,
      showMessage,
      getForgotPassword: secureApi(getForgotPassword),
    },
    dispatch
  );

export default connect(mapSTP, mapDTP)(ForgotPassword);
