import React from 'react';
import { MapView, Location, Permissions } from 'expo';
import {
  Dimensions,
  Text,
  Button
} from 'react-native'

const { width, height } = Dimensions.get("window")
const SCREEN_WIDTH = width
const SCREEN_HEIGHT = height
const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

class App extends React.Component {

  state = {
    mapRegion: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0
    },
    hasLocationPermissions: false,
    locationResult: null,
    mapType: 'standard'
  };

  componentDidMount() {
    this.getLocationAsync();
  }

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permissão negada à Localização',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }

    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    this.setState({ locationResult: JSON.stringify(location) });

    this.setState({
      mapRegion: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    });
  };

  setLiveLocation = event => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const mapRegion = { ...this.state.mapRegion }
    this.setState({
      mapRegion: {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: mapRegion.latitudeDelta,
        longitudeDelta: mapRegion.longitudeDelta
      }
    });
    if (this.state.mapRegion &&
      this.state.mapRegion.latitude &&
      this.state.mapRegion.longitude
    ) {
      this.goToCurrentLocation();
    }
  };

  goToCurrentLocation = () => {
    const { mapRegion } = this.state;
    this.map.animateToRegion({
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
      latitudeDelta: mapRegion.latitudeDelta,
      longitudeDelta: mapRegion.longitudeDelta
    });
  }

  changeMapType = () => {
    this.setState((prevState) => ({ mapType: prevState.mapType === 'standard' ? 'satellite' : 'standard' }));
  }

  render() {
    if (this.state.locationResult === null) {
      return <Text>Procurando a sua localização...</Text>
    }
    if (this.state.hasLocationPermissions === false) {
      return <Text>Acesso a localização não permitido. Altere suas configurações.</Text>
    }
    return (
      <>
        <MapView
          style={{ flex: 1 }}
          region={this.state.mapRegion}
          ref={map => { this.map = map }}
          onUserLocationChange={this.setLiveLocation}
          mapType={this.state.mapType}
          showsUserLocation
          loadingEnabled
        />
        <Button
          onPress={this.changeMapType}
          title="Mudar tipo de Mapa"
        />
      </>
    )
  }
}

export default App;

