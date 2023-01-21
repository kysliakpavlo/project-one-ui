import React from "react";
import Button from "react-bootstrap/Button";
import SocialLogin from "react-social-login";

class SocialButton extends React.Component {
  render() {
    const { triggerLogin, className, ...props } = this.props;

    return (
      <Button className={`social-btn ${className}`} onClick={triggerLogin} {...props}>
        <div className='social-btn-content'>
          {this.props.children}
        </div>
      </Button>
    );
  }
}

export default SocialLogin(SocialButton);
