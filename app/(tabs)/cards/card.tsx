import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { useLocalSearchParams } from 'expo-router';
import Barcode from 'react-native-barcode-svg';
import { useScreenBrightness } from '..//../../hooks/useScreenBrightness'; // adjust path as needed



export default function Card() {
    const { barcode, type, name } = useLocalSearchParams();
    useScreenBrightness(1.0);
    
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardName}>{name}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.barcodeWrapper}>
                  <Barcode value={barcode} format={type} height={200} singleBarWidth={2.5} />
                </View>
                <Text style={styles.barcodeText}>{barcode}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.adContainer}>
            <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly : true
            }}
          />

          </View>
          
        </SafeAreaView>
      );
    };

  const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContainer: {
    alignItems: 'center', // center horizontally
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '90%',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cardHeaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    textAlign: 'center',
  },
  cardBody: {
    padding: 10,
    alignItems: 'center',
  },
  barcodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 8,
  },
  });