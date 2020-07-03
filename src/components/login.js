import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet,Keyboard,
     TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';


export class Login extends Component {
    state = {
        email: '',
        password: '',
        error: '',
        isLoggingIn: false
    }

    login() {
        Keyboard.dismiss();
        this.setState({ isLoggingIn: true })
        if (this.state.email.length == 0 || this.state.password.length == 0) {
            this.setState({
                error: 'Please fill all the fields',
                isLoggingIn: false
            })
            return;
        }
        auth().signInWithEmailAndPassword(this.state.email, this.state.password).then((user) => {
            this.setState({ isLoggingIn: false })
            this.props.navigation.reset({
                index: 0,
                routes: [{ name: 'HomeDrawer' }]
            });
            this.props.navigation.navigate('HomeDrawer');

        })
            .catch(err => {
                this.setState({
                    error: err.message,
                    isLoggingIn: false
                });
            })
    }

    loginWithGoogle = () => {
        alert('Not available')
    }

    render() {
        const { navigation } = this.props;
        return (
            <View style={styles.center}>
                <ImageBackground style={styles.background} source={require('../assets/background.jpg')}>
                    <View style={styles.form}>
                        <Icon name='user-circle' style={styles.logo} size={100} />
                        <Text style={{ fontWeight: '700', marginTop: 60, fontSize: 17 }}>Chit-Chat</Text>
                        <View style={styles.inputs}>
                            <Icon name={"user"} size={30} style={{ color: 'grey', paddingHorizontal: 8 }} />
                            <TextInput style={{ width: 234 }} onChangeText={(email) => { this.setState({ email: email.trim() }) }}
                                value={this.state.email} keyboardType='email-address' placeholder='username/email' />
                        </View>
                        <View style={styles.inputs}>
                            <Icon name={"lock"} size={30} style={{ color: 'grey', paddingHorizontal: 9 }} />
                            <TextInput style={{ width: 234 }} onChangeText={(pass) => { this.setState({ password: pass.trim() }) }}
                                value={this.state.password} secureTextEntry={true} placeholder='password' />
                        </View>
                        <Text style={{ color: 'rgba(198, 40, 40,1.0)', width: 270 }}>{this.state.error}</Text>
                        <TouchableOpacity style={styles.submitButton} onPress={()=>this.login()} >
                            <Text style={{ color: 'white', fontSize: 15 }}>Sign In</Text>
                        </TouchableOpacity>
                        <Icon.Button name='google' style={styles.googleBtn} onPress={this.loginWithGoogle}>
                            <Text style={{ color: 'white' }}>Sign In using Google</Text>
                        </Icon.Button>
                        <Text style={{ marginTop: 8 }}>or</Text>
                        <TouchableOpacity style={styles.submitButton} onPress={() => { navigation.navigate('Register') }} >
                            <Text style={{ color: 'white', fontSize: 15 }}>Create new account</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {
                    this.state.isLoggingIn &&
                    <View style={styles.isLoggingIn}>
                        <ActivityIndicator color='white' size={55} />
                    </View>
                }
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
        minHeight: 450,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        position: 'absolute',
        top: -50,
        color: 'rgb(3, 169, 244)',
        backgroundColor: 'white',
        borderRadius: 50
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
    googleBtn: {
        backgroundColor: 'rgba(216, 67, 21,1.0)',
        color: 'white',
        width: 270,
        paddingVertical: 12,
        justifyContent: 'center'
    },
    isLoggingIn: {
        position: 'absolute',
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems:'center',
        justifyContent:'center'
    },
})