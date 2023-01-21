import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import ProfileForm from '../../common/RegistrationForm/ProfileForm';
import { useLocation } from 'react-router-dom';
import './ProfileView.scss';

const ProfileView = ({
	loggedInUser,
	location,
	history,
	socket,
	validateLogin,
	getAccount,
	setLoading,
}) => {
	const [profile, setProfile] = useState(null);
	useEffect(() => {
		if (loggedInUser) {
			setLoading(true);
			getAccount().then((res) => {
				setProfile(res.result);
				setLoading(false);
			});
		} else {
			history.push('/');
		}
	}, [history, loggedInUser, setProfile]);

	const onUpdate = () => {
		getAccount().then((res) => {
			setProfile(res.result);
		});
	};

	if (!loggedInUser) {
		return 'Please login to see your profile';
	} else {
		return (
			<div className="registration-view">
				<h2 className="account-option-title">Profile</h2>
				{!profile ? (
					'Loading...'
				) : (
					<ProfileForm
						profile={profile}
						socket={socket}
						onUpdate={onUpdate}
						validateLogin={validateLogin}
					/>
				)}
			</div>
		);
	}
};

export default ProfileView;
