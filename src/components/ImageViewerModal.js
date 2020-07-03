import React, { Component } from 'react'
import { Text, View, Modal, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

export default class ImageViewerModal extends Component {

    constructor(props) {
        super();
        this.state = {
            user: props.user,
            isModalVisible: props.visible,

        }

    }
    render() {
        return (

            <Modal
                visible={this.state.isModalVisible}
                transparent={true}
                animationType='fade'
                onDismiss={this.props.onclose}
                onRequestClose={this.props.onclose}

            >

                <View style={styles.container}>
                    {/* just for overlay */}
                    <TouchableWithoutFeedback onPress={this.props.onclose}>
                        <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>
                    <View style={styles.subContainer}>


                        <View style={styles.header}>
                            <Text style={styles.headerText} numberOfLines={1}>{this.state.user.displayName}</Text>
                        </View>

                        <TouchableOpacity style={styles.pictureContainer} activeOpacity={0.7} onPress={this.props.onImagePress}>
                            <Image style={styles.picture}
                                source={this.state.user?.photoURL ? { uri: this.state.user?.photoURL } : require('../assets/profileNotFound.png')} />

                        </TouchableOpacity>

                        <View style={styles.actionsContainer}>
                            <View style={{flex:1,height:'100%'}}>
                                <TouchableOpacity 
                                style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}
                                onPress={()=>this.props.onActionsPress("i")}>
                                    <MaterialCommunityIcon name="information-outline" color="white" size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={{flex:1,height:'100%'}}>
                                <TouchableOpacity 
                                style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}
                                onPress={()=>this.props.onActionsPress("m")}>
                                    <MaterialCommunityIcon name="message-text-outline" color="white" size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={{flex:1,height:'100%'}}>
                                <TouchableOpacity 
                                style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}
                                onPress={()=>this.props.onActionsPress("c")}>
                                    <MaterialIcon name="call" color="white" size={25} />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>

                </View>

            </Modal>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subContainer: {
        width: '70%',
        height: '50%',
        backgroundColor: 'white',
        borderRadius: 10,

        overflow: 'hidden',
    },
    header: {
        backgroundColor: 'rgba(0, 0, 0,0.5)',
        padding: 10,
        zIndex: 1,
        height: '12%',
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
        position: 'absolute',

    },
    headerText: {
        color: 'rgba(245, 245, 245,0.9)',
        fontSize: 18,
        fontFamily: 'sans-serif-medium',
        letterSpacing: 1.5
    },
    pictureContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '88%'
    },
    picture: {
        height: '100%',
        width: '100%',

    },
    actionsContainer: {
        backgroundColor: '#00897B',
        height: '12%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection:'row',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0)'
    },

})

