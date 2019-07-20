import React from 'react';
import { StyleSheet, View } from 'react-native';
import firebase from '../../Config/firebase';
import { Header, ListItem } from 'react-native-elements';


export default class CircleInfoScreen extends React.Component {
    constructor() {
        super()
        this.state = {
            isSignIn: false,
            user: null
        }
    }

    componentDidMount = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user != null) {
                this.setState({ isSignIn: true, user })
            }
        })
    }

    render() {
        const { isSignIn, user } = this.state
        const { selectedCircleInfo, selectedCircleInfoUsers } = this.props

            return (
                <View style={styles.container}>
                    <Header
                        backgroundColor="green"
                        leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => { this.props.back() } }}
                        centerComponent={{ text: selectedCircleInfo.circleName, color: '#fff' }}
                        rightComponent={{ icon: 'alarm', color: '#fff', onPress: () => { this.sendNotification } }}
                    />

                    <ListItem
                        title={selectedCircleInfo.circleCreaterName}
                        leftAvatar={{ source: { uri: selectedCircleInfo.circleCreaterPhoto } }}
                        subtitle={`Creater`}
                    />

                    {selectedCircleInfoUsers.map((value) => {
                       return <ListItem
                            title={value.userName}
                            leftAvatar={{ source: { uri: value.userProfilePic } }}
                            subtitle={`Member`}
                        />
                    })}

                </View>
            );
      
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
});
