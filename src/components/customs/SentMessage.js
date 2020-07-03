import React, { PureComponent } from 'react'
import { Text, View, StyleSheet, TouchableHighlight, Animated, Dimensions } from 'react-native'

const { width } = Dimensions.get('window');

export default class SentMessage extends PureComponent {

    constructor() {
        super();
        this._animateAdd = new Animated.ValueXY({ x: width, y: 0 });
    }

    componentDidMount() {
        Animated.timing(this._animateAdd, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            duration: 500
        }).start();
    }


    render() {

        const { message, createdAt, shouldAnimate, onPress } = this.props;
        var time = new Date(createdAt).toLocaleTimeString();
        time = (time.length == 10 ? "0" : '') + time;
        return (
            <Animated.View activeOpacity={1}
                style={{ marginHorizontal: 5, alignItems: 'flex-end', transform: [{ translateX: shouldAnimate ? this._animateAdd.x : 0 }] }}>

                <TouchableHighlight disabled={!message}
                onPress={onPress} underlayColor={'rgba(224, 224, 224,1.0)'}
                    style={styles.sentMsgContainer}>

                    <>
                        {message ?
                            <Text style={styles.sentMsg}>
                                {message}
                            </Text>
                            :
                            <Text style={styles.deleteMessage}>
                                {"This message has been deleted "}
                            </Text>}
                        <Text style={{ color: 'grey', textAlign: 'right', paddingTop: 5, fontSize: 10, fontWeight: '700' }}>
                            {Number.parseInt(time.slice(0, 2)) < 13
                                ? Number.parseInt(time.slice(0, 2)) == 0 ? '12' + time.slice(2, 5) : time.slice(0, 5)
                                    +
                                    ' '
                                    + (Number.parseInt(time.slice(0, 2)) < 12 ? 'am' : 'pm')
                                : Number.parseInt(time.slice(0, 2)) == 24 ? '12' + time.slice(2, 5) : Number.parseInt(time.slice(0, 2)) - 12 + time.slice(2, 5)
                                    +
                                    ' '
                                    + (Number.parseInt(time.slice(0, 2)) < 12 ? 'am' : 'pm')}
                        </Text>
                    </>

                </TouchableHighlight>

            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    sentMsg: {
        fontFamily: 'Roboto',
        fontSize: 14,
    },
    sentMsgContainer: {
        elevation: 2,
        maxWidth: 350,
        borderRadius: 12,
        borderTopRightRadius: 0,
        backgroundColor: 'white',

        padding: 10,
        marginVertical: 2
    },
    deleteMessage: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: 'grey',
        fontStyle: 'italic'
    }
})
