import React from 'react';
import { StyleSheet, View, Image, Modal, TouchableHighlight, TextInput, Alert } from 'react-native';
import { Constants, MapView, IntentLauncherAndroid, Location, Permissions, Notifications } from 'expo';
import firebase from '../../Config/firebase'
import { Button, Header, Input, ListItem, Text } from 'react-native-elements';
import { ActionButton } from 'react-native-material-ui'
import CircleInfoScreen from '../CircleInfoScreen';


export default class MapWithCurrentLoctaionAndProfilePic extends React.Component {
  constructor() {
    super()
    this.state = {
      location: null,
      errorMessage: null,
      user: null,
      coordsOfCurrentUser: null,
      data: null,
      dropDown: false,
      createCircleScreen: false,
      joinCircle: false,
      keysArr: [],
      key: '',
      circleName: '',
      circlesArr: [],
      modalVisible: false,
      secretKey: '',
      selectedCircleData: null,
      selectedCircleDataUsers: [],
      addScreen: false,
      allCirclesArr: [],
      circleInfoScreen: false,
      selectedCircleInfo: null,
      selectedCircleInfoUsers: [],
    }
    this.sendData = this.sendData.bind(this)
    this.selected = this.selected.bind(this)
    this.sendNotification = this.sendNotification.bind(this)
  }

  joinCircle = () => {
    const { secretKey, user, location } = this.state
    firebase.database().ref('/Circles/').on('child_added', snap => {
      var allCircles = snap.val()
      var key = snap.key
      if (secretKey === allCircles.secretKey && allCircles.circleCreaterUid !== user.uid ) {
        var obj = {
          userName: user.displayName,
          userUid: user.uid,
          userProfilePic: user.photoURL,
          coords: location.coords
        }
        firebase.database().ref(`/Circles/${key}/users/`).push(obj)
        this.setState({ secretKey: '', modalVisible: false })
      }
      else {
        alert('Room Secret key Is Not Available')
      }
    })
  }

