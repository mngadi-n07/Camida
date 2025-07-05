import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { LogOut, MessageSquare, Send } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bucketUrl } from "../../constants";

const DIETARY_PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy Free', icon: '🥛' },
];

const USER_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/users";

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const { logout  } = useAuth();
  const [username, setUsername] = useState();
  const router = useRouter();


  // useFocusEffect(
  //   useCallback(() => {
  //     const fetchData = async () => {
  //       try {
            // const url = new URL(`${USER_URL}`);
    
            // const response = await fetch(url.toString(), {
            //   method: "GET",
            //   headers: {"email":"dwilson@company.net"}
            // });
            // const json = await response.json();
            // let favouritesRecipes = []
            // if (json.favourites == null){
            //   setUsername(json.name);
            //   return;
            // }
    
            // let recipes = json.favourites.split(",");
            // recipes.map((item) =>{
            //   const itemProps = item.split(":");
            //   favouritesRecipes.push({"name" : itemProps[0], "recipe_id":itemProps[1],"image_url":itemProps[2]});
            // })
            // setUsername(json.name)
            // setSavedRecipes(favouritesRecipes)
            
            
  //       } catch (error) {
  //           console.error('API Error:', error);
  //       } 
  //       };
      
  //         fetchData();

  //     // Optional: return cleanup function
  //     return () => {
        
  //     };
  //   }, []) // You can add dependencies here if needed
  // );


  //sdsfsd
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
  
const loadCards = async () => {
    try {
      const favourites = await AsyncStorage.getItem('favourites');
      if (favourites) {
        setSavedRecipes(JSON.parse(favourites));
      }
      

      const url = new URL(`${USER_URL}`);
    
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {"email":"dwilson@company.net"}
      });
      const json = await response.json();
      let favouritesRecipes = []
      if (json.favourites == null){
        setUsername(json.name);
        return;
      }

      let recipes = json.favourites.split(",");
      recipes.map((item) =>{
        const itemProps = item.split(":");
        favouritesRecipes.push({"name" : itemProps[0], "recipe_id":itemProps[1],"image_url":itemProps[2]});
      })
      setUsername(json.name)
      setSavedRecipes(favouritesRecipes)
      
      AsyncStorage.setItem('favourites', JSON.stringify(favouritesRecipes));

    } catch (error) {

    }
  };
  //sdfdsf

  

  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => {
        
        router.push({
            pathname: '/explore/recipe',
            params: { 
              recipeId: item.recipe_id,
            }
          });
        
      }}>
      <Image source={{ uri: bucketUrl + item.image_url}} style={styles.recipeImage} />
      <View style={styles.recipeOverlay}>
        <View style={styles.recipeContent}>
          <Text style={styles.recipeTitle}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{username}</Text>
              
            </View>
            <TouchableOpacity onPress={() => {
                logout();
                router.replace('/login');
              }}>
               <LogOut size={20} color="#FF3B30" />

              </TouchableOpacity>
          </View>
        </View>

        {savedRecipes.length > 0 && (
          <View style={styles.savedRecipesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Recipes</Text>
              {/* <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity> */}
            </View>
            <FlatList
              data={savedRecipes}
              renderItem={renderRecipeCard}
              keyExtractor={(item) => item.recipe_id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipeList}
            />
          </View>
        )}


      <View style={styles.section}>
        <SuggestionSection />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
      
    </SafeAreaView>
  );
}

const SuggestionSection = () => {
  const [suggestion, setSuggestion] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  

  const handleSubmitSuggestion = async () => {
    if (!suggestion.trim()) {
      Alert.alert('Empty Suggestion', 'Please enter a suggestion before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert(
        'Thank You!', 
        'Your suggestion has been submitted successfully. We appreciate your feedback!',
        [
          {
            text: 'OK',
            onPress: () => setSuggestion('')
          }
        ]
      );
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <View style={[styles2.suggestionContainer]}>
      <View style={styles2.suggestionHeader}>
        <View style={styles2.suggestionIconContainer}>
          <MessageSquare size={20} color="#FF7E1D" />
        </View>
        <Text style={styles2.suggestionTitle}>Leave a Suggestion</Text>
      </View>
      
      <Text style={styles2.suggestionDescription}>
        Help us improve by sharing your thoughts and ideas
      </Text>
      
      <View style={styles2.inputContainer}>
        <TextInput
          style={styles2.suggestionInput}
          placeholder="Share your suggestion here..."
          placeholderTextColor="#999"
          value={suggestion}
          onChangeText={setSuggestion}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity
        style={[
          styles2.submitButton,
          isSubmitting && styles2.submitButtonDisabled,
          !suggestion.trim() && styles2.submitButtonDisabled
        ]}
        onPress={handleSubmitSuggestion}
        disabled={isSubmitting || !suggestion.trim()}
      >
        <Send size={18} color="#fff" style={styles2.submitIcon} />
        <Text style={styles2.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    flexDirection: "row",
    
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  savedRecipesSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF7E1D',
  },
  recipeList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  recipeCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dietaryItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '47%',
  },
  dietaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  dietaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
  },
  menuLabelDanger: {
    color: '#FF3B30',
  },
  version: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 24,
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
});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoIconContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
  suggestionContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIconContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  suggestionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  suggestionInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#e9ecef',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF7E1D',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});