import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography, radius, spacing } from '../../../theme';
import AppButton from '../AppButton';

const AppModal = ({ visible, title, message, onClose, onConfirm, confirmTitle = 'Confirm', cancelTitle = 'Cancel', loading = false, children }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={onClose} accessibilityLabel="Close dialog" />
      <View style={styles.sheet}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {!!message && <Text style={styles.message}>{message}</Text>}
        {children}
        <View style={styles.actions}>
          <View style={styles.action}>
            <AppButton title={cancelTitle} variant="outline" onPress={onClose} />
          </View>
          {onConfirm && (
            <View style={styles.action}>
              <AppButton title={confirmTitle} onPress={onConfirm} loading={loading} />
            </View>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  dismissArea: { flex: 1 },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  message: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', marginTop: spacing.md },
  action: { flex: 1, marginHorizontal: spacing.xs },
});

export default AppModal;
