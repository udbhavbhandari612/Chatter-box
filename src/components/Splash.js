import React, { Component } from 'react';
import { Text, StyleSheet, Image, ImageBackground, AsyncStorage,BackHandler } from 'react-native';
import auth from '@react-native-firebase/auth';
import FingerprintScanner from "react-native-fingerprint-scanner";

export class Splash extends Component {

    AuthenticateFingerprint = () => {

        FingerprintScanner.release();

        FingerprintScanner.authenticate({ description: "Verify fingerprint", title: 'Authentication' })
            .then(() => {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeDrawer' }]
                });
                this.props.navigation.navigate('HomeDrawer')
            })
            .catch((err) => {
                BackHandler.exitApp();
            })
            .finally(() => {
                FingerprintScanner.release();
            });
    }

    async componentDidMount() {
        const user = auth().currentUser;

        if (user) {
            var settings = await AsyncStorage.getItem("settings");
            settings = JSON.parse(settings);
            if (settings?.enableFingerprint) {
                this.AuthenticateFingerprint();
                return;
            }
        }

        this.props.navigation.reset({
            index: 0,
            routes: [{ name: user ? 'HomeDrawer' : 'Login' }]
        });
        this.props.navigation.navigate(user ? 'HomeDrawer' : 'Login')


    }



    render() {

        return (
            <ImageBackground style={styles.container}
                source={require('../assets/logo5.jpg')} resizeMethod='scale' resizeMode='cover'>

                <Text
                    style={{
                        position: 'absolute', bottom: 30,
                        fontSize: 22, color: 'rgba(66, 66, 66,0.85)', fontWeight: '700',
                        letterSpacing: 2.8
                    }}>
                    ChatterBox
                    </Text>
            </ImageBackground >

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})