import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, LogOut, MessageSquare, Send, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const { logout, user, getValidAccessToken, getPnpAccessToken, setPnpAccessToken  } = useAuth();
  const [username, setUsername] = useState();
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  const router = useRouter();



  useFocusEffect(
      useCallback(() => {
        loadCards();
        if (getPnpAccessToken) {
          getPnpAccessToken().then((token) => {
            console.log("PNP Token on Profile:",token);
            setIsSignedIn(!!token);
          });
        }

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
      const authToken = await getValidAccessToken();
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {"email":user.email, "Authorization": authToken}
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
        favouritesRecipes.push({"name" : itemProps[0], "recipe_id":itemProps[1]});
      })
      setUsername(json.name)
      setSavedRecipes(favouritesRecipes)
      
      AsyncStorage.setItem('favourites', JSON.stringify(favouritesRecipes));

    } catch (error) {

    }
  };

  const closeModal = () => {
    setBasicModalVisible(false);
    setProfileName('');
    setPassword('');
    setShowPassword(false);
  };

  const handleLogin = () => {
     // Handle login logic here

    if(isSignedIn){
      console.log("Signing out");
      setPnpAccessToken("");
      setIsSignedIn(false);
      Alert.alert('Connected', 'Your Pick n Pay account has been disconnected successfully.');

    } else {
      console.log("Signing in");
      setPnpAccessToken("mocked_pnp_token");
      setIsSignedIn(true)
      Alert.alert('Connected', 'Your Pick n Pay account has been connected successfully.');
    }

     closeModal();
     
  }

  const signOutIn = () => {
    if (isSignedIn){
      console.log("Signing out");
      setPnpAccessToken("");
      setIsSignedIn(false);
      Alert.alert('Connected', 'Your Pick n Pay account has been disconnected successfully.');
      return
    } else {
      setBasicModalVisible(true);
    }
  
  }

  

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
      <Image source={{ uri: bucketUrl + item.recipe_id + ".jpg"}} style={styles.recipeImage} />
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
              <Text style={styles.profileName}>{user?.name}</Text>
              
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
        <TouchableOpacity
        style={styles2.pnpButton}
         onPress={() => signOutIn()}>
        <Send size={18} color="#fff" style={styles2.submitIcon} />
        <Text style={styles2.submitButtonText}>
          {isSignedIn ? "Sign out" : "Log into Pick n Pay"  }
        </Text>
      </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <SuggestionSection />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={basicModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles3.modalOverlay}>
          <View style={styles3.modalContainer}>

            <View style={styles3.headerRow}>
              <Text style={styles3.modalTitle}>Connect to Pick n Pay</Text>
              <TouchableOpacity
                style={styles3.closeButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles3.modalSubtitle}>
              Enter your Pick n Pay credentials to connect your account
            </Text>

            <View style={styles3.inputContainer}>
              <Text style={styles3.inputLabel}>Username or Email</Text>
              <TextInput
                style={styles3.textInput}
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Enter your username or email"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles3.inputContainer}>
              <Text style={styles3.inputLabel}>Password</Text>
              <View style={styles3.passwordContainer}>
                <TextInput
                  style={[styles3.textInput, styles3.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles3.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748b" strokeWidth={2} />
                  ) : (
                    <Eye size={20} color="#64748b" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles3.modalActions}>
              <TouchableOpacity
                style={styles3.cancelButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles3.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles3.cancelButton}
                
                onPress={handleLogin}
                activeOpacity={0.7}
                // disabled={isLoading}
              >
                <Text style={styles3.cancelButtonText}>
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
      
    </SafeAreaView>
  );
}

const SuggestionSection = () => {
  const [suggestion, setSuggestion] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user, getValidAccessToken  } = useAuth();
  

  const handleSubmitSuggestion = async () => {
    if (!suggestion.trim()) {
      Alert.alert('Empty Suggestion', 'Please enter a suggestion before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    const url = new URL(`${USER_URL}`);
    const authToken = await getValidAccessToken();
    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {"email":user.email, "Authorization": authToken},
      body : JSON.stringify({ "suggestion" : suggestion})
    });
    await response.json();
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
    setSuggestion("");
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
  pnpButton: {
    backgroundColor: '#12325cff',
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

const styles3 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#64748b',
  },
  profileDetails: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 12,
    flex: 1,
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  integrationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  integrationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  connectedCard: {
    borderColor: '#10b981',
    borderWidth: 1.5,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  integrationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    flex: 1,
  },
  integrationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#64748b',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalIconContainer: {
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  connectButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  // Terms and Conditions Styles
  termsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  termsList: {
    marginBottom: 16,
  },
  termsListItem: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 6,
  },
  termsFooter: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 40,
  },
});