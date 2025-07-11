import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { prodUnitId, shops } from '../../../constants';


interface LoyaltyCard {
  card_id: string;
  id: string;
  name: string;
  barcode: string;
  type: string;
  image?: string;
}

const CARD_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/cards"


export default function CardsScreen() {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const { user, getValidAccessToken  } = useAuth();

  useFocusEffect(
      useCallback(() => {
        loadCards();

        return () => {
        };
      }, []) 
    );
  

  useEffect(() => {
    loadCards();
  }, []);

  const handleDelete = async () => {
    if (!selectedItem) return;

    const url = new URL(`${CARD_URL}`);
    url.searchParams.append("card_id", selectedItem.card_id)
    const authToken = await getValidAccessToken();

    try {
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {"email":user.email, "Authorization":authToken}
      });

      
    } catch (error) {

    }
    setShowDeleteModal(false);
    loadCards();
  };

  const openDeleteModal = (currentItem) => {
    setSelectedItem(currentItem);
    setShowDeleteModal(true);
  };

  const loadCards = async () => {
    try {
      const list = await AsyncStorage.getItem('cardList');
      if (list) {
        setCards(JSON.parse(list));
      }
      console.log(prodUnitId)
      

      const authToken = await getValidAccessToken();

      const response = await fetch(CARD_URL, {
        method: "GET",
        headers: {"email":user.email, "Authorization": authToken}
      });
 
      const json = await response.json();

      setCards(json);
      AsyncStorage.setItem('cardList', JSON.stringify(json));


    } catch (error) {

    }
  };

  const focusOnCard = (item: LoyaltyCard) => {
    router.push({
      pathname: '/cards/card',
      params: { 
        barcode: item.card_value,
        type: item.card_format,
        name: item.card_name
      }
    })

  }


  const renderCard2 = ({ item }: { item: LoyaltyCard }) => {
     
    const cardUrl = shops.get(item.card_name);
    return(
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={() => {focusOnCard(item)}}>
        <Image
          source={cardUrl}
          style={styles.cardImage}
          resizeMode="cover"
        />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => openDeleteModal(item)}
        >
          <Trash2 color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
    )
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cards</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/cards/scan')}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* <View style={styles.adContainer}>
        <BannerAd
        unitId={prodUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly : true
        }}
      />

      </View> */}
        
      


      <FlatList
        data={cards}
        renderItem={renderCard2}
        keyExtractor={(item) => item.card_id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Item</Text>
            <Text style={styles.modalText}>Are you sure you want to delete "{selectedItem.card_name}"?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.ModalDeleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  cardContainer2: {
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative',
  },
  deleteButton2: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  adContainer: {
    alignItems: 'center', // center horizontally
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 24,
  },
  cardContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 12,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f97316',
    borderRadius: 20,
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
  list: {
    padding: 16,
    paddingBottom: 0,
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
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cardName: {
    flex: 1,  // This will make the text take available space and appear centered
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    textAlign: 'center',  // Center the text within its space
  },
  spacer: {
    flex: 1,  // This will push the trash icon to the far right
  },
  cardBody: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: "#12365A"
  },
  barcode: {
    width: '100%',
    height: 100,
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#000',
  },
  ModalDeleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: 'white',
  },
});