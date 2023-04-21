import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "700px",
  height: "300px",
};

function MapComponent({ trip }) {
  const { isLoaded } = useJsApiLoader({
    id: '6dd1b6720588ad3a',
    googleMapsApiKey: 'AIzaSyA4GiNhPzyhXS98_ziVHrQLimw8VILXUuk',
  });

  const center = {
    lat: Number(trip.start_lat),
    lng: Number(trip.start_lng),
  };

  const [map, setMap] = React.useState(null);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onUnmount={onUnmount}
    >
      <Marker position={center}></Marker>
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MapComponent);