  renderJoinScreen() {
    return (
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View style={{ marginTop: 22, alignContent: 'center', alignItems: 'center' }}>
            <View>
              <Text h3>Join Circle With Secret Key</Text>
              <TextInput placeholder="Enter Circle Key" onChangeText={(secretKey) => this.setState({ secretKey })} />
              <Button onPress={this.joinCircle} title="join circle" />
              <TouchableHighlight
                onPress={() => {
                  this.setState({ modalVisible: false })
                }}
                style={{ alignContent: 'center', alignContent: 'center', backgroundColor: 'red', textAlign: 'center', padding: 10 }}
              >
                <Text>Close</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  componentWillMount() {
    const { circlesArr, location, allCirclesArr } = this.state
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        this.setState({ user })
        firebase.database().ref('/users/' + user.uid + '/').on('child_added', snap => {
          var coordsOfCurrentUser = snap.val()
          coordsOfCurrentUser.key = snap.key
          // console.log(coordsOfCurrentUser)
          this.setState({ coordsOfCurrentUser, data: true })
          this._getLocationAsync();
          this.registerForPushNotificationsAsync()
        })
        firebase.database().ref('/Circles/').on('child_added', snap => {
          var circles = snap.val();
          // console.log('circles ===============', circles)
          circles.childKey = snap.key
          allCirclesArr.push(circles)
          this.setState({ allCirclesArr })
          var users = circles.users
          for (const key in users) {
            // console.log(key)
            if (location && users[key].userUid === user.uid) {
              firebase.database().ref(`/circles/${snap.key}/users/${key}/`).update(location)
            }
          }
          // console.log('users ===============', users)
          if (circles.circleCreaterUid === user.uid) {
            // console.log(circles)
            circlesArr.push(circles)
            this.setState({ circlesArr })
          }
        })

      }
    })

  }

  componentDidMount() {
    const { keysArr, user, circlesArr } = this.state
    firebase.database().ref('/circleKeys/').on('child_added', snap => {
      var keys = snap.val();
      keysArr.push(keys.key)
      this.setState({ keysArr })
    })


  }

  sendData() {
    const { location, user } = this.state
    var obj = {
      coords: location,
      uid: firebase.auth().currentUser.uid,
      name: firebase.auth().currentUser.displayName,
      photoUrl: firebase.auth().currentUser.photoURL

    }
    console.log('jkdahkjfdhskjf', obj)
    firebase.database().ref('/users/' + user.uid + '/').push(obj)

    this.setState({
      data: true
    })
  }

  backFromCircleInfoScreen = () => {
    this.setState({ selectedCircleInfo: null, selectedCircleInfoUsers: [], circleInfoScreen: false })
  }

  selected(selectedCircleData) {
    const { selectedCircleDataUsers } = this.state
    var user = selectedCircleData.users
    if (user) {
      for (var key in user) {
        selectedCircleDataUsers.push(user[key])
        this.setState({ selectedCircleData, selectedCircleDataUsers, dropDown: false })
      }
    }
    else {
      this.setState({
        selectedCircleDataUsers: [], selectedCircleData,
        dropDown: false
      })
    }

  }

  selectedCircleInfo(selectedCircleInfo) {
    const { selectedCircleInfoUsers } = this.state
    var user = selectedCircleInfo.users
    if (user) {
      for (var key in user) {
        selectedCircleInfoUsers.push(user[key])
        this.setState({ selectedCircleInfo, selectedCircleInfoUsers, circleInfoScreen: true })
      }
    }
    else {
      this.setState({
        selectedCircleInfoUsers: [], selectedCircleInfo,
        circleInfoScreen: true
      })
    }

  }

  renderCirecles = () => {
    const { circlesArr, allCirclesArr, user } = this.state
    console.log(circlesArr)
    return (
      <View>
        {circlesArr.map((value, i) => {
          return (
            <ListItem
              title={value.circleName}
              leftAvatar={{ source: { uri: value.circleCreaterPhoto } }}
              subtitle={`ID: ${value.secretKey}`}
              onPress={this.selected.bind(this, value)}
              rightIcon={{ name: 'settings', onPress: this.selectedCircleInfo.bind(this, value) }}
            />
          );
        })}
        {allCirclesArr.map(value => {
          console.log(value)
          var users = value.users
          for (const key in users) {
            if (users[key].userUid === user.uid) {
              return (
                <ListItem
                  title={value.circleName}
                  leftAvatar={{ source: { uri: value.circleCreaterPhoto } }}
                  subtitle={`Creater: ${value.circleCreaterName}`}
                  onPress={this.selected.bind(this, value)}
                  rightIcon={{ name: 'settings', onPress: this.selectedCircleInfo.bind(this, value) }}
                />
              );
            }
          }
        })}
      </View>
    )
  }



  _getLocationAsync = async () => {
    const { user, coordsOfCurrentUser, circlesArr } = this.state



    Location.getProviderStatusAsync()
      .then(status => {
        console.log('Getting status  ===>', status);
        if (!status.locationServicesEnabled) {

          IntentLauncherAndroid.startActivityAsync(
            IntentLauncherAndroid.ACTION_LOCATION_SOURCE_SETTINGS
          );

          throw new Error('Location services disabled');
        }

      })
      .then(_ => Permissions.askAsync(Permissions.LOCATION))
      .then(permissions => {
        console.log('Getting permissions');
        if (permissions.status !== 'granted') {
          throw new Error('Ask for permissions');
        }
      })
      .then(_ => {
        console.log('Have permissions');
        const subscriber = Location.watchPositionAsync({
          // timeInterval: 1000,
          distanceInterval: 0.5
        }, (location) => {
          console.log('Location change: ', location);
          firebase.database().ref(`/users/${coordsOfCurrentUser.uid}/${coordsOfCurrentUser.key}/`).update({ coords: location.coords })
          for (let index = 0; index < circlesArr.length; index++) {
            const element = circlesArr[index];
            if (element.circleCreaterUid === user.uid) {
              firebase.database().ref(`/Circles/${element.childKey}/`).update({ coords: location.coords })
            }
            var circleUsers = element.user
            for (const key in circleUsers) {
              if (circleUsers[key].userUid === user.uid) {
                firebase.database().ref(`/Circles/${element.childKey}/users/${key}/`).update({ coords: location.coords })
              }
            }
          }


          this.setState({ location })
        });
        this.setState({ subscriber });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          errorMessage: 'Permission to access location was denied',
        });
      });
    // this.setState({ location });
  };

  createCircle = () => {
    const { keysArr, key, circleName, user, location } = this.state;
    if (keysArr.includes(key)) {
      Alert.alert('this key is already use please type')
    }
    else {
      var obj = {
        circleCreaterPhoto: user.photoURL,
        circleCreaterName: user.displayName,
        circleCreaterUid: user.uid,
        circleCreaterEmail: user.email,
        circleName: circleName,
        secretKey: key,
        coords: location.coords
      }
      firebase.database().ref('/Circles/').push(obj)
      firebase.database().ref('/circleKeys/').push({ key })

      this.setState({ createCircleScreen: false, dropDown: false })
    }
  }

  renderCreateScreen() {
    return (
      <View style={{ alignContent: 'center', alignItems: 'center', flex: 1 }}>
        <Input onChangeText={circleName => this.setState({ circleName })} placeholder="Enter Circle Name" />
        <Input onChangeText={key => this.setState({ key })} placeholder="Enter Circle Key" />
        <Button title="Create Circle" onPress={this.createCircle} />
      </View>
    );
  }

  async registerForPushNotificationsAsync() {
    const { coordsOfCurrentUser, user, allCirclesArr, location } = this.state
    console.log('running runningrunning running')
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();

    firebase.database().ref(`/users/${user.uid}/${coordsOfCurrentUser.key}/`).update({ token })

    for (let index = 0; index < allCirclesArr.length; index++) {
      const circles = allCirclesArr[index];
      var circleUsers = circles.users
      if (circles.circleCreaterUid === user.uid) {
        firebase.database().ref(`/Circles/${circles.childKey}/`).update({ circleCreaterToken: token })
      }
      for (const key in circleUsers) {
        const circleUser = circleUsers[key];
        if (circleUser.userUid === user.uid) {
          firebase.database().ref(`/Circles/${circles.childKey}/users/${key}/`).update({ token, coords: location.coords })
        }
      }

    }

    console.log('token =====> ', token)

  }

  sendNotification() {
    const { selectedCircleData, user } = this.state;

    var createrToken = selectedCircleData.circleCreaterToken
    var users = selectedCircleData.users

    var usersToken = []
    var allToken = []
    var usersName = []
    var allUsersName = []

    for (const key in users) {
      const element = users[key];
      if (element.userUid !== user.uid) {
        // console.log(element)
        usersToken.push(element.token)
        usersName.push(element.userName)
      }
    }
    if (selectedCircleData.circleCreaterUid === user.uid) {
      allToken = [...usersToken]
      allUsersName = [...usersName]
    }

    if (selectedCircleData.circleCreaterUid !== user.uid) {
      allToken = [...usersToken, createrToken]
      allUsersName = [...usersName, selectedCircleData.circleCreaterName]
    }

    console.log('allToken allToken allToken', allToken)

    for (let index = 0; index < allToken.length; index++) {
      const tokens = allToken[index];
      const names = allUsersName[index]


      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: tokens,
          title: user.displayName,
          body: `my name is ${user.displayName} & I am in Danger Please help!`,
          data: {
            message: `My Name is ${user.displayName} & I am in Danger Please help!`
          }
        }),
      });
    }
  }

  render() {
    const { location, circleInfoScreen, data, createCircleScreen, user, selectedCircleData, selectedCircleDataUsers, selectedCircleInfo, selectedCircleInfoUsers } = this.state
    // console.log('circles keys', firebase.database().ref('/Circles/').child().key)
    return (
      <View style={styles.container}>
        {!circleInfoScreen ? <View style={{ flex: 1 }}>
          <Header
            backgroundColor="green"
            leftComponent={{ icon: !createCircleScreen ? 'menu' : 'arrow-back', color: '#fff', onPress: createCircleScreen ? () => { this.setState({ createCircleScreen: false }) } : () => this.props.logout() }}
            centerComponent={{ icon: 'expand-more', text: selectedCircleData && selectedCircleData.circleName, color: '#ffff', onPress: () => this.setState({ dropDown: !this.state.dropDown }) }}
            rightComponent={{ icon: selectedCircleData && 'alarm', color: '#fff', onPress: this.sendNotification }}
          />

          {this.state.dropDown && <View>
            {this.renderCirecles()}
            <View style={{ alignContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row' }} >
              <Button containerStyle
                ={{ width: 190, backgroundColor: 'lightgray' }} onPress={() => this.setState({ modalVisible: true })} buttonStyle={{ backgroundColor: 'lightgray', color: 'black' }} title="Join Circle" />
              <Button buttonStyle={{ backgroundColor: 'lightgray', color: 'black' }} onPress={() => this.setState({ createCircleScreen: true })} containerStyle={{ width: 190, backgroundColor: 'lightgray' }} title="Create Circle" />
            </View>
          </View>}

          {!data && <Button title="Get started" onPress={this.sendData} />}


          {location && data && !createCircleScreen && <MapView
            zoomEnabled
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {!selectedCircleData ? <MapView.Marker.Animated
              coordinate={this.state.location.coords}
              title={user.displayName}
              description="Some description"
              ref={marker => { this.marker = marker }}
              flat
              style={{
                transform: [{
                  rotate: location.coords.heading === undefined ? '0deg' : `${location.coords.heading}deg`
                }],

              }}
            >
              <Image
                style={{
                  height: 70,
                  width: 70,
                  borderRadius: 100,
                }}
                source={{ uri: this.props.profilePhoto }}
              />
            </MapView.Marker.Animated> : <MapView.Marker.Animated
              coordinate={selectedCircleData.coords}
              title={selectedCircleData.circleCreaterName}
              description="Some description"
              ref={marker => { this.marker = marker }}
              flat
              style={{
                transform: [{
                  rotate: selectedCircleData.coords.heading === undefined ? '0deg' : `${selectedCircleData.coords.heading}deg`
                }],

              }}
            >
                <Image
                  style={{
                    height: 70,
                    width: 70,
                    borderRadius: 100,
                  }}
                  source={{ uri: selectedCircleData.circleCreaterPhoto }}
                />
              </MapView.Marker.Animated>}
            {selectedCircleDataUsers.length > 0 && selectedCircleDataUsers.map((value, i) => {
              return (
                <MapView.Marker.Animated
                  coordinate={value.coords}
                  title={value.userName}
                  description="Some description"
                  ref={marker => { this.marker = marker }}
                  flat
                  style={{
                    transform: [{
                      rotate: value.coords.heading === undefined ? '0deg' : `${value.coords.heading}deg`
                    }],

                  }}
                >
                  <Image
                    style={{
                      height: 70,
                      width: 70,
                      borderRadius: 100,
                    }}
                    source={{ uri: value.userProfilePic }}
                  />
                </MapView.Marker.Animated>
              )
            })}
          </MapView>}
          {this.renderJoinScreen()}
          <ActionButton />
          {createCircleScreen && this.renderCreateScreen()}
        </View> : <CircleInfoScreen selectedCircleInfo={selectedCircleInfo} selectedCircleInfoUsers={selectedCircleInfoUsers} back={this.backFromCircleInfoScreen} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
