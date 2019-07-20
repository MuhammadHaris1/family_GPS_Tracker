import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { SocialIcon } from 'react-native-elements';
import firebase from '../../Config/firebase'


export default class LoginScreen extends React.Component {
    constructor() {
        super()
        this.state = {

        }
    }

    async loginWithFacebook() {
        // console.log(this.props)
        try {
          const {
            type,
            token,
            expires,
            permissions,
            declinedPermissions,
          } = await Expo.Facebook.logInWithReadPermissionsAsync('1175035719336485', {
            permissions: ['public_profile', 'email'],
          });
          if (type === 'success') {
            // Get the user's name using Facebook's Graph API
            const credential = firebase.auth.FacebookAuthProvider.credential(token);
            firebase.auth().signInWithCredential(credential)
              .then((succes) => {
              
                
                console.log('success', succes)
              })
              .catch((error) => {
                // Handle Errors here.
              });
    
            const response = await fetch(`https://graph.facebook.com/me?feilds=id,name,email,birthday&access_token=${token}`);
            const userObj = await response.json()
            Alert.alert('Logged in!', `Hi ${userObj.name}!`);
            // console.log("NEWWW", userObj)
            // console.log("UIUIUIUIUIUIUIUIIUD",firebase.auth().currentUser.uid)
          } else {
            // type === 'cancel'
          }
        } catch ({ message }) {
          Alert.alert(`Facebook Login Error: ${message}`);
        }
      }
    

    render() {
        return (
            <View>
                <SocialIcon
                    onPress={this.loginWithFacebook}
                    type="facebook"
                    title="Sign In With Facebook"
                    button
                    
                />
                <SocialIcon
                    type="google"
                    title="Sign In With google"
                    button
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
