import React, { Component } from 'react';
import { Text, TextInput, View, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../assets/colors';
import { Icon } from 'native-base';
import { TouchableRipple } from 'react-native-paper';

export class Contacts extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            filteredList: [],
            filterString: '',
            isLoading: false,
            bgColor: '#EEEEEE'
        }
  
    }


    ContactItem = ({ item, index }) => {
        
        return (
            <View>
                <this.Seperator item={item} index={index}
                    previous={this.state.filteredList[index - 1] ? this.state.filteredList[index - 1] : undefined} />
                <TouchableRipple onPress={() => this.chat(item)}>
                    <View style={styles.item} >
                        {item.photoURL ?
                            <Image style={styles.Imglogo} resizeMethod='resize' source={{ uri: item.photoURL }} />
                            :
                            <Text style={[styles.logo, { backgroundColor: colors.B }]}>{item.displayName[0]}</Text>
                        }
                        <View style={{ paddingLeft: 5,width:'85%' }}>
                            <Text style={[styles.text]} numberOfLines={1} 
                            >{item.displayName[0].toUpperCase() + item.displayName.slice(1)}</Text>
                            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                        </View>
                    </View>
                </TouchableRipple>
            </View>

        )
    }

    ListFooter = () => {
        return (
            <Text style={{ color: 'grey', textAlign: 'center', marginVertical: 5 }}>
                {"- - - End - - -"}
            </Text>
        )
    }

    fetchAll = () => {
        this.setState({ isLoading: true })
        firestore().collection('users')
            .orderBy('displayName', 'asc')
            .get().then(async (snaps) => {
                if (!snaps.empty) {
                    snaps.docs.forEach((doc, index) => {
                        if (doc.data().uid == auth().currentUser.uid) {
                            snaps.docs.splice(index, 1);
                        }
                    });
                    snaps.docs.sort((a, b) => a.data().displayName.toLowerCase().localeCompare(b.data().displayName.toLowerCase()));

                    const contacts = snaps.docs.map((data, index) => { return { ...data.data() } });
                    this.setState({
                        contacts: contacts,
                        filteredList: contacts
                    });

                }
            })
            .finally(() => this.setState({ isLoading: false }));
    }

    Seperator({ item, index, previous }) {
        var seperator = null;

        let prev = previous?.displayName[0];
        let next = item.displayName[0];
        if (prev) {
            if (next.match(`[a-zA-Z]`) && next.toLowerCase() != prev.toLowerCase()) {
                seperator = next.toUpperCase();
            }
            else if (next.match(`[0-9]`) && !prev.match(`[0-9]`)) {
                seperator = "#";
            }
            else if (next.match(`[^0-9a-zA-Z]`) && !prev.match(`[^0-9a-zA-Z]`)) {
                seperator = "other";
            }
        } else {
            if (next.match(`[a-zA-Z]`)) {
                seperator = next.toUpperCase();
            }
            else if (next.match(`[0-9]`)) {
                seperator = "#";
            }
            else if (next.match(`[^0-9a-zA-Z]`)) {
                seperator = "other";
            }
        }

        return (
            seperator
                ?
                <Text style={{
                    color: 'grey', fontSize: 15, fontWeight: '700', padding: 5,
                    marginHorizontal: 20,
                    borderTopWidth: index != 0 ? 0.5 : 0,
                    borderTopColor: index != 0 ? 'rgba(66, 66, 66,0.3)' : 'rgba(66, 66, 66,0)'
                }}>
                    {seperator}
                </Text>
                : null
        )


    }

    filter = (filter) => {
        if (filter.trim() == '')
            this.setState({ filteredList: this.state.contacts })
        else {
            this.setState({
                filteredList: this.state.contacts
                    .filter((val) => val.displayName.toLowerCase().includes(filter.toLowerCase()))
            })
        }
    }

    componentDidMount() {
        this.fetchAll();

    }


    chat = (user) => {
        this.props.navigation.navigate('Chat', { receiver: user });
    }

    render() {

        return (
            <View style={{ marginBottom: 5, paddingTop: 10, flex: 1, backgroundColor: 'white' }}>
                <View style={[styles.search, { backgroundColor: this.state.bgColor }]}>
                    <Icon name='search' style={{ color: 'grey', }} />
                    <TextInput placeholder={this.state.filteredList.length + ' contacts in directory'} onFocus={() => this.setState({ bgColor: 'white' })}
                        value={this.state.filterString} onBlur={() => this.setState({ bgColor: '#EEEEEE' })}
                        onChangeText={(text) => {
                            this.setState({ filterString: text }, () => {
                                this.filter(text)
                            })
                        }}
                        style={{ paddingLeft: 10, flex: 1 }} />
                </View>
                {/* <Text style={{ color: 'grey', marginVertical: 5,marginBottom:10, marginLeft: 20 }}>{this.state.filteredList.length} contacts</Text> */}
                {this.state.isLoading ?
                    <ActivityIndicator size='large' style={{ top: 100 }} />
                    :
                    <FlatList data={this.state.filteredList}
                        refreshing={false}
                        getItemLayout={(data, index) => (
                            { length: 70, offset: 70 * index, index }
                        )}
                        onRefresh={() => { this.fetchAll() }}
                        keyExtractor={(item, index) => index.toString()}
                        style={{ backgroundColor: 'white' }}
                        // ListHeaderComponent={this.ListHeader}
                        ListFooterComponent={this.ListFooter}
                        renderItem={this.ContactItem}
                    />

                }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    item: {
        display: "flex",
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 20,

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
        width: 46,
        height: 46,
        borderRadius: 46 / 2,
    },
    text: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '700'
    },
    email: {
        marginLeft: 10,
        fontSize: 13,
        color: 'grey',
        fontWeight: '700'
    },
    search: {
        marginHorizontal: 10,
        paddingHorizontal: 20,
        marginBottom: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 7,
        borderRadius: 30,
        backgroundColor: 'white'
    }
})

