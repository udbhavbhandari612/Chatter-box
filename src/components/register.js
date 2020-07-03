import React, { Component } from 'react';
import {
    Text, TextInput, View, StyleSheet, Keyboard,
    TouchableOpacity, ImageBackground, Image, ActivityIndicator
} from 'react-native';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImageCropPicker from 'react-native-image-crop-picker';

export class Register extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fullName: '',
            email: '',
            password: '',
            confirmPssword: '',
            error: '',
            imageUri: null,
            isLoading: false,
            creatingAccount: false,

        }
    }

    register = async () => {
        Keyboard.dismiss();
        this.setState({ error: '' });
        if (this.state.password.trim().localeCompare(this.state.confirmPssword.trim()) != 0) {
            this.setState({ error: 'Passwords doesn\'t matched' })
            return;
        }
        if (this.state.email.trim().length == 0 ||
            this.state.password.trim().length == 0 ||
            this.state.fullName.trim().length == 0) {
            this.setState({ error: 'Please fill all the fields' })
            return;
        }
        if (!this.state.imageUri) {
            this.setState({ error: 'Please upload a profile picture' })
            return;
        }

        this.setState({ creatingAccount: true })

        auth().createUserWithEmailAndPassword(this.state.email.trim(), this.state.password.trim()).then(async user => {
            const ref = 'userProfiles/' + user.user.uid;
            const uri = await fetch(this.state.imageUri);
            const blob = await uri.blob();
            await storage().ref(ref).put(blob);
            const url = await storage().ref(ref).getDownloadURL();
            user.user.updateProfile({ displayName: this.state.fullName.trim(), photoURL: url }).then(() => {
                firestore().collection('users').doc(auth().currentUser.uid).set(auth().currentUser.toJSON()).then(() => {
                    auth().signOut().then(() => {
                        this.setState({ creatingAccount: false })
                        alert('Account created successfully!');
                        // this.props.navigation.navigate('Login');
                    });
                })
                    .catch(err => this.setState({ error: err.message, creatingAccount: false }));
            })
        }).catch(err => { this.setState({ error: err.message, creatingAccount: false }) })
    }

    pickImage = async () => {

        this.setState({ isLoading: true })
        await ImageCropPicker.clean();
        ImageCropPicker.openPicker({
            mediaType: 'photo',
            compressImageMaxHeight: 1000,
            compressImageMaxWidth: 1000,
            compressImageQuality: 0.8,
            width: 700, height: 700,
            cropperCircleOverlay: true,
            cropping:true
        }).then((response) => {
            console.log(response)
            const source = response.path;
            this.setState({
                imageUri: source,
            }, () => { this.setState({ isLoading: false }) });
        })
            .catch(error => {
                this.setState({ isLoading: false })
                console.log(error);
            });
    }

    componentDidMount() {
        
    }

    render() {

        return (
            <View style={styles.center}>
                <ImageBackground style={styles.background} source={require('../assets/background.jpg')}>
                    <View style={styles.form}>
                        <MatIcon name='create' style={styles.logo} size={60} />
                        <Text style={{ fontWeight: '700', marginTop: 40, fontSize: 17 }}>Create new account</Text>
                        {this.state.isLoading ?
                            <ActivityIndicator style={{ width: 120, height: 120 }} />
                            :
                            this.state.imageUri
                                ?
                                <View>
                                    <TouchableOpacity activeOpacity={0.5} onPress={() => { this.pickImage() }}>
                                        <Image source={{ uri: this.state.imageUri }} style={styles.profilePhoto} />
                                    </TouchableOpacity>
                                </View>
                                : <TouchableOpacity activeOpacity={0.5} onPress={() => { this.pickImage() }}
                                    style={styles.photoInput}>
                                    <MatIcon name='add-a-photo' color='grey' size={45} />
                                    <Text style={{ color: 'grey' }}>Upload profile photo</Text>

                                </TouchableOpacity>
                        }
                        <View style={styles.inputs}>
                            <Icon name={"user"} size={30} style={{ color: 'grey', paddingHorizontal: 8 }} />
                            <TextInput style={{ width: 234 }} onChangeText={(name) => { this.setState({ fullName: name }) }}
                                value={this.state.fullName} placeholder='Full Name' />
                        </View>
                        <View style={styles.inputs}>
                            <MatIcon name={"email"} size={30} style={{ color: 'grey', paddingHorizontal: 8 }} />
                            <TextInput style={{ width: 234 }} onChangeText={(email) => { this.setState({ email: email }) }}
                                value={this.state.email} keyboardType='email-address' placeholder='Email' />
                        </View>
                        <View style={styles.inputs}>
                            <Icon name={"lock"} size={30} style={{ color: 'grey', paddingHorizontal: 9 }} />
                            <TextInput style={{ width: 234 }} onChangeText={(pass) => { this.setState({ password: pass }) }}
                                value={this.state.password} secureTextEntry={true} placeholder='Password' />
                        </View>
                        <View style={styles.inputs}>
                            <Icon name={"lock"} size={30} style={{ color: 'grey', paddingHorizontal: 9 }} />
                            <TextInput style={{ width: 234 }} onChangeText={(pass) => { this.setState({ confirmPssword: pass }) }}
                                value={this.state.confirmPssword} secureTextEntry={true} placeholder='Confirm password' />
                        </View>
                        <Text style={{ color: 'rgba(198, 40, 40,1.0)', width: 270 }}>{this.state.error}</Text>
                        <TouchableOpacity style={styles.submitButton}
                            disabled={this.state.creatingAccount} onPress={this.register} >
                            {this.state.creatingAccount
                                ? <ActivityIndicator size='large' color='white' />
                                : <Text style={{ color: 'white', fontSize: 15 }}>Sign Up</Text>}
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    center: {
        flex: 1,

    },
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: 'center'
    },
    form: {
        backgroundColor: 'rgba(255, 255, 255,0.7)',
        borderRadius: 10,
        width: 300,
        minHeight: 390,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        position: 'absolute',
        top: -30,
        color: 'rgb(3, 169, 244)',
        backgroundColor: 'white',

    },
    inputs: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(238, 238, 238)',
        borderRadius: 5,
        marginVertical: 10,
        width: 270
    },
    submitButton: {
        marginVertical: 15,
        width: 270,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: 'rgb(33, 150, 243)'
    },
    photoInput: {
        color: 'grey',
        borderWidth: StyleSheet.hairlineWidth,
        marginVertical: 5,
        padding: 20,
        borderColor: 'grey',
        borderRadius: 10,
        alignItems: 'center'
    },
    profilePhoto: {
        minHeight: 140,
        minWidth: 140,
        borderRadius: 70
    },

})