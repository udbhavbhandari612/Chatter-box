import React, { Component } from 'react';
import {
    Text, View, Modal, Image, StyleSheet,
    ImageBackground,
    ScrollView,
    ActivityIndicator, Dimensions, Keyboard, TouchableWithoutFeedback, Alert
} from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageCropPicker from 'react-native-image-crop-picker';
import { ListItem, Item, Toast } from 'native-base';
import CustomInput from './customs/CustomInput';




export default class MyProfile extends Component {


    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            userData: auth().currentUser.toJSON(),
            about: '',
            staticAbout: '',
            isLoadingProfile: false,
            screenWidth: Dimensions.get('window').width,
            formDirty: false,
            isUpdatingDetails: false,
        }
        

    }


    BackButton = () => {
        return (
            <View style={{ zIndex: 1, position: 'absolute', left: 0, top: 10, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableRipple borderless={true} style={styles.BackButtonContainer} onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Icon name='arrow-back' color='black' style={styles.BackButtonIcon} size={30} />
                </TouchableRipple>
                <Text style={{ color: 'white', fontFamily: 'sans-serif-medium', letterSpacing: 0.7, left: -10, fontSize: 20 }}>
                    Profile
                    </Text>
            </View>
        )
    }

    async RemoveProfilePhoto() {
        this.setState({ isLoadingProfile: true, modalVisible: false });
        try {
            const ref = 'userProfiles/' + auth().currentUser.uid;
            await storage().ref(ref).delete();
            await auth().currentUser.updateProfile({ photoURL: null });
            await firestore().collection('users').doc(auth().currentUser.uid).set(auth().currentUser.toJSON());
            this.setState({
                isLoadingProfile: false,
                userData: auth().currentUser.toJSON()
            });
        } catch (error) {
            alert('Error occured: ' + error.message);
            this.setState({ isLoadingProfile: false });
        }
    }

    async UploadProfilePhoto() {
        this.setState({ isLoadingProfile: true, modalVisible: false })
        await ImageCropPicker.clean();

        ImageCropPicker.openPicker({
            mediaType: 'photo',
            width: 700, height: 700,
            cropperCircleOverlay: true,
            cropping: true
        })
            .then(async (response) => {
                const result = await fetch(response.path);
                const blob = await result.blob();
                const ref = 'userProfiles/' + auth().currentUser.uid;
                await storage().ref(ref).put(blob);
                const url = await storage().ref(ref).getDownloadURL();
                await auth().currentUser.updateProfile({ photoURL: url });
                await auth().currentUser.reload();
                await firestore().collection('users').doc(auth().currentUser.uid).set(auth().currentUser.toJSON(), { merge: true });
                this.setState({
                    isLoadingProfile: false,
                    userData: auth().currentUser.toJSON()
                })
            })
            .catch(error => {
                console.log(error);
                this.setState({ isLoadingProfile: false });
            });

    }

    Modal1 = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                onRequestClose={() => { this.setState({ modalVisible: false }) }}
                visible={this.state.modalVisible}
            >
                <Item style={modalStyles.centeredView} >

                    <View style={modalStyles.modalView} >
                        <ListItem noBorder disabled={!this.state.userData.photoURL} style={modalStyles.link} onPress={() => { this.RemoveProfilePhoto() }}>
                            <Icon name='delete'
                                style={[modalStyles.linkIcon, { backgroundColor: 'rgba(229, 57, 53,0.9)' }]} size={28} />
                            <Text style={modalStyles.linkText}>Remove Photo</Text>
                        </ListItem>

                        <ListItem noBorder style={modalStyles.link} onPress={() => { this.UploadProfilePhoto() }}>
                            <Icon name='photo-library'
                                style={[modalStyles.linkIcon, { backgroundColor: 'rgba(30, 136, 229,0.9)' }]} size={28} />
                            <Text style={modalStyles.linkText}>Select from Gallery </Text>
                        </ListItem>

                        <ListItem style={{ justifyContent: 'center' }} noBorder
                            onPress={() => this.setState({ modalVisible: false })}>
                            <Text style={{ color: 'grey' }}>cancel</Text>
                        </ListItem>
                    </View>

                </Item>
            </Modal >

        )

    }

    ProfilePhotoContainer = () => {

        return (
            <View style={[styles.ProfilePhotoContainer]}>
                {
                    this.state.isLoadingProfile
                        ?
                        <ActivityIndicator color="white" size='large'
                            style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                        :
                        <Image source={this.state.userData.photoURL
                            ? { uri: this.state.userData.photoURL }
                            : require('../assets/profileNotFound.png')}
                            style={{ height: 200, width: 200, borderRadius: 100 }}
                        />
                }


                <TouchableRipple borderless={true} disabled={this.state.isLoadingProfile}
                    onPress={() => { this.setState({ modalVisible: true }) }}
                    style={{
                        bottom: 80, left: 120, padding: 10, alignItems: 'center', justifyContent: 'center',
                        width: 100, height: 100, borderRadius: 50
                    }}>
                    <Icon name='edit' size={30}
                        style={{
                            textAlignVertical: 'center', textAlign: 'center', color: 'white',
                            height: 58, width: 58, backgroundColor: 'rgba(33, 33, 33,0.9)', borderRadius: 29,
                        }} />
                </TouchableRipple>
            </View>
        )
    }

    HandleNonVerifiedEmail = () => {
        var buttons = [
            { text: "cancel" },
            {
                text: "Send", onPress: async () => {
                    try {
                        await auth().currentUser.sendEmailVerification();
                        Toast.show({
                            text:"Verification link has been sent to your email",
                            duration:2000,
                            position:'bottom',
                            type:'success',
                            style:{bottom:100,marginHorizontal:"15%",borderRadius:10}
                        })
                    } catch (error) {
                        Toast.show({
                            text:error.message,
                            duration:2000,
                            position:'bottom',
                            type:'danger',
                            style:{bottom:100,marginHorizontal:"15%",borderRadius:10}
                        })   
                    }
                }
            },
        ]
        if (!auth().currentUser.emailVerified) {
            Alert.alert("Your Email is not verified", "Would you like to send verification link to your email?", buttons)
        }
        else{
            Toast.show({
                text:"Your email is verified",
                duration:2000,
                position:'bottom',
                type:'success',
                style:{bottom:100,marginHorizontal:"15%",borderRadius:10}
            })
        }
    }

    DetailsContainer = () => {
        return (

            <View style={styles.DetailsContainer}>

                <CustomInput
                    value={this.state.userData.displayName}
                    label="Username"
                    lefticon={true}
                    icon='user-circle-o'
                    maxLength={20}
                    helperText="Username can only be upto 20 characters"
                    placeholder='Username'
                    iconSize={27}
                    icontype={'FA'}
                    righticon={{
                        righticontype: 'MCI',
                        righticon: 'circle-edit-outline',
                        righticonsize: 22,

                    }}
                    rightIconStyle={{ color: "rgba(66, 66, 66,0.7)" }}
                    style={[styles.ItemContainer, { backgroundColor: 'white' }]}
                    onChangeText={(text) => this.setState((state) => {
                        const filter = state.about ? state.about.trim() : undefined
                        if (text.trim() != auth().currentUser.displayName.trim() ||
                            filter != state.staticAbout?.trim())
                            state.formDirty = true;
                        else
                            state.formDirty = false;
                        state.userData.displayName = text;
                        return state;
                    })
                    }
                />

                <CustomInput
                    value={this.state.about}
                    label="About you"
                    lefticon={true}
                    icon='information'
                    maxLength={100}
                    helperText="Upto 100 characters"
                    placeholder='Write something about yourself'
                    iconSize={25}
                    icontype={'MCI'}
                    multiline={true}
                    righticon={{
                        righticontype: 'MCI',
                        righticon: 'circle-edit-outline',
                        righticonsize: 22,

                    }}
                    rightIconStyle={{ color: "rgba(66, 66, 66,0.7)" }}
                    style={[styles.ItemContainer, { backgroundColor: 'white' }]}
                    onChangeText={(text) => this.setState((state) => {
                        const filter = text ? text.trim() : undefined
                        if (filter != state.staticAbout?.trim() ||
                            state.userData.displayName?.trim() != auth().currentUser.displayName.trim())
                            state.formDirty = true;
                        else
                            state.formDirty = false;
                        state.about = text ? text : undefined;
                        return state;
                    })
                    }
                />

                <CustomInput
                    value={this.state.userData.email}
                    label="Email"
                    lefticon={true}
                    icon='mail'
                    icontype={"MI"}
                    iconSize={27}
                    righticon={{
                        righticontype: 'MCI',
                        righticon: auth().currentUser.emailVerified ? 'checkbox-marked-circle-outline' : 'alert-circle-outline',
                        righticonsize: 22,

                    }}
                    onRightIconPress={() => this.HandleNonVerifiedEmail()}
                    rightIconStyle={{ color: auth().currentUser.emailVerified ? 'rgba(46, 125, 50,1.0)' : '#EF5350' }}
                    // righticontextStyle={{ fontSize: 12, color: auth().currentUser.emailVerified ? 'green' : '#EF5350' }}
                    error={auth().currentUser.emailVerified || "email is not verified."}
                    editable={false}
                    selection={{ start: 0, end: 4 }}
                    style={[styles.ItemContainer, { backgroundColor: 'white' }]}
                />

                <CustomInput
                    value={new Date(this.state.userData.metadata.creationTime).toDateString()}
                    label="Joined on"
                    lefticon={true}
                    icon='date-range'
                    icontype={"MI"}
                    iconSize={27}
                    editable={false}
                    style={[styles.ItemContainer, { backgroundColor: 'white' }]}

                />

            </View>

        )
    }

    SaveButton = () => {
        return (
            <TouchableRipple borderless
                disabled={this.state.isUpdatingDetails}
                onPress={() => { this.SaveData() }}
                style={{
                    position: 'absolute', right: 30, top: 300, borderRadius: 10, elevation: 3, zIndex: 1,
                    padding: 10, backgroundColor: 'rgba(85, 139, 47,1.0)',
                    borderRadius: 10
                }}
            >
                {
                    this.state.isUpdatingDetails
                        ?
                        <ActivityIndicator color="white" style={{ width: 70 }} />
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name='check-circle' size={25} color="white" />
                            <Text style={{
                                fontSize: 17, fontWeight: '700', marginHorizontal: 8, color: 'white'
                            }}>{"Save "}</Text>
                        </View>
                }
            </TouchableRipple>
        )
    }

    async SaveData() {
        Keyboard.dismiss();
        this.setState({ isUpdatingDetails: true })
        var userdata = auth().currentUser.toJSON();
        var changeFlag = false;
        try {
            if (this.state.userData.displayName.trim() != auth().currentUser.displayName) {
                await auth().currentUser.updateProfile({ displayName: this.state.userData.displayName });
                this.setState({ userData: auth().currentUser.toJSON() })
                userdata = auth().currentUser.toJSON();
                changeFlag = true;
            }
            if (this.state.about != this.state.staticAbout) {
                userdata.about = this.state.about;
                this.setState({ staticAbout: this.state.about });
                changeFlag = true;
            }
            if (changeFlag) {
                await firestore().collection('users').doc(auth().currentUser.uid).set(userdata, { merge: true });
                this.setState({ formDirty: false })
            }
            this.setState({ isUpdatingDetails: false })
        } catch (error) {
            this.setState({ isUpdatingDetails: false })
            alert(error.message)
            console.log(error)
        }

    }

    async componentDidMount() {
        await auth().currentUser.reload();
        firestore().collection('users').doc(auth().currentUser.uid).get().then((data) => {
            const { about } = data.data();
            this.setState({ about: about, staticAbout: about });
        });

    }

    render() {

        return (

            <ScrollView keyboardShouldPersistTaps={'always'}
                style={{ flex: 1, zIndex: 1 }} keyboardDismissMode={'on-drag'}>


                <ImageBackground style={[styles.topBackground, { opacity: 1 }]}
                    imageStyle={{ opacity: 0.4 }}
                    resizeMethod='resize' resizeMode='cover'
                    source={
                        this.state.userData.photoURL
                            ? { uri: this.state.userData.photoURL }
                            : require('../assets/logo4.jpeg')
                    } />

                <this.ProfilePhotoContainer />


                <this.DetailsContainer />

                {/* footer */}
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                    <Text style={{ color: 'grey', fontSize: 16, letterSpacing: 0.8 }}>{"Chatterbox \u00A9" + new Date().getFullYear().toString()}</Text>
                </View>

                {
                    this.state.formDirty &&
                    <this.SaveButton />
                }
                {/* absolute components */}
                <this.BackButton />
                <this.Modal1 />
                {/* absolute components */}

            </ScrollView >

        )
    }
}

