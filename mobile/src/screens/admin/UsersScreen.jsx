import React from 'react';
import UserDirectoryScreen from '../../components/admin/UserDirectoryScreen';

const UsersScreen = () => (
  <UserDirectoryScreen
    role={undefined}
    emptyTitle="No users found"
    emptyMessage="All registered accounts will appear here."
  />
);

export default UsersScreen;
