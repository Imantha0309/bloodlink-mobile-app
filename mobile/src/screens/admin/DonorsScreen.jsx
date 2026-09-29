import React from 'react';
import UserDirectoryScreen from '../../components/admin/UserDirectoryScreen';
import { ROLES } from '../../utils/constants';

const DonorsScreen = () => (
  <UserDirectoryScreen
    role={ROLES.DONOR}
    emptyTitle="No donors found"
    emptyMessage="People who register as donors will appear here."
  />
);

export default DonorsScreen;
