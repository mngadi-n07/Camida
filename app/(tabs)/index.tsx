import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ShoppingCart, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { primaryColor } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const STORES = {
  walmart: {
    name: 'WTesting',
    logo: 'https://images.unsplash.com/photo-1608615748968-6125fb86ca78?w=100&auto=format&fit=crop&q=80',
  },
  target: {
    name: 'Target',
    logo: 'https://images.unsplash.com/photo-1580933135209-87d7d12c1f9a?w=100&auto=format&fit=crop&q=80',
  },
  wholeFoods: {
    name: 'Whole Foods',
    logo: 'https://images.unsplash.com/photo-1588775005506-cc9c22cdef84?w=100&auto=format&fit=crop&q=80',
  },
};


interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  recipe: string;
  price: number;
}

function SwipeableItem({ 
  item, 
  onToggle, 
  onRemove,
  productInfo,
  store,
}: { 
  item: GroceryItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  productInfo: any;
  store: any;
}) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(72);
  const opacity = useSharedValue(1);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // activates only if horizontal movement is >10px in either direction
    .failOffsetY([-10, 10])  
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH);
        itemHeight.value = withTiming(0);
        opacity.value = withTiming(0, undefined, (finished) => {
          if (finished) {
            runOnJS(onRemove)(item.id);
          }
        });
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(0);
        runOnJS(onToggle)(item.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: opacity.value,
    marginBottom: withSpring(itemHeight.value === 0 ? 0 : 8),
  }));

  return (
    <Animated.View style={[styles.itemContainer, rContainerStyle]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.itemContent, rStyle]}>
          {productInfo?.image && (
            <Image
              source={{ uri: productInfo.image }}
              style={styles.productImage}
            />
          )}
          
          <View style={styles.itemDetails}>
            <Text style={[
              styles.groceryItemText,
              item.checked && styles.groceryItemTextChecked,
            ]}>
              {item.name}
            </Text>
            {store && (
              <View style={styles.storeInfo}>
                <Image
                  source={{ uri: store.logo }}
                  style={styles.storeLogo}
                />
                <Text style={styles.storeName}>{store.name}</Text>
              </View>
            )}
          </View>


          {productInfo && (
            <Text style={styles.priceText}>
              {/* R{productInfo.price.toFixed(2)} this is weird */}
            </Text>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function GroceryScreen() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [grandTotal, setGrandTotal] = useState<number>(0);


  useEffect(() =>{
    let sum = 0;
    for (let item of groceryItems) {
      sum += item.price;
    }
    // setGrandTotal(sum.toFixed(2))
  },[groceryItems])


  useFocusEffect(
    useCallback(() => {
      const loadGroceryList = async () => {
        try {
          const list = await AsyncStorage.getItem('groceryList');
          if (list) {
            setGroceryItems(JSON.parse(list));
          }
        } catch (error) {

        }
      };

      loadGroceryList();

      // Optional: return cleanup function
      return () => {
        
      };
    }, []) // You can add dependencies here if needed
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }


  const toggleItem = async (id: string) => {
    const updatedItems = groceryItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryItems(updatedItems);
    await AsyncStorage.setItem('groceryList', JSON.stringify(updatedItems));
  };

  const removeItem = async (id: string) => {
    const updatedItems = groceryItems.filter(item => item.id !== id);
    setGroceryItems(updatedItems);
    await AsyncStorage.setItem('groceryList', JSON.stringify(updatedItems));
  };

  const clearCheckedItems = async () => {
    const remainingItems = groceryItems.filter(item => !item.checked);
    setGroceryItems(remainingItems);
    await AsyncStorage.setItem('groceryList', JSON.stringify(remainingItems));
  };

  const removeRecipeItems = async (recipeName: string) => {
    try {
      const itemsInRecipe = groceryItems.filter(item => item.recipe === recipeName);
      if (itemsInRecipe.length === 0) {
        Alert.alert('No Items', 'No items found for this recipe');
        return;
      }

      Alert.alert(
        'Remove Recipe Items',
        `Are you sure you want to remove all ${itemsInRecipe.length} items from "${recipeName}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedItems = groceryItems.filter(item => item.recipe !== recipeName);
                await AsyncStorage.setItem('groceryList', JSON.stringify(updatedItems));
                setGroceryItems(updatedItems);
              } catch (error) {

                Alert.alert('Error', 'Failed to remove items');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {

      Alert.alert('Error', 'An error occurred while removing items');
    }
  };

  const getProductInfo = (item: any) => {
    return  item;
  };

  const groupedItems = groceryItems.reduce((groups, item) => {
    const recipe = item.recipe || 'Other';
    if (!groups[recipe]) {
      groups[recipe] = [];
    }
    groups[recipe].push(item);
    return groups;
  }, {});

  const calculateTotalPrice = (items: GroceryItem[]) => {
    return items.reduce((total, item) => {
      return total + (item?.price || 0);
    }, 0);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Grocery List <ShoppingCart color={primaryColor} /></Text>
          {groceryItems.some(item => item.checked) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCheckedItems}>
              <Trash2 size={20} color="#FF3B30" />
              <Text style={styles.clearButtonText}>Clear Checked</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={Object.entries(groupedItems)}
          keyExtractor={([recipe]) => recipe}
          contentContainerStyle={styles.list}
          renderItem={({ item: [recipe, items] }) => (
            
            <View style={styles.recipeSection}>
              <View style={styles.recipeSectionHeader}>
                <Text style={styles.recipeName}>{recipe}</Text>
              </View>
              
              {(items as GroceryItem[]).map((groceryItem) => {
                const productInfo = getProductInfo(groceryItem);
                const store = productInfo ? STORES[productInfo.store] : null;

                return (
                  <SwipeableItem
                    key={groceryItem.id}
                    item={groceryItem}
                    onToggle={toggleItem}
                    onRemove={removeItem}
                    productInfo={productInfo}
                    store={store}
                  />
                );
              })}
              <View style={styles.recipeTotalContainer}>
                <View style={styles.recipeTotalInner}>
                  <Text style={styles.recipeTotalText}>
                    {/* Recipe Total: R{calculateTotalPrice(items as GroceryItem[]).toFixed(2)} */}
                    Recipe Total: R0.00
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeRecipeItems(recipe)}>
              <View style={styles.recipeTotalContainer}>
                <View style={styles.recipeTotalInner}>
                  <Text style={styles.recipeTotalText}>
                    <Trash2 size={16} color="#FF3B30" />
                    <Text style={styles.removeRecipeText}>Remove All</Text>
                  </Text>
                </View>
              </View>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Your grocery list is empty</Text>
              <Text style={styles.emptyStateSubtext}>
                Add ingredients from recipes to create your shopping list
              </Text>
            </View>
          }
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end',marginRight:7 }}>
          <Text style = {styles.grandTotal}>Grand Total R{grandTotal}</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  grandTotal : {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF7E1D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF3B30',
  },
  list: {
    padding: 16,
  },
  recipeSection: {
    marginBottom: 24,
  },
  recipeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  removeRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
  },
  removeRecipeText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF3B30',
  },
  recipeTotalContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  recipeTotalInner: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 160,
  },
  recipeTotalText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF7E1D',
    textAlign: 'center',
  },
  itemContainer: {
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 12,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  groceryItemText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  groceryItemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  storeName: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF7E1D',
    alignSelf: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
});