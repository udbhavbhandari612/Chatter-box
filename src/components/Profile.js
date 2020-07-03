import React, { Component } from 'react'
import { Text, View, Dimensions, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';
import { onScrollEvent } from 'react-native-redash';
import Clipboard from '@react-native-community/clipboard';
import { Toast } from 'native-base';
import firestore from '@react-native-firebase/firestore';

const width = Dimensions.get('window').width;
const { Value, interpolate, Extrapolate, color } = Animated;

export default class Profile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: props.route.params.user,
        }
        this.InitializeAnimations();

    }

    async componentDidMount(){
        const data=await firestore().collection('users').doc(this.state.user.uid).get();
        let user={...data.data(),uid:data.id};
        this.setState({user})
    }

    InitializeAnimations = () => {
        this.y = new Value(0);
        this.scale = interpolate(this.y, {
            inputRange: [0, width / 2],
            outputRange: [1.2, 1],
            extrapolate: Extrapolate.CLAMP
        })

        this.height = interpolate(this.y, {
            inputRange: [0, width * 1.2],
            outputRange: [width * 0.7, width * 0.3],
            extrapolate: Extrapolate.CLAMP

        });

        this.opacity = interpolate(this.y, {
            inputRange: [0, width * 0.8],
            outputRange: [0.8, 0.4],
            extrapolate: Extrapolate.CLAMP
        });

        this.borderRadius = interpolate(this.y, {
            inputRange: [0, width * 0.8],
            outputRange: [10, 50],
            extrapolate: Extrapolate.CLAMP
        });

        this.nameTop = interpolate(this.y, {
            inputRange: [0, width * 0.2],
            outputRange: [width * 0.2, 0],
            extrapolate: Extrapolate.CLAMP
        });

        this.nameOpacity = interpolate(this.y, {
            inputRange: [0, width * 0.2 - 2, width * 0.2],
            outputRange: [0, 0.5, 1],
            extrapolate: Extrapolate.CLAMP
        });


    }


    BackButton = () => {
        return (
            <View style={{ position: 'absolute', zIndex: 2, paddingHorizontal: 10, paddingVertical: 10 }}>
                <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                    <Ionicons name='md-arrow-back' size={27} color='white'
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            paddingHorizontal: 19,
                            paddingVertical: 15,
                            borderRadius: 40,

                        }} />
                </TouchableOpacity>
            </View>
        )
    }

    NavigateToImageViewer = () => {
        this.props.navigation.navigate('ImageViewer', { user: this.state.user });
    }


    CopyToClipboard = (type, text) => {
        Clipboard.setString(text);
        Toast.show({
            text: type + " copied to clipboard",
            duration: 1000,
            position: 'bottom',
            textStyle:{textAlign:'center'},
            style:{bottom:50,marginHorizontal:"10%",borderRadius:10,backgroundColor:'rgba(0,0,0,0.7)'}
        });

    }

    render() {

        return (
            <View style={{ flex: 1 }}>

                <this.BackButton />
                <View
                    style={{ width: width, height: width, ...StyleSheet.absoluteFillObject }}>
                    <TouchableOpacity style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'black',zIndex:1 }}
                        activeOpacity={0.8} onPress={this.NavigateToImageViewer}>
                        <Animated.Image resizeMode='cover' style={[StyleSheet.absoluteFillObject,
                        {
                            opacity: this.opacity,
                            transform: [{ scale: this.scale }]
                        }]}
                            source={this.state.user.photoURL ? { uri: this.state.user.photoURL } : require('../assets/profileNotFound.png')} />
                    </TouchableOpacity>
                </View>

                <Animated.View style={{ height: this.height, justifyContent: 'flex-end' }} />

                <Animated.View style={{ width: width, height: width * 0.2, paddingLeft: 20, justifyContent: 'center' }}>
                    <Animated.Text
                        numberOfLines={2}
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: '700',
                            fontSize: 22,
                            paddingHorizontal: 15,
                            top: this.nameTop,
                            opacity: this.nameOpacity,
                            fontFamily: 'sans-serif',

                        }}
                    >{this.state.user.displayName}
                    </Animated.Text>
                </Animated.View>


                <Animated.ScrollView

                    style={{
                        backgroundColor: 'white',
                        overflow: 'hidden',
                        borderTopLeftRadius: this.borderRadius,
                        borderTopRightRadius: this.borderRadius,
                        zIndex:2
                    }}
                    onScroll={onScrollEvent({ y: this.y })}
                    overScrollMode='never'
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={1}
                >


                    <View style={styles.ItemContainer}>
                        <Text style={styles.Label}>Name</Text>
                        <TouchableHighlight
                            underlayColor="lightgrey"
                            onLongPress={() => this.CopyToClipboard("Name", this.state.user.displayName)}>
                            <Text style={styles.Content}>{this.state.user.displayName}</Text>
                        </TouchableHighlight>
                    </View>

                    <View style={styles.Divider} />

                    <View style={styles.ItemContainer}>
                        <Text style={styles.Label}>Email</Text>
                        <TouchableHighlight
                            underlayColor="lightgrey"
                            onLongPress={() => this.CopyToClipboard("Email", this.state.user.email)}>
                            <Text style={styles.Content}>{this.state.user.email}</Text>
                        </TouchableHighlight>
                    </View>

                    <View style={styles.Divider} />

                    <View style={styles.ItemContainer}>
                        <Text style={styles.Label}>About</Text>
                        <TouchableHighlight
                       
                            underlayColor="lightgrey"
                            onLongPress={() => this.CopyToClipboard("About", this.state.user.about)}
                            disabled={!this.state.user.about}>
                            {
                                this.state.user.about
                                    ?
                                    <Text style={styles.Content}>{this.state.user.about}</Text>
                                    :
                                    <Text style={[styles.Content, { color: 'grey', fontSize: 17 }]}>Not Mentioned</Text>
                            }
                        </TouchableHighlight>
                    </View>

                    <View style={styles.Divider} />

                    <View style={styles.ItemContainer}>
                        <Text style={styles.Label}>Phone Number</Text>
                        <TouchableHighlight
                       
                            underlayColor="lightgrey"
                            onLongPress={() => this.CopyToClipboard("Phone Number", this.state.user.phoneNumber)}
                            disabled={!this.state.user.phoneNumber}>
                            {
                                this.state.user.phoneNumber
                                    ?
                                    <Text style={styles.Content}>{this.state.user.phoneNumber}</Text>
                                    :
                                    <Text style={[styles.Content, { color: 'grey', fontSize: 17 }]}>Not Mentioned</Text>
                            }
                        </TouchableHighlight>
                    </View>

                    <View style={styles.Divider} />

                    <View
                        style={{ height: width / 2, justifyContent: 'flex-end', alignItems: 'center', paddingVertical: 10 }}>
                        <Text style={{ color: 'grey', letterSpacing: 1, bottom: 10 }}>ChatterBox</Text>
                    </View>
                </Animated.ScrollView>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    DetailsContainer: {
        paddingVertical: 50,
        paddingHorizontal: 15,
        backgroundColor: 'black',
    },
    ItemContainer: {
        paddingTop:10,
        
    },
    Divider: {
        borderBottomWidth: 0.8,
        borderColor: 'lightgrey',
        marginHorizontal: "10%",
        marginBottom:10,
    },
    Label: {
        paddingHorizontal: 30,
        paddingVertical: 5,
        color: '#2196F3',
        fontSize: 15,
        fontFamily: 'sans-serif-thin',
        fontWeight: "700"
    },
    Content: {
        fontSize: 19,
        fontFamily: 'sans-serif',
        paddingVertical: 15,
        paddingHorizontal: 30,
        fontWeight: "500"
    }

})
