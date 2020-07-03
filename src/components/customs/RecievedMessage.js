import React, { PureComponent } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native'

export default class RecievedMessage extends PureComponent {

    render() {
        const { message, createdAt }=this.props;
        var time = new Date(createdAt).toTimeString();
        time = (time.length == 10 ? "0" : '') + time;
        return (
            <View style={{ marginHorizontal: 5, alignItems: 'flex-start' }}>

                <TouchableHighlight onPress={() => { }} underlayColor={'#F5F5F5'} style={styles.receivedMsgContainer}>
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
                            {time.slice(0, 5) +
                                ' '
                                + (Number.parseInt(time.slice(0, 2)) < 12 ? 'am' : 'pm')}
                        </Text>
                    </>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    receivedMsgContainer: {
        elevation: 2,
        maxWidth: 350,
        borderRadius: 12,
        borderTopLeftRadius: 0,
        backgroundColor: 'rgba(255, 241, 118,1.0)',
        padding: 10,
        marginVertical: 2,

    },
    receivedMsg: {
        fontFamily: 'Roboto',
        fontSize: 14,
    },
    deleteMessage:{
        fontFamily: 'Roboto',
        fontSize: 14,
        color:'grey',
        fontStyle:'italic'
    }
})
