import { CameraView, useCameraPermissions,BarcodeScanningResult } from 'expo-camera';
import React, { useCallback } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert  } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Check, ChevronDown, Scan, X } from 'lucide-react-native';
import { shops } from '@/constants';

const CARD_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/cards"

export default function Temp() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [isActive, setActive] = useState(true)
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const dropdownOptions = Array.from(shops.keys())


  useFocusEffect(
    useCallback(() => {
      setActive(true); // Reset when screen is focused
      return () => {
        // Optional: clear or pause things here
      };
    }, [])
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Scan size={64} color="#f97316" style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need your permission to use the camera for scanning QR codes and barcodes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  
  const submitNewCard = async () => {
      const url = new URL(`${CARD_URL}`);
      const body = {"card_value": manualCode.trim(), "card_name": selectedOption, "card_format": "CODE128","store_id": 2};
      
      try {
        const response = await fetch(url.toString(), {
        method: "POST",
        headers: {"email":"dwilson@company.net"},
        body: JSON.stringify(body),
      });


      } catch (error) {
        console.error('Error adding card:', error);
      }
      router.dismissTo("/(tabs)/cards");
    };

  function handleCard(barcodeData : BarcodeScanningResult){
    const d = new Date();
    setActive(false)
    setShowManualEntry(true);
    setManualCode(barcodeData.data);
  }

  const handleManualCodeSubmit = () => {
    if (manualCode.trim()) {
      Alert.alert(
        'Code Added',
        `Rewards card code: ${manualCode.trim()}`,
        [{ text: 'OK' }]
      );
      // setManualCode('');
      // setShowManualEntry(false);
      submitNewCard()
    }
    router.dismissTo("/(tabs)/cards");
  };


  return (
    <View style={styles.container}>
      {/* <StatusBar style="light" /> */}
      
        <CameraView
          style={styles.camera}
          onBarcodeScanned={handleCard}
          active ={isActive}
          
          // barcodeScannerSettings={{
          //   barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'upc_e'],
          // }}
        >
          <View style={styles.overlay}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton}
                  onPress={() => router.dismissTo("/(tabs)/cards")}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Scan Code</Text>
                  <Text style={styles.subtitle}>
                    Scan your rewards card's{'\n'}barcode
                  </Text>
                </View>

                <View style={styles.scanArea}>
                  <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                                  
                  <TouchableOpacity 
                    style={styles.enterButton}
                    onPress={() => setShowManualEntry(true)}
                  >
                    {/* <Keyboard size={20} color="#fff" /> it's the icon */}
                    <Text style={styles.enterButtonText}>Enter code</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </CameraView>
      

      {/* Manual Code Entry Modal */}
      <Modal
        visible={showManualEntry}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowManualEntry(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter Rewards Code sd</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Enter your rewards card barcode number below 
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Barcode Number</Text>
              <TextInput
                style={styles.textInput}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Enter your rewards card code"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
              />
              <Text style={styles.inputLabel}>Store Name</Text>
              <TouchableOpacity
               style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}
              >
              <Text style={[styles.dropdownText, !selectedOption && styles.placeholderText]}>
                {selectedOption || 'Select an option'}
              </Text>
              <ChevronDown 
                size={20} 
                color="#FF6B35" 
                style={[styles.dropdownIcon, showDropdown && styles.dropdownIconRotated]} 
              />
        </TouchableOpacity>
        
        {showDropdown && (
          <View style={styles.dropdownList}>
            {dropdownOptions.slice(1).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  index === dropdownOptions.slice(1).length - 1 && styles.dropdownItemLast
                ]}
                onPress={() => {
                  setSelectedOption(option);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option}</Text>
                {selectedOption === option && (
                  <Check size={16} color="#FF7E1D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

            </View>
              
            

            <TouchableOpacity
              style={[
                styles.submitButton,
                !manualCode.trim() && styles.submitButtonDisabled
              ]}
              onPress={handleManualCodeSubmit}
              disabled={!manualCode.trim()}
            >
              <Text style={[
                styles.submitButtonText,
                !manualCode.trim() && styles.submitButtonTextDisabled
              ]}>
                Add Rewards Card
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  camera: {
    flex: 1,
  },
  webFallback: {
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 22,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#f97316',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  webPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  webPlaceholderText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 40,
  },
  scanButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  enterButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledText: {
    color: '#9ca3af',
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  permissionText: {
    color: '#1f2937',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    height: 56,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  recentCodesContainer: {
    marginBottom: 32,
  },
  recentCodesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  recentCodeItem: {
    padding: 12,
    backgroundColor: '#fef3e2',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  recentCodeText: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  submitButton: {
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
  // Dropdown styles
  dropdownContainer: {
    position: 'relative',
    zIndex: 2000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    zIndex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  dropdownIcon: {
    transform: [{ rotate: '0deg' }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 3000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
});
