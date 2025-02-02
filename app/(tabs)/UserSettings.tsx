import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Animated, ScrollView, PanResponder, useColorScheme, SafeAreaView, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { IconSymbol } from '@/components/ui/IconSymbol';

const UserSettings = () => {
  const [isNotificationEnabled, setNotificationEnabled] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPermissionMessage, setShowPermissionMessage] = useState(false);
  const [isMobileDataUsageEnabled, setMobileDataUsageEnabled] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerHeight] = useState(new Animated.Value(0)); 
  const [drawerY] = useState(new Animated.Value(0)); 
  const [pushToken, setPushToken] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const showDrawer = () => {
    setDrawerVisible(true);
    Animated.spring(drawerHeight, {
      toValue: 500, 
      useNativeDriver: false,
    }).start();
  };

  const hideDrawer = async () => {

    await new Promise((resolve) =>
      Animated.spring(drawerHeight, {
        toValue: 0, 
        useNativeDriver: false,
      }).start(resolve)
    );

    await new Promise((resolve) =>
      Animated.spring(drawerY, {
        toValue: 0, 
        useNativeDriver: false,
      }).start(resolve)
    );

    setDrawerVisible(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0) {
        drawerY.setValue(gestureState.dy); 
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy > 150) {
        hideDrawer(); 
      } else {
        Animated.spring(drawerY, {
          toValue: 0, 
          useNativeDriver: false,
        }).start();
      }
    },
  });

  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync(); 
      if (status !== 'granted') {
        setPermissionDenied(true);
      } else {
        setNotificationEnabled(true);
      }
    };
    checkPermission();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync(); 
      if (status === 'granted') {
        setNotificationEnabled(true);
        setPermissionDenied(false);
      } else {
        setNotificationEnabled(false);
        setPermissionDenied(true);
        setShowPermissionMessage(true);

        setTimeout(() => setShowPermissionMessage(false), 3000);
      }
    } else {
      setNotificationEnabled(false);
    }
  };

  const handleTestNotification = () => {
    if (isNotificationEnabled) {

      Alert.alert('Notification', 'This is an example notification!');
    }
  };

  const getPushToken = async () => {
    try {
      const { data } = await Notifications.getExpoPushTokenAsync();
      setPushToken(data);  
      console.log("Expo Push Token:", data);  
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {}
        <TouchableOpacity style={styles.userProfile} onPress={showDrawer}>
          <View style={styles.userIconContainer}>
            <IconSymbol name="profile" size={40} color="#fff" style={styles.userIcon} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>User Name</Text>
            <Text style={styles.userAccount}>Account Settings</Text>
          </View>
        </TouchableOpacity>

        {}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Notifications</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Push Notifications</Text>
          <Switch
            value={isNotificationEnabled}
            onValueChange={handleNotificationToggle}
            disabled={permissionDenied}
          />
        </View>

        {showPermissionMessage && permissionDenied && (
          <Text style={styles.permissionMessage}>Need Permission to Send Push Notifications</Text>
        )}

        {isNotificationEnabled && !permissionDenied && (
          <View style={styles.exampleNotificationContainer}>
            <Text style={styles.exampleNotificationLabel}>Example Notification</Text>
            <TouchableOpacity onPress={handleTestNotification} style={styles.testNotificationButton}>
              <Text style={styles.testNotificationButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>
        )}

        {}
        <TouchableOpacity onPress={getPushToken} style={styles.pushTokenButton}>
          <Text style={styles.pushTokenButtonText}>Get Push Token</Text>
        </TouchableOpacity>

        {pushToken && (
          <View style={styles.pushTokenContainer}>
            <Text style={styles.pushTokenText}>Push Token: {pushToken}</Text>
          </View>
        )}

        
        {}
        {drawerVisible && (
          <Animated.View
            {...panResponder.panHandlers} 
            style={[styles.drawerContainer, { height: drawerHeight, transform: [{ translateY: drawerY }] }]}
          >
            <TouchableOpacity style={styles.closeButton} onPress={hideDrawer}>
              <IconSymbol name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.drawerTitle}>Account Options</Text>
            {}
            <ScrollView
              contentContainerStyle={styles.drawerContent} 
            >
              <Text style={styles.drawerOption}>Change Email</Text>
              <Text style={styles.drawerOption}>Change Password</Text>
              <Text style={styles.drawerOption}>Sign Out</Text>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colorScheme) => {
  return StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    userProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#ccc',
    },
    userIconContainer: {
      backgroundColor: colorScheme === 'dark' ? '#444' : '#ddd',
      borderRadius: 20,
      padding: 10,
      marginRight: 15,
    },
    userIcon: {
      alignSelf: 'center',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 18,
      fontWeight: 'bold',
    },
    userAccount: {
      color: colorScheme === 'dark' ? '#888' : '#555',
      fontSize: 14,
    },
    sectionHeaderContainer: {
      marginTop: 20,
      marginBottom: 10,
    },
    sectionHeader: {
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#ccc',
    },
    settingLabel: {
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    permissionMessage: {
      color: 'red',
      fontSize: 14,
      marginTop: 10,
    },
    exampleNotificationContainer: {
      marginTop: 20,
    },
    exampleNotificationLabel: {
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
      marginBottom: 10,
    },
    testNotificationButton: {
      backgroundColor: '#007BFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    testNotificationButtonText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
    },
    pushTokenButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 20,
    },
    pushTokenButtonText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
    },
    pushTokenContainer: {
      marginTop: 10,
      padding: 10,
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f1f1f1',
      borderRadius: 5,
    },
    pushTokenText: {
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 14,
    },
    signOutButton: {
      backgroundColor: '#FF5733',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 30,
    },
    signOutText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
    },
    drawerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: -4 },
      shadowRadius: 8,
    },
    closeButton: {
      alignSelf: 'flex-end',
      padding: 10,
    },
    drawerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    drawerContent: {
      alignItems: 'center',
    },
    drawerOption: {
      fontSize: 16,
      marginVertical: 10,
      color: colorScheme === 'dark' ? '#fff' : '#000',
    },
  });
};

export default UserSettings;