import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View, Image } from 'react-native';
import { ListItem, Root } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import auth from '@react-native-firebase/auth';

import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


import { Login } from './src/components/login';
import { Home } from './src/components/home';
import { Register } from './src/components/register';
import { Splash } from './src/components/Splash';
import { Chat } from './src/components/Chat';
import { Contacts } from './src/components/contacts';
import DrawerContent from './src/components/DrawerContent';
import MyProfile from './src/components/MyProfile';
import Profile from './src/components/Profile';
import ImageViewer from './src/components/ImageViewer';
import Settings from './src/components/Settings/Settings';
import PrivacySettings from './src/components/Settings/PrivacySettings';


const Stack = createStackNavigator();
const HomeStack = createStackNavigator();
const SettingsStack =createStackNavigator();
const Tab = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();

export default class App extends Component {


  componentDidMount() {


  }


  render() {

    const specs = {
      open: {
        animation: 'spring',
        config: {
          bounciness: 1, delay: 0
        }
      }
      , close: {
        animation: 'spring',
        config: {
          bounciness: 1, delay: 0
        }
      }
    }

    const headerStyle = {
      backgroundColor: '#2c3e50',
    };
    const headerTintColor = 'rgba(250, 250, 250,0.9)';
    const ChatIcon = ({ color }) => (<Icon name='chat' color={color} size={22} />)
    const ContactsIcon = ({ color }) => (<Icon name='contacts' color={color} size={22} />)

    function LeftHeader() {
      return (
        <View style={{ marginLeft: 12 }} >
          <Image source={require('./src/assets/icon.png')} style={{ width: 35, height: 35 }} />
        </View>
      )
    }

    function RightHeader({ props }) {
      return (

        auth().currentUser.photoURL
          ?
          <ListItem style={{ marginLeft: 0, paddingRight: 10, maxHeight: 55 }} noBorder onPress={() => props.openDrawer()}>
            <Image resizeMode='cover' source={{ uri: auth().currentUser.photoURL }} style={{ width: 40, height: 40, borderColor: headerTintColor, borderWidth: 2 }} borderRadius={20} />
          </ListItem>
          :
          <ListItem onPress={() => props.openDrawer()}>
            <FontAwesome5 name='user-circle'
              color={headerTintColor} size={30} />

          </ListItem>

      )
    }

    function MyTabs() {
      return (
        <Tab.Navigator tabBarOptions={{ showIcon: true, tabStyle: { flexDirection: 'row', backgroundColor: 'rgba(189, 189, 189,0.2)' } }}>
          <Tab.Screen name="Chats" component={Home} options={{ tabBarIcon: (props) => <ChatIcon color={props.focused ? 'rgba(1, 87, 155,1.0)' : 'black'} /> }} />
          <Tab.Screen name="Contacts" component={Contacts} options={{ tabBarIcon: (props) => <ContactsIcon color={props.focused ? 'rgba(1, 87, 155,1.0)' : 'black'} /> }} />
        </Tab.Navigator>
      );
    }

    function HomeStackNavigator() {
      return (
        <HomeStack.Navigator screenOptions={{ transitionSpec: specs, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerStyle: headerStyle, headerTintColor: headerTintColor }}>
          <HomeStack.Screen name='HomeStack' component={MyTabs} options={({ navigation }) => { return { title: 'Chatter Box', headerLeft: () => <LeftHeader />, headerRight: () => <RightHeader props={navigation} />, headerTitleContainerStyle: { left: 53 } } }} />
        </HomeStack.Navigator>
      )
    }

    function SettingsStackNavigator() {
      return (
        <SettingsStack.Navigator screenOptions={{ transitionSpec: specs, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerStyle: headerStyle, headerTintColor: headerTintColor }}>
          <Stack.Screen name="SettingsHome" component={Settings} options={{title:"Settings"}}  />
          <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{title:"Privacy Settings"}} />
        </SettingsStack.Navigator>
      )
    }

    function MyDrawer() {
      return (
        <Drawer.Navigator initialRouteName='HomeStack' drawerPosition='right' drawerContent={(props) => { return <DrawerContent props={props} /> }}>
          <Drawer.Screen name='HomeStack' component={HomeStackNavigator} />
        </Drawer.Navigator>
      )
    }

    return (
      <Root>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Splash' screenOptions={{ transitionSpec: specs, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerStyle: headerStyle, headerTintColor: headerTintColor }}>
            <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
            <Stack.Screen name='HomeDrawer' component={MyDrawer} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsStackNavigator} options={{ headerShown: false }}/>
            <Stack.Screen name="ImageViewer" component={ImageViewer} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </Root>
    )
  }
}