const modalStyles = StyleSheet.create({
    centeredView: {

        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: "center",
        alignItems: 'center',
        marginTop: 0
    },
    modalView: {
        margin: 20,
        overflow: 'hidden',
        backgroundColor: "white",
        borderRadius: 10,
        paddingVertical: 15,
        elevation: 5
    },
    link: {
        marginHorizontal: 20,

    },
    linkText: {
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 10

    },
    linkIcon: {
        color: 'white',
        borderRadius: 28,
        padding: 8
    },
})

const styles = StyleSheet.create({
    topBackground: {
        overflow: 'hidden',
        position: 'absolute',
        width: '100%',
        height: 290,
        backgroundColor: 'rgba(30, 136, 229,0.7)',
        borderBottomRightRadius: 230,

    },
    BackButtonContainer: {
        padding: 10,
        borderRadius: 40
    },
    BackButtonIcon: {
        backgroundColor: 'rgba(117, 117, 117,0)',
        color: 'white',
        borderRadius: 30,
        padding: 10,

    },
    ProfilePhotoContainer: {
        top: 140,
        paddingHorizontal: 10,

        width: 220,
        height: 200
    },
    DetailsContainer: {
        zIndex: 1,
        top: 150,
        overflow: 'scroll',
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 30,
        width: '100%',
        minHeight: 600,


        borderRadius: 10
    },
    ItemContainer: {
        marginVertical: 10,
        padding: 10,
        elevation: 1,
        borderRadius: 10
    },
})
