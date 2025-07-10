import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Clock, Heart, ListPlus, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bucketUrl, prodUnitId } from "../../../constants";


const RECIPE_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/recipe";
const USER_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/users";


export default function RecipeScreen() {

    const router = useRouter();
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { recipeId } = useLocalSearchParams();
    const [addedItems, setAddedItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const { user , getValidAccessToken } = useAuth();

    useEffect(() => {
        // Fetch data when screen mounts
        const fetchData = async () => {
        try {
            const url = new URL(`${RECIPE_URL}`);
            url.searchParams.append("recipe_id",recipeId);
            url.searchParams.append("search","recipeId");

            const authToken = await getValidAccessToken();
            const response = await fetch(url.toString(), {
              method: "GET",
              headers: {"email":user.email, "Authorization": authToken}
            });
            const json = await response.json();

            
            setSelectedRecipe(json);
            setIsFavorite(json.recipe.is_favorite)
        } catch (error) {

        } finally {
            setLoading(false);
        }
        };

    fetchData();
  }, [recipeId]); 
  
  const toggleFavorite = async () => {
    try {
        const url = new URL(`${USER_URL}`);
        url.searchParams.append("recipe_id",recipeId);
        const authToken = await getValidAccessToken();
        const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {"email":user.email, "Authorization": authToken}
      });


      setIsFavorite(!isFavorite);
      Alert.alert(
        isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
        isFavorite ? 'Recipe removed from your favorites' : 'Recipe added to your favorites'
      );
    } catch (error) {

      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const addToGroceryList = async () => {
    if (!selectedRecipe?.ingredients) {
      Alert.alert('Error', 'No ingredients found');
      return;
    }

    try {
      const existingList = await AsyncStorage.getItem('groceryList');
      let groceryItems = existingList ? JSON.parse(existingList) : [];

      const newItems = selectedRecipe.ingredients.map(ingredient => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: ingredient.name,
        checked: false,
        recipe: selectedRecipe.recipe.name,
        price: ingredient.price,
        image: ingredient.image_url
      }));

      const filteredNewItems = newItems.filter(
        newItem => !groceryItems.some(
          existingItem => 
            existingItem.name === newItem.name && 
            existingItem.recipe === newItem.recipe
        )
      );

      if (filteredNewItems.length === 0) {
        Alert.alert('Already Added', 'All ingredients from this recipe are already in your grocery list');
        return;
      }

      groceryItems = [...groceryItems, ...filteredNewItems];
     
      await AsyncStorage.setItem('groceryList', JSON.stringify(groceryItems));
      
      setAddedItems(filteredNewItems);
      setShowConfirmation(true);
    } catch (error) {

      Alert.alert('Error', 'Failed to update grocery list');
    }
  };


    if (loading) {
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        );
      }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView style={styles.scrollView}>
            <Image source={{ uri: bucketUrl + selectedRecipe.recipe.image_url}} style={styles.coverImage} />
            
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.dismissTo('/explore')}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
                onPress={toggleFavorite}>
                <Heart
                  size={24}
                  color="#fff"
                  fill={isFavorite ? '#fff' : 'none'}
                />
              </TouchableOpacity>
            </View>
    
            <View style={styles.content}>
              <Text style={styles.title}>{selectedRecipe.recipe.name}</Text>
              
              {/* {selectedRecipe.restrictions && (
                <View style={styles.restrictions}>
                  {selectedRecipe.restrictions.map((restriction) => (
                    <View key={restriction} style={styles.restrictionBadge}>
                      <Text style={styles.restrictionText}>{restriction}</Text>
                    </View>
                  ))}
                </View>
              )} */}
              
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Clock size={20} color="#f97316" />
                  <Text style={styles.metaText}>{selectedRecipe.recipe.cook_time}mins</Text>
                </View>
                {/* <View style={styles.metaItem}>
                  <Users size={20} color="#8E8E93" />
                  <Text style={styles.metaText}>Serves {selectedRecipe.servings}</Text>
                </View> */}
                <View style={styles.metaItem}>
                  
                  <Text style={styles.metaText}>R{selectedRecipe.recipe.price}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Star size={14} color="#f97316" />
                  <Text style={styles.metaText}>{selectedRecipe.recipe.rating}</Text>
                </View>
              </View>
    
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={addToGroceryList}>
                    <ListPlus size={20} color="#fff" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.circle}>
                      <Text style={styles.listItemNumber}>•</Text>
                    </View>
                    <Text style={styles.listItemText}> {ingredient.name} {ingredient.quantity} {ingredient.unit} {ingredient.notes}</Text>
                  </View>
                ))}
              </View>
              <BannerAd
                unitId={prodUnitId}
                size={BannerAdSize.BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true
                }}
              />
    
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                {selectedRecipe.recipe.steps.map((step, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.circle}>
                      <Text style={styles.listItemNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.listItemText}>{step}</Text>
                  </View>
                ))}
              </View>

            </View>
          </ScrollView>
    
          <Modal
            visible={showConfirmation}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowConfirmation(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Check size={32} color="#4CAF50" />
                  <Text style={styles.modalTitle}>Added to Grocery List</Text>
                </View>
                
                <Text style={styles.modalSubtitle}>
                  {addedItems.length} items have been added to your list:
                </Text>
                
                <View style={styles.addedItemsList}>
                  {addedItems.map((item, index) => (
                    <View key={item.id} style={styles.addedItem}>
                      <Text style={styles.addedItemText}>• {item.name}</Text>
                    </View>
                  ))}
                </View>
    
                
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSecondaryButton]}
                  onPress={() => {
                    setShowConfirmation(false)
                    router.back()}}>
                  <Text style={[styles.modalButtonText, styles.modalSecondaryButtonText]}>
                    Continue Shopping
                  </Text>
                </TouchableOpacity>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: '#000',
      marginLeft: 16,
    },
    backButtonAlt: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recipeList: {
      padding: 16,
    },
    recipeCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    recipeCardImage: {
      width: '100%',
      height: 160,
    },
    recipeCardContent: {
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recipeCardTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: '#000',
      marginBottom: 8,
    },
    recipeCardMeta: {
      flexDirection: 'row',
      gap: 16,
    },
    scrollView: {
      flex: 1,
    },
    coverImage: {
      width: '100%',
      height: 300,
    },
    headerButtons: {
      position: 'absolute',
      top: 16,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonActive: {
      backgroundColor: '#FF7E1D',
    },
    content: {
      padding: 16,
      marginTop: -40,
      backgroundColor: '#F2F2F7',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      color: '#000',
      marginBottom: 12,
    },
    restrictions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    restrictionBadge: {
      backgroundColor: '#FF7E1D',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    restrictionText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
    },
    metaInfo: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: '#8E8E93',
    },
    section: {
      marginTop: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: '#000',
    },
    addToCartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF7E1D',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 8,
    },
    addToCartText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: 12,
      flex: 1, // Takes remaining space
      // alignItems: 'center',
    },
    listItemNumber: {
      width: "auto",  /* Button width matches text */
      height: "auto", /* Button height matches text */
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFF',
    },
    circle: {
      width: 24,
      height: 24,
      borderRadius: 12, // Half of width/height to make it circular
      backgroundColor: '#f97316',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    listItemText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: '#000',
      lineHeight: 24,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorTitle: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      color: '#000',
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: '#8E8E93',
      textAlign: 'center',
      marginBottom: 24,
    },
    backButtonText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: '#FF7E1D',
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: '#000',
      marginTop: 12,
    },
    modalSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: '#8E8E93',
      marginBottom: 16,
    },
    addedItemsList: {
      marginBottom: 24,
    },
    addedItem: {
      marginBottom: 8,
    },
    addedItemText: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: '#000',
    },
    modalButton: {
      backgroundColor: '#FF7E1D',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    modalSecondaryButton: {
      backgroundColor: '#F2F2F7',
      marginBottom: 0,
    },
    modalSecondaryButtonText: {
      color: '#FF7E1D',
    },
  });