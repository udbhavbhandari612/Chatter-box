import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, AsyncStorage, Alert, TouchableNativeFeedback, TouchableOpacity, TouchableHighlight } from 'react-native'
import { Switch, Toast } from 'native-base'
import FingerprintScanner from "react-native-fingerprint-scanner";
import Ionicon from "react-native-vector-icons/Ionicons";
import MatComIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default class Settings extends Component {

    constructor(props) {
        super(props);

        props.navigation.setOptions({
            headerLeft: this.BackButton,
            headerLeftContainerStyle: { left: 10 }
        });

        this.state = {
            settings: {},
            fingerprintSensorAvailable: false
        }

    }

    BackButton = () => {
        return (
            <TouchableHighlight 
            underlayColor={"rgba(0,0,0,0.4)"}
            style={{paddingHorizontal:15,paddingVertical:10,borderRadius:40}} 
            onPress={() =>this.props.navigation.goBack()}>
                <View>
                    <Ionicon name="md-arrow-back" size={25} color="white" />
                </View>
                </TouchableHighlight>
        )
    }

    AlertToast = (message, type = 'success') => {
        Toast.hide();
        Toast.show({
            text: message,
            duration: 2000,
            type: type,
            position: 'bottom',
            textStyle: { textAlign: 'center' },
            style: { bottom: 100, marginHorizontal: '10%', borderRadius: 10 }
        })
    }

    ToggleFingerprintLock = async (value) => {
        FingerprintScanner.release();
        FingerprintScanner.authenticate({ description: 'Verify to ' + (value ? 'Enable' : 'Disable') + ' fingerprint', title: 'Authentication', fallbackEnabled: false })
            .then(async () => {

                var setting = this.state.settings;
                setting.enableFingerprint = value;
                await AsyncStorage.setItem("settings", JSON.stringify(setting));
                const settings = await AsyncStorage.getItem("settings");
                this.setState({ ...JSON.parse(settings) });
                this.AlertToast("Fingerprint lock " + (value ? "Enabled" : "Disabled") + " successfully!");

            })
            .catch(err => {
                this.AlertToast("Authentication terminated ", "warning");
            })
            .finally(() => {
                FingerprintScanner.release();
                console.log('released')
            });

    }

    CheckFingerprintSensor = async () => {
        var sensorAvailable = false;
        await FingerprintScanner.isSensorAvailable()
            .then(res => {
                sensorAvailable = true;
            })
            .catch(err => {
                sensorAvailable = false;
                Alert.alert("Error with fingerprint scanner", err.message);
            })

        return sensorAvailable;

    }

    async componentDidMount() {

        const fingerprintSensorAvailable = await this.CheckFingerprintSensor();
        const settings = await AsyncStorage.getItem("settings");
        this.setState({
            settings: settings ? JSON.parse(settings) : {},
            fingerprintSensorAvailable
        });

    }

    render() {
        return (
            <View>
                <ScrollView>
                    <TouchableNativeFeedback onPress={() => { this.props.navigation.navigate('PrivacySettings') }} >
                        <View style={styles.Section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MatComIcons name='security' size={25} style={styles.Icons} />
                                <Text style={{ ...styles.RobotoFont, fontSize: 17 }}>
                                    Privacy settings
                        </Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>

                    <View style={styles.Section}>
                        <View style={styles.FingerprintSubSection}>
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicon name='md-finger-print' size={25} style={styles.Icons} />
                                <Text style={{ ...styles.RobotoFont, fontSize: 17 }}>
                                    {this.state.settings?.enableFingerprint ? "Disable " : "Enable "}
                            Fingerprint

                        </Text>
                            </View>
                            <Switch
                                disabled={!this.state.fingerprintSensorAvailable}
                                onValueChange={(value) => this.ToggleFingerprintLock(value)}
                                value={this.state.settings?.enableFingerprint}
                            />
                        </View>
                        {
                            !this.state.fingerprintSensorAvailable &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
                                <Ionicon name="ios-information-circle-outline" size={17} color='grey' />
                                <Text style={{ color: 'grey', marginLeft: 5 }}>
                                    Biometric sensors were not found in your device
                            </Text>
                            </View>
                        }
                    </View>

                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    Section: {
        paddingHorizontal: 15,
        paddingVertical: 25,
        borderBottomWidth: 0.8,
        borderColor: 'lightgrey'
    },
    FingerprintSubSection: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    RobotoFont: {
        fontFamily: 'Roboto'
    },
    Icons: {
        color: '#2E7D32',

        marginRight: 20
    }
})
