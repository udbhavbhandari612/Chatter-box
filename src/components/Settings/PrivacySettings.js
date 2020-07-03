import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableNativeFeedback, ScrollView, Alert, Modal, TouchableHighlight, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class PrivacySettings extends Component {

    constructor() {
        super();
        this.state = {
            userSettings: {},
            modalVisible: false,
            currentMode: "",
            updating: false
        }
        this.settingConstants = {
            'e': 'Everyone',
            'm': 'My Contacts',
            'o': 'Only me',
        }
    }

    InitiatePrivacySettings = () => {
        const userSettings = {
            profilePicture: this.settingConstants.e,
            email: this.settingConstants.e,
            phoneNumber:this.settingConstants.e,
            about: this.settingConstants.e
        }
        firestore().collection('users').doc(auth().currentUser.uid)
            .collection('privacy').doc('settings').set({ ...userSettings }).then(res => {
                this.setState({ userSettings })
            })
            .catch(err => {
                Alert.alert('Settings Error', err.message);
            })
    }

    FetchUserSettings = () => {
        firestore().collection('users').doc(auth().currentUser.uid)
            .collection('privacy').doc('settings').get().then(res => {
                if (res.exists)
                    this.setState({ userSettings: { ...res.data() } });
                else
                    this.InitiatePrivacySettings();

            })
            .catch(err => {
                Alert.alert('Error while getting your settings', err.message);
            })
    }

    UpdatePrivacySettings = async (mode, setting) => {
        this.setState({ updating: true })
        var settings = Object.assign({}, this.state.userSettings);
        settings[mode] = setting;
        try {
            await firestore().collection('users')
                .doc(auth().currentUser.uid)
                .collection('privacy')
                .doc('settings')
                .set({ ...settings }, { merge: true })

            this.setState({
                userSettings: { ...settings },
                modalVisible: false,
                currentMode: "",
                updating: false
            })
        } catch (error) {
            this.setState({ updating: false })
            Alert.alert('Error while processing', error.message)
        }

    }

    OpenOptionsModal = (mode) => {
        this.setState({ modalVisible: true, currentMode: mode })
    }

    CloseOptionsModal = () => {
        this.setState({ modalVisible: false, currentMode: "" })
    }

    componentDidMount() {
        this.FetchUserSettings();
    }

    render() {
        return (
            <View >
                <View style={{ paddingVertical: 10, paddingHorizontal: 15, backgroundColor: 'lightgrey' }}>
                    <Text style={{ color: 'grey' }}>
                        Specify who can see your information
                        {"\n"+"NOTE: These settings won't be effective since the application is in Development"}
                    </Text>
                </View>
                <ScrollView>
                    <TouchableNativeFeedback onPress={() => this.OpenOptionsModal("profilePicture")} >
                        <View style={styles.Section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ ...styles.RobotoFont, fontSize: 17 }}>
                                    Profile Picture
                                </Text>
                                <Text style={{ color: 'grey' }}>
                                    {
                                        this.state.userSettings?.profilePicture
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback onPress={() => this.OpenOptionsModal("email")} >
                        <View style={styles.Section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                                <Text style={{ ...styles.RobotoFont, fontSize: 17 }}>
                                    Email
                                </Text>
                                <Text style={{ color: 'grey' }}>
                                    {
                                        this.state.userSettings?.email
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback onPress={() => this.OpenOptionsModal("phoneNumber")} >
                        <View style={styles.Section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                                <Text style={{ ...styles.RobotoFont, fontSize: 17 }}>
                                    Phone Number
                                </Text>
                                <Text style={{ color: 'grey' }}>
                                    {
                                        this.state.userSettings?.phoneNumber
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>


                    <TouchableNativeFeedback onPress={() => this.OpenOptionsModal("about")} >
                        <View style={styles.Section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                                <Text style={{ ...styles.RobotoFont, fontSize: 17 }}>
                                    About
                                </Text>
                                <Text style={{ color: 'grey' }}>
                                    {
                                        this.state.userSettings?.about
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>

                </ScrollView>

                <Modal onRequestClose={() => this.CloseOptionsModal()}
                    visible={this.state.modalVisible} animationType='slide' transparent={true}>
                    <TouchableHighlight underlayColor={'rgba(0,0,0,0.3)'}
                        onPress={() => this.CloseOptionsModal()} style={styles.modal}>
                        <View style={styles.modalContainer}>

                            <TouchableNativeFeedback disabled={this.state.userSettings[this.state.currentMode] == this.settingConstants.e}
                                onPress={() => this.UpdatePrivacySettings(this.state.currentMode, this.settingConstants.e)}>
                                <View style={styles.modalItem}>
                                    <FontAwesome name="globe" size={25} color={this.state.userSettings[this.state.currentMode] == this.settingConstants.e ? 'green' : 'grey'} style={styles.modalIcons} />
                                    <Text style={styles.modalText}>{this.settingConstants.e}</Text>

                                    {
                                        this.state.userSettings[this.state.currentMode] == this.settingConstants.e
                                        &&
                                        <View style={{ alignItems: 'flex-end', flex: 1, paddingRight: "10%" }}>
                                            <FontAwesome name="check" size={25} style={{ color: 'green' }} />
                                        </View>
                                    }

                                </View>
                            </TouchableNativeFeedback>

                            <View style={styles.divider} />

                            <TouchableNativeFeedback disabled={this.state.userSettings[this.state.currentMode] == this.settingConstants.m}
                                onPress={() => this.UpdatePrivacySettings(this.state.currentMode, this.settingConstants.m)}>
                                <View style={styles.modalItem}>
                                    <MaterialIcons name="contacts" size={25} color={this.state.userSettings[this.state.currentMode] == this.settingConstants.m ? 'green' : 'grey'} style={styles.modalIcons} />
                                    <Text style={styles.modalText}>{this.settingConstants.m}</Text>

                                    {
                                        this.state.userSettings[this.state.currentMode] == this.settingConstants.m
                                        &&
                                        <View style={{ alignItems: 'flex-end', flex: 1, paddingRight: "10%" }}>
                                            <FontAwesome name="check" size={25} style={{ color: 'green' }} />
                                        </View>
                                    }

                                </View>
                            </TouchableNativeFeedback>

                            <View style={styles.divider} />

                            <TouchableNativeFeedback disabled={this.state.userSettings[this.state.currentMode] == this.settingConstants.o}
                                onPress={() => this.UpdatePrivacySettings(this.state.currentMode, this.settingConstants.o)}>
                                <View style={styles.modalItem}>
                                    <MaterialIcons name="lock" size={25} color={this.state.userSettings[this.state.currentMode] == this.settingConstants.o ? 'green' : 'grey'} style={styles.modalIcons} />
                                    <Text style={styles.modalText}>{this.settingConstants.o}</Text>

                                    {
                                        this.state.userSettings[this.state.currentMode] == this.settingConstants.o
                                        &&
                                        <View style={{ alignItems: 'flex-end', flex: 1, paddingRight: "10%" }}>
                                            <FontAwesome name="check" size={25} style={{ color: 'green' }} />
                                        </View>
                                    }

                                </View>

                            </TouchableNativeFeedback>

                            <View style={styles.divider} />

                            {this.state.updating &&
                                <ActivityIndicator size="large" style={{ position: 'absolute', left: "50%", top: "50%" }} />
                            }
                        </View>
                    </TouchableHighlight>
                </Modal>

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
    modal: {
        height: "100%",
        width: "100%",
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',

    },
    modalContainer: {
        backgroundColor: 'white',
        paddingBottom: 50,

    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20,

    },
    divider: {
        borderBottomWidth: 0.8,
        borderColor: 'lightgrey',
        marginHorizontal: '10%'
    },
    modalIcons: {
        paddingHorizontal: 20
    },
    modalText: {
        fontSize: 16,
        fontFamily: 'Roboto',
    },

})