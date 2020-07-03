import React, { PureComponent,useRef } from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MatComIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CustomInput extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            style: stylesBlur,
            focussed: false
        }

    }

    IconComponent({ icontype, icon, iconSize, style, onIconPress }) {


        if (icontype == 'FA5') {
            return (
                <View style={{ alignSelf: 'center', marginRight: 10 }}>
                    <FontAwesome5 name={icon}
                        size={iconSize}
                        onPress={onIconPress}
                        style={[style, { borderRadius: iconSize }]} />
                </View>
            )
        }

        if (icontype == 'FA') {
            return (
                <View style={{ alignSelf: 'center', marginRight: 10 }}>
                    <FAIcon name={icon}
                        size={iconSize}
                        onPress={onIconPress}
                        style={[style, { borderRadius: iconSize }]} />
                </View>
            )
        }

        if (icontype == 'MI') {
            return (
                <View style={{ alignSelf: 'center', marginRight: 10 }}>
                    <Icon name={icon}
                        size={iconSize}
                        onPress={onIconPress}
                        style={[style, { borderRadius: iconSize }]} />
                </View>
            )
        }

        if (icontype == 'MCI') {
            return (
                <View style={{ alignSelf: 'center', marginRight: 10 }}>
                    <MatComIcon name={icon}
                        size={iconSize}
                        onPress={onIconPress}
                        style={[style, { borderRadius: iconSize }]} />
                </View>
            )
        }
    }

    render() {
        
        return (
            <View style={[this.props.style, this.state.style.container]}>
                <View style={[{ flexDirection: 'row' }]}>
                    {
                        this.props.lefticon
                        &&
                        <this.IconComponent align='left' IconPress={this.props.onLeftIconPress}
                            icon={this.props.icon} icontype={this.props.icontype}
                            iconSize={this.props.iconSize} style={this.state.style.icon} />
                    }
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={[this.state.style.label, this.props.labelStyle]}>{this.props.label}</Text>
                        <TextInput value={this.props.value}
                            multiline={this.props.multiline}
                            maxLength={this.props.maxLength}
                            editable={this.props.editable}
                       
                            onFocus={() => this.setState({ style: stylesFocus, focussed: true })}
                            onBlur={() => this.setState({ style: stylesBlur, focussed: false })}
                            style={[this.state.style.input, this.props.inputStyle]}
                            onChangeText={this.props.onChangeText}
                            placeholder={this.props.placeholder}
                        />
                        {/* {helper text */}
                        {
                            this.state.focussed
                            &&
                            <Text style={{ fontSize: 12, color: 'rgba(21, 101, 192,1.0)' }}>{this.props.helperText}</Text>}
                    </View>
                    {
                        this.props.righticon
                        &&
                        <View style={{ position: 'absolute', right: 0 }}>
                            <this.IconComponent align='right'
                                onIconPress={this.props.onRightIconPress}
                                icon={this.props.righticon.righticon}
                                icontype={this.props.righticon.righticontype}
                                iconSize={this.props.righticon.righticonsize}
                                style={[this.props.rightIconStyle, { alignSelf: 'center' }]} />
                            <Text style={this.props.righticontextStyle}>{this.props.righticon.righticontext}</Text>
                        </View>
                    }
                </View>
                {this.props.error?.length > 0 &&
                    < Text style={{ color: '#EF5350' }}> {this.props.error}</Text>}
            </View>
        )
    }
}

const stylesBlur = StyleSheet.create({
    label: {
        color: "grey",
        fontSize: 13,

    },
    input: {
        borderBottomColor: 'rgba(189, 189, 189,0.8)',
        flexWrap: 'wrap',
        color: 'black',
        fontSize: 17,
        paddingVertical: 4

    },
    icon: {
        color: "white",
        backgroundColor: 'rgba(84, 110, 122,0.7)',
        padding: 5
    },

})

const focussedColor = "rgba(66, 165, 245,1.0)";
const stylesFocus = StyleSheet.create({
    label: {
        color: focussedColor,
        fontSize: 13,
        fontWeight: '700'

    },
    input: {

        fontSize: 17,
        paddingVertical: 4

    },
    icon: {
        color: "white",
        backgroundColor: focussedColor,
        padding: 5
    },
    container: {
        borderColor: focussedColor,
        borderWidth: 1
    },
})