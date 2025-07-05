import { useRouter } from 'expo-router';
import { Check, ChefHat, ChevronDown, Search, SlidersHorizontal, Star, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';

import { bucketUrl } from "../../../constants";



const { width } = Dimensions.get('window');
const COLLECTION_CARD_WIDTH = (width - 48) / 2;
const RECIPE_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/recipe";

const cardWidth = (width - 60) / 2;


const BUDGET_OPTIONS = [
  { id: 'cheap', label: '$' },
  { id: 'moderate', label: '$$' },
  { id: 'bougie', label: '$$$' },
];

const SORT_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price' }
];




// Define types for your search result
type SearchResult = {
  recipe_id: string;
  name: string;
  price:number;
  rating:number;
  // Add other properties as needed
};

  const dietaryPreferences = ['all', 'Vegetarian', 'Vegan', 'Keto'];
  const mealTypes = ['all', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'];

type SortOption = 'rating' | 'time' | 'name' | 'price';

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('rating');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const [data, setData] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedItem, setSelectedItem] = useState({});
  const [budget, setBudget] = useState('');
  const [sort, setSort] = useState('name');

  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedDietaryPreference, setSelectedDietaryPreference] = useState<string>('all');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  

  const dropdownOptions = [
    'Select an option',
    'Pick n Pay',
    'Checkers',
    'Shoprite',
    'Woolworths',
  ];


  useEffect(() => {

    search("",0);
  }, []);
  
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isCloseToBottom) {

      search(searchQuery,page)
    }
  };

  const handleRecipePress = (recipe: any) => {
    router.push({
      pathname: '/explore/recipe',
      params: { 
        recipeId: recipe.recipe_id,
        back: "/(tabs)/explore"
      }
    });
  };
 
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Search function with TypeScript
  const search = async (term: string, varPage: number): Promise<void> => {
    if (loading || !hasMore) return;
    
    setLoading(true);
   
    try {

      const url = new URL(`${RECIPE_URL}`);
      url.searchParams.append("search","name");
      url.searchParams.append("query",term.trim());
      url.searchParams.append("order_by","");
      url.searchParams.append("page",varPage.toString());


      const response = await fetch(url.toString());
      const newData: SearchResult[] = await response.json(); // Update with your response type

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prevData => [...prevData, ...newData]);
        setPage(varPage + 1);
      }

    } catch (error) {

    }finally {
      setLoading(false);
    }
  };


  function resetPageDependencies() {
    setPage(0)
    setData([])
    setHasMore(true)
  }

  function handleEnter(): void {
    resetPageDependencies()

    search(searchQuery,0)
   
  }
    const renderRecipeCard = (recipe) => (
    <TouchableOpacity 
      key={recipe.id} 
      style={styles2.recipeCard}
      onPress={() => handleRecipePress(recipe)}
    
    >
      <Image source={{ uri: bucketUrl + recipe.image_url }} style={styles3.recipeImage} />
      <View style={styles3.recipeContent}>
        <Text style={styles3.recipeName} numberOfLines={2}>{recipe.name}</Text>
        <View style={styles3.recipeRating}>
          <Star size={14} color="#f97316" fill="#f97316" />
          <Text style={styles3.ratingText}>{recipe.rating}</Text>
          <Text style={styles3.reviewsText}>{recipe.reviews}</Text>
        </View>

        <Text style={styles3.recipePrice}>R{recipe.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

    const renderBanner = (recipe) => (
      <>
      {renderRecipeCard(recipe)}
      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
      />
  </>
      
    )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{"flexDirection": "row"}}>
          <Text style={styles.title}>Explore Recipes</Text>
          <ChefHat size={20} color='#FF7E1D' />
        </View>
        
        <Text style={styles.subtitle}>Discover recipes and cooking inspirations</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              value={searchQuery}
              onChangeText={text => {      
                setSearchQuery(text)
                setIsSearching(!!text);
              }}
              onFocus={() => setIsSearching(true)}
              onSubmitEditing={() => handleEnter()}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                  setShowSortOptions(false);
                  setHasMore(true);
                  setData([]);
                  search("",0);
                  Keyboard.dismiss();
                }}>
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            ) : null}
          </View>
         
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowFilterModal(true)}>
              <SlidersHorizontal size={20} color="#f97316" />
            </TouchableOpacity>
         
        </View>
      </View>


        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} onScroll={handleScroll}
        scrollEventThrottle={400}>

          <View style={styles.section}>
            <View style={styles.collectionsGrid}>           
              {data.map((collection,index) => {
                if((index +1) % 10 == 0){
                  return renderBanner(collection); 
                  
                } else {
                  return renderRecipeCard(collection)
                }
              })}
              {loading && (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color={"#f97316"} />
                </View>
              )}
              
              {!hasMore && (
                <View style={styles.noMore}>
                  <Text>More Recipes coming soon </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>


      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles2.modalContainer}>
          <View style={styles2.modalHeader}>
            <TouchableOpacity
              style={styles2.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles2.modalTitle}>Filter</Text>
            <TouchableOpacity
              style={styles2.resetButton}
              onPress={() => {
                setPriceFilter('all');
                setSelectedDietaryPreference('all');
                setSelectedMealType('all');
              }}
            >
              <Text style={styles2.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles2.modalContent}>
            {/* sort */}
            <View style={styles2.filterSection}>
              {/* <Text style={styles2.filterSectionTitle}>Sort By</Text>
            {[
              { key: 'name', label: 'Name (A-Z)' },
              { key: 'price', label: 'Price (Low to High)' },
              { key: 'rating', label: 'Rating (High to Low)' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles2.optionItem,
                  sortBy === option.key && styles2.optionItemSelected
                ]}
                onPress={() => {
                  setSortBy(option.key as SortOption);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles2.optionText,
                  sortBy === option.key && styles2.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
              ))} */}
              <Text style={styles2.filterSectionTitle}>Sort by </Text>
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

            {/* Price Range */}
            <View style={styles2.filterSection}>
              <Text style={styles2.filterSectionTitle}>Price Range sd </Text>
              <View style={styles2.filterOptions}>
                {[
                  { key: 'all', label: 'All Prices' },
                  { key: 'low', label: 'Under $12' },
                  { key: 'high', label: 'Over $12' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles2.filterChip,
                      priceFilter === option.key && styles2.filterChipSelected
                    ]}
                    onPress={() => setPriceFilter(option.key as PriceFilter)}
                  >
                    <Text style={[
                      styles2.filterChipText,
                      priceFilter === option.key && styles2.filterChipTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dietary Preferences */}
            <View style={styles2.filterSection}>
              <Text style={styles2.filterSectionTitle}>Dietary Preference</Text>
              <View style={styles2.filterOptions}>
                {dietaryPreferences.map((preference) => (
                  <TouchableOpacity
                    key={preference}
                    style={[
                      styles2.filterChip,
                      selectedDietaryPreference === preference && styles2.filterChipSelected
                    ]}
                    onPress={() => setSelectedDietaryPreference(preference)}
                  >
                    <Text style={[
                      styles2.filterChipText,
                      selectedDietaryPreference === preference && styles2.filterChipTextSelected
                    ]}>
                      {preference === 'all' ? 'All' : preference}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meal Type */}
            <View style={styles2.filterSection}>
              <Text style={styles2.filterSectionTitle}>Meal Type</Text>
              <View style={styles2.filterOptions}>
                {mealTypes.map((mealType) => (
                  <TouchableOpacity
                    key={mealType}
                    style={[
                      styles2.filterChip,
                      selectedMealType === mealType && styles2.filterChipSelected
                    ]}
                    onPress={() => setSelectedMealType(mealType)}
                  >
                    <Text style={[
                      styles2.filterChipText,
                      selectedMealType === mealType && styles2.filterChipTextSelected
                    ]}>
                      {mealType === 'all' ? 'All' : mealType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles2.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles2.applyButtonText}>Apply Filters s</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sort Option</Text>
            
            
            <View style={styles.budgetOptions}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.budgetOption,
                    budget === option.id && styles.budgetOptionSelected,
                  ]}
                  onPress={() => {
                    setSort(option.id);
                    resetPageDependencies()
                    setShowSortModal(false)
                  }}>
                  <Text
                    style={[
                      styles.budgetLabel,
                      budget === option.id && styles.budgetLabelSelected,
                    ]}>
                    {option.label}
                  </Text>
                  
                </TouchableOpacity>
              ))}
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
  loader: {
    padding: 20,
    alignItems: 'center',
  },
  noMore: {
    padding: 20,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF8F0',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF8F0',

  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#Fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: .5,
    borderColor: '#f97316',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
    borderRadius: 12,
    borderBlockColor:"rgb(38, 38, 212)",
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: .5,
    borderColor: '#f97316',
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sortOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  sortOptionSelected: {
    backgroundColor: '#FF7E1D',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  sortOptionTextSelected: {
    color: '#fff',
  },
  searchResults: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  searchResultMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  sortFilterStyle: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 1,
  },
  noResults: {
    alignItems: 'center',
    paddingTop: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  ingredientsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ingredientsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ingredientsText: {
    flex: 1,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  ingredientsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF7E1D',
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 15
  },
  collectionCard: {
    width: COLLECTION_CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  collectionImage: {
    width: '100%',
    height: 120,
  },
  collectionContent: {
    padding: 12,
  },
  collectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  trendingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  trendingContent: {
    flex: 1,
    marginLeft: 12,
  },
  trendingTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  trendingSaves: {
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
  
  budgetOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetOption: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  budgetOptionSelected: {
    backgroundColor: '#EBF5FF',
    borderColor: '#FF7E1D',
  },
  budgetLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginTop: 8,
  },
  budgetLabelSelected: {
    color: '#FF7E1D',
  },
  budgetAmount: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  budgetAmountSelected: {
    color: '#FF7E1D',
  },
    controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3e2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 6,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
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
    borderRadius: 8,
    padding: 12,
    zIndex: 1,
    backgroundColor: '#fef3e2',
    borderColor: '#f97316',
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

    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3e2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 6,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  recipeCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    borderWidth: .5,
    borderColor: '#f97316',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeContent: {
    padding: 12,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recipePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f97316',
  },
  emptySpace: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  optionItemSelected: {
    backgroundColor: '#fef3e2',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#f97316',
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
});

const styles3 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3e2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 6,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  recipeCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#f97316',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeContent: {
    padding: 12,
     display: "flex",
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recipePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f97316',
    marginLeft: "auto"
  },
  emptySpace: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  optionItemSelected: {
    backgroundColor: '#fef3e2',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#f97316',
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});