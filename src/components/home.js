import React, { Component } from 'react';
import {
    Text, StyleSheet, View, FlatList,
    TouchableHighlight, TouchableOpacity, Image, TextInput, Alert, BackHandler
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../assets/colors';
import { Icon as NativeIcon, ListItem } from 'native-base';
import ImageViewerModal from './ImageViewerModal';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';


export class Home extends Component {

    chatRoomsListner = null;

    constructor(props) {
        super(props);
        this.state = {
            roomsList: [],
            roomsListCopy: [],
            isLoading: false,
            bgColor: '#EEEEEE',
            isModalOpen: false,
            currentUser: null,
            actionsMode: false,
        }



    }

    listenToChatRooms = async () => {
        this.setState({ isLoading: true })
        this.chatRoomsListner = firestore().collection('chats')
            .where(auth().currentUser.uid, '==', true)
            .onSnapshot(async (snap) => {

                if (snap && snap.size > 0) {
                    const rooms = snap.docs
                        .map((doc) => {
                            const participantID = doc.data()?.participants['1'] == auth().currentUser.uid ? doc.data()?.participants['2'] : doc.data()?.participants['1'];
                            doc.data().participantId = participantID;
                            doc.data().roomid = doc.id;
                            return doc.data();
                        })
                        .sort((a, b) => new firestore.Timestamp(b.lastActivity._seconds, b.lastActivity._nanoseconds).toDate() - new firestore.Timestamp(a.lastActivity?._seconds, a.lastActivity?._nanoseconds).toDate());

                    for (let index = 0; index < rooms.length; index++) {
                        const data = await firestore().collection('users').doc(rooms[index].participantId).get();
                        rooms[index].participantData = data.data();
                    }

                    this.setState({ roomsList: rooms, roomsListCopy: rooms }, () => this.setState({ isLoading: false }));

                } else {
                    this.setState({ roomsList: [], roomsListCopy: [] }, () => this.setState({ isLoading: false }));
                }
            });
    }

    openUserModal(user) {
        this.setState({
            currentUser: user,
            isModalOpen: true
        })

    }

    ActionBar = ({ count }) => {
        return (
            <Animated.View style={{
                backgroundColor: 'green', width: "100%", height: 60,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: 'center', justifyContent: 'space-between',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                    <TouchableOpacity onPress={this.CloseActionsMode}>
                        <MaterialCommunityIcon name='close' size={25} color={'white'} style={{ marginRight: 20 }} />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{count}</Text>
                </View>
                <View>
                    <TouchableOpacity disabled={count == 0}
                        style={{ paddingHorizontal: 15, height: '100%', justifyContent: 'center', }}
                        onPress={() => this.ConfirmMultipleDeletion()}>
                        <MaterialCommunityIcon name="delete" size={25} color="white" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )
    }

    OpenActionsMode = (index) => {

        if (this.state.actionsMode) {
            this.HandleChatsSelection(index);
            return;
        }

        this.setState({
            actionsMode: true,
        }, () => {
            this.HandleChatsSelection(index);
        })

    }

    CloseActionsMode = () => {
        var { roomsListCopy } = this.state;
        roomsListCopy.forEach(item => item.isSelected = false)
        this.setState({
            actionsMode: false,
            roomsListCopy: [...roomsListCopy]
        })

    }

    HandleChatsSelection = (index) => {
        var { roomsListCopy } = this.state;
        roomsListCopy[index].isSelected = !roomsListCopy[index]?.isSelected;
        this.setState({
            roomsListCopy: [...roomsListCopy]
        })

    }

    ConfirmMultipleDeletion = () => {
        const count = this.state.roomsListCopy.filter(i => i?.isSelected).length;
        Alert.alert('Confirm',
            'Are you sure you want to delete ' + count + ' chat' + (count > 1 ? 's' : '') + '?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Delete', onPress: this.HandleMultipleDelete },
            ]
        )
    }

    HandleMultipleDelete = async () => {
        console.log('check')
        this.chatRoomsListner();
        const { roomsListCopy } = this.state;
        this.setState({ isLoading: true })
        try {
            for (let index = 0; index < roomsListCopy.length; index++) {
                if (roomsListCopy[index].isSelected) {
                    await firestore().collection('chats').doc(roomsListCopy[index].roomid).delete();
                }
            }
            this.CloseActionsMode();
            this.setState({ isLoading: false });
        } catch (error) {
            Alert.alert('Error deleting some chats!', error.message);
            this.setState({ isLoading: false });
        } finally {
            this.listenToChatRooms();
        }
    }

    ChatBody = ({ item, index }) => {
        return (

            <View style={{ ...styles.chat, backgroundColor: item?.isSelected ? 'lightgrey' : 'white' }} >
                <ListItem noBorder style={styles.chatBody} onLongPress={() => this.OpenActionsMode(index)}
                    onPress={() => {
                        if (this.state.actionsMode)
                            this.HandleChatsSelection(index)
                        else
                            this.chat(item?.participantData)
                    }}>
                    {
                        item.participantData?.photoURL
                            ?
                            <TouchableOpacity onPress={() => this.openUserModal(item.participantData)}>
                                <Image style={styles.Imglogo} resizeMethod='resize' source={{ uri: item.participantData.photoURL }} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => this.openUserModal(item.participantData)}>
                                <Text style={[styles.logo, { backgroundColor: colors.D }]}>
                                    {item.participantData?.displayName[0]}
                                </Text>
                            </TouchableOpacity>
                    }

                    <View style={styles.chatText}>
                        <Text style={styles.chatName} numberOfLines={1}
                        >{item.participantData?.displayName + " "}</Text>
                        <Text style={styles.chatMessage} numberOfLines={1}>
                            <Text style={{ fontWeight: '600' }}
                            >{item?.lastMessage?.from == auth().currentUser.uid ? 'You: ' : ''}</Text>
                            {
                                item?.lastMessage?.message
                            }
                        </Text>
                    </View>
                    <View style={styles.chatTime}>
                        <Text style={{ color: '#616161', fontSize: 13, fontWeight: '600' }}>
                            {this.time(item?.lastMessage?.createdAt)}
                        </Text>
                    </View>
                </ListItem>
                {index != this.state.roomsListCopy.length - 1 &&
                    <View style={{ borderBottomWidth: 0.7, borderBottomColor: 'rgba(0,0,0,0.15)', marginLeft: 73, marginRight: 20, backgroundColor: 'transparent' }} />}
            </View>

        )
    }

    listFooter = () => {
        return (<View style={{ height: 50, justifyContent: 'flex-end', paddingBottom: 10 }}>
            <Text style={{ textAlign: 'center', color: 'grey' }}>
                {'ChatterBox ' + '\u00A9' + new Date().getFullYear().toString()}
            </Text>
        </View>
        )
    }

    time(datetime) {
        const date = new firestore.Timestamp(datetime?._seconds, datetime?._nanoseconds).toDate();
        const currentDate = new Date();
        if (date.toLocaleDateString() != currentDate.toLocaleDateString()) {
            currentDate.setDate(currentDate.getDate() - 1)
            if (currentDate.getDate() == date.getDate()) {
                return 'yesterday';
            }
            else {
                return date.toLocaleDateString();
            }
        }
        return date.toLocaleTimeString().split(':')[0] + ':' + date.toLocaleTimeString().split(':')[1] + ' '
            +
            (Number.parseInt(date.toLocaleTimeString().split(':')[0]) < 12 ? 'am' : 'pm');
    }

    chat(userData) {
        if (userData) {
            this.props.navigation.navigate('Chat', { receiver: userData });
        }
    }

    handleBack = () => {
        if (this.state.actionsMode) {
            this.CloseActionsMode();

        } else {
            if (this.props.navigation.canGoBack())
                this.props.navigation.goBack();
            else
                BackHandler.exitApp();

        }
        return true;
    }

    componentDidMount() {
        this.listenToChatRooms();
        BackHandler.addEventListener('hardwareBackPress', this.handleBack.bind(this));

    }

    componentWillUnmount() {
        if (this.chatRoomsListner) {
            this.chatRoomsListner();
        }
        BackHandler.removeEventListener('hardwareBackPress', this.handleBack);
    }

    filter = (filter) => {
        if (filter.trim() == '')
            this.setState({ roomsListCopy: this.state.roomsList })
        else {
            this.setState({
                roomsListCopy: this.state.roomsList
                    .filter((val) => val.participantData?.displayName?.toLowerCase().includes(filter.toLowerCase()))
            })
        }
    }

    handleImagePress = () => {
        if (this.state.currentUser.photoURL) {
            this.props.navigation.navigate('ImageViewer', { user: this.state.currentUser });
            this.setState({
                isModalOpen: false,
                currentUser: null
            })
        }
    }

    handleActionsPress = (action) => {
        const user = Object.assign({}, this.state.currentUser);
        this.setState({
            isModalOpen: false,
            currentUser: null
        }, () => {
            if (action == 'i') {
                this.props.navigation.navigate('Profile', { user: user })
            }
            else if (action == 'm') {
                this.props.navigation.navigate('Chat', { receiver: user });
            }
            else if (action == 'c') {
                Alert.alert('Sorry', "Calling feature is not available yet.");
            }
        })

    }

    ListEmptyComponent = () => {
        return (
            <View style={{ paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: 'grey', fontWeight: '700', marginRight: 10 }}>Swipe to start chatting</Text>
                    <FAIcon name='arrow-right' size={23} color='grey' />
                </View>
            </View>
        )
    }


    render() {
        return (
            <View style={{ flex: 1 }}>

                {this.state.actionsMode ?
                    < this.ActionBar count={this.state.roomsListCopy.filter(i => i.isSelected).length} />
                    :
                    <View style={[styles.search, { backgroundColor: this.state.bgColor }]}>
                        <NativeIcon name='search' style={{ color: 'grey', }} />
                        <TextInput placeholder='Search for chats' onFocus={() => this.setState({ bgColor: 'white' })}
                            onBlur={() => this.setState({ bgColor: '#EEEEEE' })} onChangeText={this.filter} style={{ paddingLeft: 10, flex: 1 }} />

                    </View>

                }


                <FlatList
                    ListEmptyComponent={this.ListEmptyComponent}
                    data={this.state.roomsListCopy}
                    refreshing={this.state.isLoading}
                    onRefresh={this.listenToChatRooms}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={this.listFooter}
                    renderItem={
                        ({ item, index }) => {
                            if (item)
                                return <this.ChatBody item={item} index={index} />;
                        }
                    }
                />

                {
                    this.state.isModalOpen &&
                    <ImageViewerModal
                        visible={this.state.isModalOpen}
                        user={this.state.currentUser}
                        onImagePress={this.handleImagePress}
                        onActionsPress={(action) => this.handleActionsPress(action)}
                        onclose={() => {
                            this.setState({
                                isModalOpen: false,
                                currentUser: null
                            })
                        }}
                    />
                }

            </View>
        )

    }

}

const styles = StyleSheet.create({
    fab: {

        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    fabBtn: {
        marginRight: 0,
        color: 'rgba(216, 67, 21,1)',

    },
    chat: {
        backgroundColor: 'white',
        // paddingVertical: 10,
        // paddingLeft: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: 'rgba(189, 189, 189,0.5)'
    },
    chatBody: {
        // flexDirection: 'row',
        // alignItems: 'center'

    },
    chatText: {
        width: '80%',
        paddingLeft: 10
    },
    chatName: {
        fontWeight: '700',
        fontSize: 17,
        width: '90%'

    },
    chatMessage: {

        color: '#616161'
    },
    chatTime: {
        position: 'absolute',
        right: 5,
        top: 10,

    },
    logo: {
        width: 46,
        height: 46,
        borderRadius: 46 / 2,
        textAlign: "center",
        textAlignVertical: "center",
        color: 'white',
        textTransform: 'capitalize',
    },
    Imglogo: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
    },

    search: {
        marginTop: 5,
        marginHorizontal: 5,
        paddingHorizontal: 20,
        marginBottom: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        borderRadius: 30,
        backgroundColor: 'white'
    }
})