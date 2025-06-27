import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SettingsContainer,
  SettingsTitle,
  SettingsForm,
  SettingsInput,
  SaveButton,
  SuccessMessage,
} from "../style/style";
import { updateSettings } from "../API/slice/API";

function Setting() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // New email state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const { settingsStatus, settingsError } = useSelector((state) => state.API);

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (!username) {
      alert('Please enter your username for authentication.');
      return;
    }


    dispatch(updateSettings({
      username,
      email,
      old_password: oldPassword,
      new_password: newPassword,
    }));
  };

  useEffect(() => {
    if (settingsStatus === 'succeeded') {
      setUsername('');
      setEmail('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [settingsStatus]);

  return (
    <SettingsContainer>
      <SettingsTitle>Account Settings</SettingsTitle>
      <SettingsForm>
        <SettingsInput
          type="text"
          placeholder="Enter Username (for authentication)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <SettingsInput
          type="email"
          placeholder="Change Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SettingsInput
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <SettingsInput
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <SettingsInput
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <SaveButton
          onClick={handleSave}
          disabled={settingsStatus === 'loading'}
        >
          {settingsStatus === 'loading' ? 'Saving...' : 'Save Changes'}
        </SaveButton>
      </SettingsForm>

      {settingsStatus === 'succeeded' && (
        <SuccessMessage>Settings saved successfully!</SuccessMessage>
      )}

      {settingsStatus === 'failed' && (
        <SuccessMessage style={{ color: 'red' }}>{settingsError}</SuccessMessage>
      )}
    </SettingsContainer>
  );
}

export default Setting;
