import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import firebase from './Config/firebase';
import { MapView } from 'expo'
import LoginScreen from './Components/LoginScreen';
import MapWithCurrentLoctaionAndProfilePic from './Components/Constants/MapWithCurrentLoctaionAndProfilePic'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isSignIn: false,
      user: null
    }
  }

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if(user != null){
        this.setState({ isSignIn: true, user})
      }
    })
  }
  
  logOut = () => {
    firebase.auth().signOut()
    this.setState({ isSignIn: false, user: null})
  }

  render() {
    const { isSignIn, user } = this.state
    return (
      <View style={styles.container}>
        {!isSignIn ? <LoginScreen /> : <MapWithCurrentLoctaionAndProfilePic logout={this.logOut} profilePhoto={user.photoURL} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
});
