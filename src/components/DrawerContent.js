import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MatComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator } from 'react-native-paper';


const DrawerContent = ({ props }) => {
    const [isLoggingOut, setLoggingOut] = useState(false);

    const logout = () => {
        setLoggingOut(true);
        auth().signOut().then(() => {
            setLoggingOut(false);
            props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
            props.navigation.navigate('Login');
        })
    }

    return (
        <View style={{ overflow: 'hidden' }}>

            <ImageBackground style={{ width: '100%', height: '100%' }} source={require('../assets/logo4.jpeg')} imageStyle={{opacity:0.5}} resizeMode='cover' resizeMethod='resize'  >

                <ImageBackground style={[styles.ProfileContainer]} imageStyle={{ opacity: 0.3, backgroundColor: 'white' }}
                    source={auth().currentUser?.photoURL ? { uri: auth().currentUser.photoURL } : require('../assets/logo4.jpeg')} resizeMode='cover'>
                    <Image
                        source={auth().currentUser?.photoURL ? { uri: auth().currentUser.photoURL } : require('../assets/profileNotFound.png')} style={styles.ProfilePhoto} />
                    <Text style={[styles.ProfileName, styles.FontFamily]}>{auth().currentUser?.displayName}</Text>
                    <Text style={[styles.ProfileEmail, styles.FontFamily]}>{auth().currentUser?.email}</Text>
                </ImageBackground>

                <View style={{ 
                    flex: 1, backgroundColor: 'rgba(245, 245, 245,0.6)',paddingTop:10,borderTopRightRadius:100 ,
                    overflow:'hidden'
                    }}>

                    <TouchableHighlight underlayColor='rgba(144, 164, 174,0.4)' onPress={() => {

                        props.navigation.navigate('MyProfile');
                        props.navigation.closeDrawer();
                    }}>
                        <View style={styles.DrawerItems} >
                            <FontAwesome5 name='user-alt' size={23} color='rgba(56, 142, 60,1.0)' />
                            <View style={{marginLeft: 8}}>
                                <Text style={styles.DrawerItemsText}> My Profile</Text>
                                <Text style={styles.DrawerItemsSubText}> Manage profile, username and more</Text>
                            </View>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(144, 164, 174,0.4)' onPress={() => {
                        props.navigation.navigate('Settings');
                        props.navigation.closeDrawer();
                    }}>
                        <View style={styles.DrawerItems}>
                            <Icon name='settings' size={28} color='#607D8B' />
                            <View style={{marginLeft: 8}}>
                                <Text style={styles.DrawerItemsText}>Settings</Text>
                                <Text style={styles.DrawerItemsSubText}>Application related settings</Text>
                            </View>
                        </View>
                    </TouchableHighlight>

                </View>

                <TouchableHighlight onPress={logout} underlayColor='rgba(255, 205, 210,1.0)'
                    style={{ backgroundColor: 'rgba(245, 245, 245,0.8)',borderBottomLeftRadius:50, borderTopWidth: 0.6, borderTopColor: 'rgba(207, 216, 220,1.0)' }} >
                    <View style={[styles.DrawerItems, { justifyContent: 'center' }]}>
                        <MatComIcon name='logout' size={25} color='rgba(198, 40, 40,0.9)' />
                        <Text style={[styles.DrawerItemsText, { letterSpacing: 0.8 }]}>Logout</Text>
                    </View>
                </TouchableHighlight>

            </ImageBackground>

            {isLoggingOut &&
                <View style={styles.loggingOut}>
                    <ActivityIndicator size='large' color='white'/>
            </View>
            }
        </View >
    )
}

const styles = StyleSheet.create({
    DrawerItems: {
        paddingHorizontal: 10,
        paddingVertical: 17,
        borderBottomWidth: 0.6,
        borderBottomColor: 'rgba(207, 216, 220,1.0)',
        flexDirection: 'row',
        alignItems:'center',
        
        // borderBottomEndRadius:30,
        // borderBottomLeftRadius:40,

    },
    DrawerItemsText: {
        fontFamily: 'sans-serif-medium',
        fontSize: 15,
    },
    DrawerItemsSubText: {
        fontFamily: 'sans-serif-medium',
        fontSize: 13,
        color:'grey'
    },
    ProfileContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
        elevation: 2,
        backgroundColor: 'rgba(97, 97, 97,0.3)',
        
    },
    ProfilePhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderColor: 'white',
        borderWidth: 2,

    },
    ProfileName: {
        fontSize: 25,
        paddingTop: 5,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(96, 125, 139,1.0)',
        letterSpacing: 1.5,
        color: 'rgba(33, 33, 33,0.8)',
        textTransform: 'uppercase',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        textAlign: 'center',
    },
    ProfileEmail: {
        fontSize: 15,
        paddingTop: 5,
        letterSpacing: 0.5,
        color: 'rgba(33, 33, 33,0.8)',
    },
    FontFamily: {
        fontFamily: 'sans-serif-medium',
    },
    loggingOut:{
        position:'absolute',
        flex:1,
        height:'100%',
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0,0,0,0.5)'
    },
})

export default DrawerContent;
