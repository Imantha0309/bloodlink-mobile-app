import React from 'react';
import UserDirectoryScreen from '../../components/admin/UserDirectoryScreen';
import { ROLES } from '../../utils/constants';

const RecipientsScreen = () => (
  <UserDirectoryScreen
    role={ROLES.RECIPIENT}
    emptyTitle="No recipients found"
    emptyMessage="People who register as recipients will appear here."
  />
);

export default RecipientsScreen;
