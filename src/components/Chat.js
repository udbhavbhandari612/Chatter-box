import React, { Component } from 'react';
import {
    Text, View, StyleSheet, InteractionManager,
    TouchableHighlight, TouchableOpacity, TextInput, FlatList, TouchableNativeFeedback,
    Alert, ImageBackground, Dimensions, Image, ActivityIndicator, Modal
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../assets/colors';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { Header, Left, Body, Right, Toast } from 'native-base';

import SentMessage from '../components/customs/SentMessage';
import ReceivedMessage from '../components/customs/RecievedMessage';
import { TouchableRipple } from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Sound from 'react-native-sound';

export class Chat extends Component {
    listener = null;
    screenWidth = Dimensions.get('window').width;

    constructor(props) {
        super(props);
        this.state = {
            receiver: this.props.route.params?.receiver,
            sender: auth().currentUser.toJSON(),
            messages: [],
            message: '',
            chatRoomId: '',
            isloading: true,
            loadingMoreMessages: false,
            threshold: null,
            modalVisible: false,
            currentMessage: {},

        }

        this.InitiateSounds();

    }

    InitiateSounds=()=>{
        Sound.setCategory('Playback', true);
        this.tick = new Sound(require('../assets/sounds/Tick.mp3'), '', (error) => {
            if (error) {
                Toast.show({
                    text: 'Error while fetching audio',
                    position: 'bottom',
                    type: 'warning',
                    duration: 2000
                })
                return;
            }

        });
        this.woosh = new Sound(require('../assets/sounds/woosh.mp3'), '', (error) => {
            if (error) {
                Toast.show({
                    text: 'Error while fetching audio',
                    position: 'bottom',
                    type: 'warning',
                    duration: 2000
                })
                return;
            }

        });
    }

    sendMsg = async (msg) => {
        try {
            //if chat room doesn't exists
            if (this.state.messages.length == 0 && this.state.chatRoomId.length == 0) {
                const room = {};
                room[auth().currentUser.uid] = true;
                room[this.state.receiver.uid] = true;
                const users = {};
                users['1'] = auth().currentUser.uid;
                users['2'] = this.state.receiver.uid;
                room['participants'] = users;
                room.lastActivity = new Date();
                room.lastMessage = { ...msg };
                await firestore().collection('chats').doc()
                    .set({ ...room });
                await this.checkChatRoom();
            }


            this.setState({ message: '' }, async () => {

                //add new messages
                await firestore().collection('chats').doc(this.state.chatRoomId)
                    .collection('messages')
                    .add({ ...msg })

                //update Last Activity
                await firestore().collection('chats').doc(this.state.chatRoomId).set({
                    lastActivity: new Date(),
                    lastMessage: { ...msg }
                }, { merge: true }).then(() => { });

            });

        } catch (error) {
            Alert.alert('Error occured!', error.message)
        }

    }

    navigateToProfile() {
        this.props.navigation.navigate('Profile', { user: this.state.receiver })
    }

    ChatHeader = () => {
        return (
            <Header style={styles.header} >
                <Left style={styles.headerLeft}>
                    <TouchableHighlight style={{ borderRadius: 25, padding: 10 }}
                        underlayColor='rgba(224, 224, 224,0.5)' onPress={() => { this.props.navigation.goBack() }}>
                        <MatIcon color='rgba(250, 250, 250,0.9)' name='arrow-back' size={25} />
                    </TouchableHighlight>

                </Left>
                <Body style={{ flex: 2, height: '100%' }} >
                    <TouchableRipple onPress={() => { this.navigateToProfile() }} rippleColor='rgba(255,255,255,0.2)' style={{ paddingRight: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%' }}>
                            {
                                this.state.receiver?.photoURL ?
                                    <Image style={styles.Imglogo}
                                        resizeMethod='resize' resizeMode='cover' source={{ uri: this.state.receiver.photoURL }} />
                                    :
                                    <Text style={[styles.logo, { backgroundColor: colors.G }]}>
                                        {this.state.receiver.displayName[0]}
                                    </Text>
                            }

                            <Text numberOfLines={1} lineBreakMode='tail'
                                style={{
                                    fontFamily: 'sans-serif-medium', flex: 1,
                                    fontSize: 20, color: 'rgba(250, 250, 250,0.9)'
                                }}>
                                {this.state.receiver.displayName}
                            </Text>
                        </View>
                    </TouchableRipple>
                </Body>
                <Right />
            </Header>
        )
    }

    ChatFooter = () => {

        return (
            <View style={[{ width: this.screenWidth }, styles.footer]}>
                <View style={styles.footerContainer}>
                    <TextInput placeholder="Write a message"
                        multiline
                        onChangeText={(text) => { this.setState({ message: text }) }}
                        value={this.state.message}
                        style={styles.messageInput} />
                    <TouchableOpacity activeOpacity={0.5}
                        style={{ elevation: 4 }}
                        disabled={this.state.message.length < 1}
                        onPress={() => {
                            const data = {
                                from: auth().currentUser.uid,
                                to: this.state.receiver.uid,
                                message: this.state.message.trim(),
                                createdAt: new Date(),
                                type: 'text'
                            }

                            this.sendMsg(data);
                        }}>
                        <MatIcon name='send' style={styles.sendBtn} size={22} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    async checkChatRoom() {
        try {
            this.setState({ isloading: true })
            await firestore().collection('chats')
                .where(auth().currentUser.uid, '==', true)
                .where(this.state.receiver.uid, '==', true)
                .get().then(async (res) => {
                    if (!res.empty)
                        this.setState({ chatRoomId: res.docs[0].id }, () => {
                            return this.listenToChatRoom();
                        })
                    else {
                        this.setState({ isloading: false })
                    }
                });
        } catch (error) {
            this.setState({ isloading: false })
            Alert.alert('Error occured', error.message);
        }
    }

    listenToChatRoom() {
        if (!this.listener)
            this.listener = firestore().collection('chats')
                .doc(this.state.chatRoomId)
                .collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .onSnapshot((snaps) => {
                    if (snaps.empty) {
                        this.setState({
                            messages: [],
                            isloading: false,
                        })
                    }
                    else if (snaps.docChanges().length == snaps.docs.length) {
                        const threshold = snaps.docs[snaps.docs.length - 1];
                        const messages = snaps.docs.map((msg) => {
                            msg.data().id = msg.id;

                            return msg.data();
                        });
                        // messages.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
                        this.setState({
                            messages: [...messages]
                        }, () => {

                            this.setState({
                                isloading: false,
                                threshold: threshold
                            })
                        })
                    }
                    else {
                        const newMessages = [];
                        const deletedMessages = [];
                        snaps.docChanges().forEach((doc) => {
                            if (doc.type == 'added')
                                newMessages.push(doc.doc)
                            else if (doc.type == 'modified' && doc.newIndex == doc.oldIndex)
                                deletedMessages.push(doc.doc)
                        });

                        //add new messages
                        if (newMessages.length > 0) {
                            const messages = newMessages.map((msg) => {
                                msg.data().id = msg.id;
                                msg.data().shouldAnimate = true;
                                return msg.data();
                            });
                            this.setState({
                                messages: [...messages, ...this.state.messages]
                            }, () => {
                                this.tick.play()
                                this.setState({
                                    isloading: false,
                                })
                            });
                        }

                        //delete messages
                        if (deletedMessages.length > 0)
                            this.setState((state) => {
                                var messages = state.messages;
                                deletedMessages.forEach((msg) => {
                                    const index = messages.findIndex((item) => item.id == msg.id);
                                    if (index != -1 && msg.data().message == "") {
                                        // console.log(index)
                                        messages[index].message = "";
                                    }
                                    // console.log(messages[index])
                                })
                                return { messages: messages };
                            },()=>this.woosh.play());

                    }
                },
                    (error) => {
                        this.setState({ isloading: true });
                        Alert.alert('Error occured', error.message)
                    })
    }

    loadMoreMessages(threshold) {

        if (threshold && !this.state.loadingMoreMessages) {

            this.setState({ loadingMoreMessages: true })
            firestore().collection('chats')
                .doc(this.state.chatRoomId)
                .collection('messages')
                .orderBy('createdAt', "desc")
                .startAfter(threshold)
                .limit(20)
                .get()
                .then((oldMessages) => {

                    if (!oldMessages.empty) {
                        const threshold = oldMessages.docs[oldMessages.docs.length - 1];
                        const messages = oldMessages.docs.map((doc) => {
                            doc.data().id = doc.id;
                            return doc.data();
                        });
                        this.setState({ messages: [...this.state.messages, ...messages] }, () => {

                            this.setState({
                                loadingMoreMessages: false,
                                threshold: threshold
                            })
                        })
                    } else {
                        this.setState({
                            loadingMoreMessages: false,
                            threshold: null
                        })
                    }
                })
                .catch((err) => {
                    Alert.alert('Error occured while loading messages!', err.message);
                    this.setState({
                        loadingMoreMessages: false,
                        threshold: null
                    })
                })

        }
    }

    getDate(current, next, currentIndex, messagesLength) {

        const currentDate = new firestore.Timestamp(current?._seconds, current?._nanoseconds).toDate().toDateString();
        var date = new Date();
        const today = date.toDateString();
        date.setDate(date.getDate() - 1);
        const yesterday = date.toDateString();


        if (currentIndex == messagesLength - 1) {
            if (currentDate == today)
                return "Today";
            if (currentDate == yesterday)
                return "Yesterday"
            return currentDate;
        }


        if (next) {
            const nextDate = new firestore.Timestamp(next?._seconds, next?._nanoseconds).toDate().toDateString();
            if (currentDate == nextDate)
                return null;
            else {
                if (currentDate == today)
                    return "Today"
                else if (currentDate == yesterday)
                    return "Yesterday"
                else
                    return currentDate;

            }
        } else {
            null;
        }

    }

    componentDidMount() {

        this.props.navigation.setOptions({
            header: this.ChatHeader,
            title: ''
        });
        InteractionManager.runAfterInteractions(() => {
            this.setState({ isloading: false })
            this.checkChatRoom();
        });

    }

    OpenOptionsModal = (message) => {
        this.setState({ modalVisible: true, currentMessage: message })
    }

    CloseOptionsModal = () => {
        this.setState({ modalVisible: false, currentMessage: {} })
    }

    HandleAction = async (type) => {
        this.CloseOptionsModal();
        if (type == 'd') {
            try {
                await firestore().collection('chats')
                    .doc(this.state.chatRoomId)
                    .collection('messages')
                    .doc(this.state.currentMessage.id)
                    .set({ message: '' }, { merge: true });
                
            } catch (error) {
                Alert.alert('Error!', error.message);
            }
        }
        else if (type == 'f') {
            Alert.alert('Under Development!', 'Sorry, currently this functionality is not available.');

        }
    }

    componentWillUnmount() {

        if (this.listener) {
            this.listener();
        }
        this.tick.release();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <ImageBackground imageStyle={{ opacity: 0.2, backgroundColor: 'rgba(158, 158, 158,0.2)' }}
                    style={styles.background} source={require('../assets/logo3.jpg')}
                    resizeMethod='scale' resizeMode='cover'>
                    {this.state.isloading ?
                        <ActivityIndicator size='large' style={{ flex: 1 }} />
                        :
                        <FlatList
                            inverted
                            style={{ width: this.screenWidth }}
                            data={this.state.messages}
                            onEndReachedThreshold={0.5}
                            onEndReached={() => { this.loadMoreMessages(this.state.threshold) }}
                            renderItem={({ item, index }) => {
                                if (item) {
                                    const next = this.state.messages[index + 1] ? this.state.messages[index + 1] : null;
                                    const date = this.getDate(item?.createdAt, next?.createdAt, index, this.state.messages.length);
                                    const createdAt = new firestore.Timestamp(item.createdAt?._seconds, item.createdAt?._nanoseconds).toDate().toString();
                                    if (auth().currentUser.uid.localeCompare(item?.from) == 0) {
                                        return (
                                            <View>

                                                {date &&
                                                    <View style={styles.dateTimeContainer}>
                                                        <Text style={styles.dateTime}>
                                                            {date}
                                                        </Text>
                                                    </View>
                                                }
                                                <SentMessage message={item.message} createdAt={createdAt} shouldAnimate={item.shouldAnimate} onPress={() => this.OpenOptionsModal(item)} />
                                            </View>
                                        )
                                    }
                                    else {
                                        return (
                                            <View>

                                                {date &&
                                                    <View style={styles.dateTimeContainer}>
                                                        <Text style={styles.dateTime}>
                                                            {date}
                                                        </Text>
                                                    </View>
                                                }
                                                <ReceivedMessage message={item.message} createdAt={createdAt} />
                                            </View>
                                        )
                                    }
                                }
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />}
                    <this.ChatFooter />
                    {this.state.loadingMoreMessages &&
                        <ActivityIndicator color='green' size={25} style={styles.loadMoreMessages} />}
                </ImageBackground >

                <Modal onRequestClose={() => this.CloseOptionsModal()}
                    visible={this.state.modalVisible} animationType='slide' transparent={true}>
                    <View style={styles.modal}>
                        <TouchableHighlight
                            style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0, right: 0
                            }}
                            underlayColor={'rgba(0,0,0,0.2)'}
                            onPress={() => this.CloseOptionsModal()}>
                            <View></View>
                        </TouchableHighlight>
                        <View style={styles.modalContainer}>

                            <View style={{ ...styles.modalItem, backgroundColor: 'lightgrey', paddingHorizontal: 20 }}>
                                <Text numberOfLines={1} style={{ fontWeight: '700' }}>{this.state.currentMessage.message}</Text>
                            </View>

                            <View style={styles.divider} />

                            <TouchableNativeFeedback
                                onPress={() => this.HandleAction('d')}>
                                <View style={styles.modalItem}>
                                    <MaterialCommunityIcon name="delete" size={25} color={'red'} style={styles.modalIcons} />
                                    <Text style={styles.modalText}>Delete</Text>
                                </View>
                            </TouchableNativeFeedback>

                            <View style={styles.divider} />

                            <TouchableNativeFeedback
                                onPress={() => this.HandleAction('f')}>
                                <View style={styles.modalItem}>
                                    <Entypo name="forward" size={25} color={'green'} style={styles.modalIcons} />
                                    <Text style={styles.modalText}>Forward</Text>
                                </View>
                            </TouchableNativeFeedback>

                            <View style={styles.divider} />

                        </View>
                    </View>
                </Modal>
            </View >

        )
    }
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: 'center',

    },
    header: {
        elevation: 7,
        backgroundColor: '#2c3e50',
        paddingLeft: 0,

    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: "center",
    },
    footer: {
        backgroundColor: 'rgba(0,0,0,0)',
        paddingHorizontal: 5,
        paddingTop: 1,
        marginBottom: 4
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    messageInput: {
        borderRadius: 25,
        fontFamily: 'Roboto',
        fontSize: 16,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255,1)',
        elevation: 1,
        maxHeight: 150,
        flex: 1
    },
    sendBtn: {
        backgroundColor: '#388E3C',
        color: 'white',
        padding: 14,
        marginLeft: 3,
        borderRadius: 40,

    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        textAlign: "center",
        textAlignVertical: "center",
        color: 'white',
        marginRight: 5,
        textTransform: 'capitalize',
    },
    Imglogo: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        marginRight: 5,
    },
    dateTimeContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 5
    },
    dateTime: {
        backgroundColor: 'rgba(96, 125, 139,0.5)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        color: 'rgba(255,255,255,0.8)'
    },
    loadMoreMessages: {
        position: 'absolute',
        top: 10,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 5,
        elevation: 10
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
