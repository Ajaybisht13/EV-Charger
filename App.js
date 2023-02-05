import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ViewShot from "react-native-view-shot";
import Icon from 'react-native-vector-icons/FontAwesome';
import Icons from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import axios from 'axios';

const locationData = require("./src/location.json");

const App = () => {

  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState();

  const ref = useRef();

  useEffect(() => {
    getCurrentLocation();
  }, [])

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    })
  }

  const screenShot = () => {
    ref.current.capture().then(async (uri) => {
      await CameraRoll.save(uri, 'photo');
      setImage(uri.replace("file://", ""));
    });
    let formdata = new FormData();
    formdata.append("file", image);
    let obj = {
      "file": formdata ,
    }

    console.log(obj);
    axios.post("http://3.7.20.173:8503/api/upload/", obj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => {
      console.log(response.data);
    })
  }

  return (
    <View style={styles.MainContainer}>
      <ViewShot ref={ref}
        options={{ fileName: "Screenshot", format: "webm", quality: 0.9 }}
        style={styles.mapStyle}
      >
        <MapView
          style={styles.mapStyle}
          showsUserLocation={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: latitude, longitude: longitude }}
            onPress={() => setVisible(true)}
            pinColor={"#C71585"}
          />
        </MapView>
        <TouchableOpacity
          onPress={() => screenShot()}
          style={styles.floatIcon}>
          <Icon name="camera" size={22} color="black" />
        </TouchableOpacity>
        {
          visible == false ?
            null :
            <View
              style={styles.data}>
              <View style={{ padding: "6%" }}>
                {
                  locationData.chargers.map((item) => {
                    return (
                      <View key={item.id} style={{ width: "95%" }}>
                        <View style={styles.chargers}>
                          <View>
                            <Text style={styles.fontColor}>{item.name.slice(0, 25) + "..."}</Text>
                            <View style={{ display: "flex", flexDirection: "row", marginTop: "2%" }}>
                              <Text style={styles.fontColor}>{item.address}</Text>
                              <Text style={{ marginLeft: "5%", color: "#C71585", fontWeight: "bold" }}>{item.distance}</Text>
                            </View>
                          </View>
                          <View>
                            <Icon name="location-arrow" size={22} color="#C71585" />
                          </View>
                        </View>
                        <View style={{ marginTop: "2%" }}>
                          <Text style={styles.fontColorHead}>SUPPORTED CONNECTORS</Text>
                          {
                            item.connector_types.map((type, i) => {
                              return (
                                <View style={styles.connector_types}>
                                  <View>
                                    <View style={styles.station}>
                                      <Icons name="charging-station" size={22} color="white" />
                                      <View style={{ marginLeft: "10%" }}>
                                        <Text style={styles.fontColor}>{type.level}</Text>
                                        <Text style={styles.fontColorHead}>{type.chargingCapacity}</Text>
                                      </View>
                                    </View>
                                  </View>
                                  <Text style={styles.fontColor}>X{type.quantity}</Text>
                                </View>
                              )
                            })
                          }
                        </View>
                      </View>
                    )
                  })
                }
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  style={{ alignSelf: "center" }}>
                  <MaterialIcons name="keyboard-arrow-down" size={40} color="white" />
                </TouchableOpacity>
              </View>
            </View>
        }
      </ViewShot>
    </View>

  );
}

const styles = StyleSheet.create({
  MainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatIcon: {
    flex: 1,
    position: 'absolute',
    backgroundColor: "white",
    borderRadius: 50,
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    bottom: "15%",
    right: "8%"
  },
  data: {
    position: "absolute",
    backgroundColor: '#131313',
    width: "88%",
    alignSelf: "center",
    bottom: "4%",
    borderRadius: 20,
  },
  connector_types: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "3%",
    alignItems: "center"
  },
  station: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  chargers: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  fontColor: {
    color: "white",
    fontWeight: "bold"
  },
  fontColorHead: {
    color: "#18a558",
    fontWeight: "bold"
  }
});

export default App