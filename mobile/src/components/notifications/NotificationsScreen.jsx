import React, { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead, markRead, selectNotifications, selectNotificationsLoading, selectUnreadCount } from '../../store/notificationStore';
import AppCard from '../common/AppCard';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import Loading from '../common/Loading';
import AppButton from '../common/AppButton';
import { colors, typography, spacing } from '../../theme';
import { timeAgo } from '../../utils/helpers';

const NotificationsScreen = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unread = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const load = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }) => (
    <AppCard
      onPress={() => !item.isRead && dispatch(markRead(item.id))}
      style={item.isRead ? null : styles.unread}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>
        {item.isRead ? null : <Badge label="NEW" background={colors.primary} textColor={colors.textOnPrimary} />}
      </View>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
    </AppCard>
  );

  if (loading && notifications.length === 0) return <Loading label="Loading notifications…" fullScreen />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={
          unread > 0 ? (
            <View style={styles.headerActions}>
              <AppButton title="Mark all as read" variant="ghost" size="sm" onPress={() => dispatch(markAllRead())} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState icon={'\u{1F4DC}'} title="No notifications" message="Updates about blood requests and donations will appear here." />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerActions: { alignItems: 'flex-end', marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h4, color: colors.text, flex: 1, marginRight: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  time: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  unread: { borderColor: colors.primary, borderWidth: 1.5 },
});

export default NotificationsScreen;
