import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppButton, AppCard, AppInput } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';

const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(null);
  const [manual, setManual] = useState('');

  if (!permission) return <View style={styles.placeholder} />;

  if (!permission.granted) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.icon}>{'\u{1F4F7}'}</Text>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.subtitle}>
          Bloodlink uses the camera only to scan a donor's Bloodlink QR code. Nothing else is recorded.
        </Text>
        <AppButton title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  const handleScan = ({ data }) => {
    setScanned(data);
  };

  const proceed = () => {
    const value = (scanned || manual || '').trim();
    if (!value) return;
    navigation.navigate('Verification', { donationId: value });
  };

  return (
    <View style={styles.screen}>
      <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanned ? undefined : handleScan} />

      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.instruction}>
          {scanned ? 'Code captured' : 'Point the camera at the donor QR code'}
        </Text>
      </View>

      <View style={styles.sheet}>
        {!!scanned && (
          <AppCard title="Scanned code">
            <Text style={styles.code} numberOfLines={2}>{scanned}</Text>
          </AppCard>
        )}

        <AppInput
          label="Or enter the code manually"
          value={manual}
          onChangeText={setManual}
          placeholder="e.g. 12"
          keyboardType="numeric"
        />

        <AppButton title="Verify donation" onPress={proceed} testID="verify-donation" disabled={!scanned && !manual.trim()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.text },
  camera: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  icon: { fontSize: 48, marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.xl },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: colors.textOnPrimary,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  instruction: { ...typography.body, color: colors.textOnPrimary, backgroundColor: colors.overlay, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
  sheet: { backgroundColor: colors.background, padding: spacing.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  code: { ...typography.body, color: colors.text },
});

export default QRScannerScreen;
