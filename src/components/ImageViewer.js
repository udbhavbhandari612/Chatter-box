import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, Dimensions } from 'react-native'
import { TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ReactNativeZoomableView } from '@dudigital/react-native-zoomable-view';

export default class ImageViewer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: props.route.params?.user,
            dimensions: Dimensions.get('window').width,
            height: 0

        }
    }

    CustomHeader = ({ user }) => {
        return (
            <View style={styles.header}>

                <TouchableRipple onPress={() => this.props.navigation.goBack()} rippleColor='rgba(255,255,255,0.5)'
                    borderless={true} style={styles.backButtonContainer}>
                    <Icon name='arrow-back' style={styles.backButton} size={30} />
                </TouchableRipple>
                <View style={{flex:1}}>
                    <Text style={{ color: 'rgba(255,255,255,1)', fontSize: 20, fontWeight: '600' }}>
                        {user.displayName}
                    </Text>
                </View>

            </View>
        )
    }


    componentDidMount() {

    }

    render() {
        return (
            <View style={styles.container}>

                <ReactNativeZoomableView
                    minZoom={1}
                    zoomStep={0.5}
                    pinchToZoomInSensitivity={5}
                >
                    <Image source={{ uri: this.state.user.photoURL }}
                        style={[{ width: this.state.dimensions, height: this.state.dimensions },
                        {

                        }]}
                        resizeMethod='resize' resizeMode='cover' />
                </ReactNativeZoomableView>
                <this.CustomHeader user={this.state.user} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(33, 33, 33,1)'
    },
    header: {
        position: 'absolute',
        top: 0,
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
        paddingRight:10,
        backgroundColor: 'rgba(33, 33, 33,0.5)',
        flexDirection: 'row'
    },
    backButtonContainer: {
        borderRadius: 100,
        padding: 10,
        overflow: 'hidden',
        marginHorizontal: 10,
    },
    backButton: {
        color: 'rgba(255,255,255,0.8)',


    },
})
