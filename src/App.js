import React, { useState, useEffect, useRef } from "react";
import MapGL, { Marker, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl";
import parkDate from "./data/skateboard-parks.json";
import 'mapbox-gl/dist/mapbox-gl.css';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';

export default function App() {
  // eslint-disable-next-line 
  const [lat, setLat] = useState([]);
  // eslint-disable-next-line 
  const [long, setLong] = useState([]);

  const [toggle, setToggle] = useState(false);
  const mapRef = useRef(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    });

    return () => {
      window.removeEventListener("message", () => { });
    };
  }, []);


  // map.current.flyTo({center:[0,0]})
  // alert(selectedPark.group)
  // Restrict map panning to an area
  const bounds = [
    [126.9044, 36.9083], //southwest address
    [127.1010, 37.0178] //northEast address
  ];

  window.addEventListener("message", message => {
    let getData = JSON.parse(message.data);
    
    if (getData.group === "bus") {
      setToggle(false);
    } else {
      if (getData.group === "facility") {
        window.ReactNativeWebView.postMessage(message.data);
      } else {
        parkDate.features.forEach(park => {
          if (park.properties.NAME === getData.properties.MALL) {
            let newob = park;
            newob.properties.list[getData.properties.index].isExpanded = true;
            window.ReactNativeWebView.postMessage(JSON.stringify(newob));
          }
        });
      }
      setToggle(true);
      setTimeout(()=>{
        mapRef.current?.flyTo({center: [getData.geometry.coordinates[0], getData.geometry.coordinates[1]],
        zoom: 16})
      },1000);
    }
  })

  return (
    <>
      <MapGL
        dragRotate={false}
        initialViewState={{
          latitude: 36.9672,
          longitude: 127.0133,
          width: "10vw",
          height: "10vh",
          zoom: 14,
          maxBounds: bounds
        }}
        ref={mapRef}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/quantum2021/cl4ikiamr000w15juomtzimvi"
        mapboxAccessToken="pk.eyJ1IjoicXVhbnR1bTIwMjEiLCJhIjoiY2w0YXdseHZoMGp0ZzNobzdhOXM2Z3hpdSJ9.cxMFsx7RUfspcEz-C7loCw" >
        <ScaleControl position="bottom-left" />
        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          position="bottom-right"
        />
        <NavigationControl position="bottom-right" showCompass={false} />
        <button className="toggle-btn" onClick={() => {
          setToggle(!toggle);
        }}>
          <div style={{
            borderRadius: 20,
            color: !toggle ? '#fff' : '#000',
            fontSize: 13,
            margin: 3,
            fontWeight: 'bold',
            backgroundColor: !toggle ? '#000' : '#fff',
            height: '75%',
          }}>
            Bus
          </div>
          <div style={{
            borderRadius: 20,
            color: toggle ? '#fff' : '#000',
            fontSize: 13,
            margin: 3,
            fontWeight: 'bold',
            backgroundColor: toggle ? '#000' : '#fff',
            height: '80%',
          }}>
            Facility
          </div>
        </button>

        {parkDate.features.map(park => {
          if (!toggle) {
            if (park.group === "bus") {
              return <Marker
                key={park.id}
                latitude={park.geometry.coordinates[1]}
                longitude={park.geometry.coordinates[0]}
              >
                <button
                  className="marker-btn"
                  onClick={e => {
                    e.stopPropagation();
                    window.ReactNativeWebView.postMessage(JSON.stringify(park))
                  }}
                >
                  <DirectionsBusIcon style={{ fontSize: 17, color: '#000' }} />
                  {/* <img src="busStop.png" alt="BusStop" className="busIcon" /> */}
                  <h4>{park.properties.NAME}</h4>
                </button>
              </Marker>;
            } else {
              return null;
            }
          } else {
            if (park.group !== "bus") {
              return <Marker
                key={park.id}
                latitude={park.geometry.coordinates[1]}
                longitude={park.geometry.coordinates[0]}
              >
                <button
                  className="marker-btn"
                  onClick={e => {
                    e.stopPropagation();
                    window.ReactNativeWebView.postMessage(JSON.stringify(park))
                  }}
                >
                  {park.group === "facility"
                    ? park.properties.TYPE === "Dining"
                      ? <LocalDiningOutlinedIcon style={{ fontSize: 17, color: '#000' }} />
                      : park.properties.TYPE === "Commissary"
                        ? <StoreOutlinedIcon style={{ fontSize: 17, color: '#000' }} />
                        : park.properties.TYPE === "Hotel"
                          ? <BedOutlinedIcon style={{ fontSize: 17, color: '#000' }} />
                          : park.properties.TYPE === "Gate"
                            ? <DoorSlidingOutlinedIcon style={{ fontSize: 17, color: '#000' }} />
                            : <PlaceOutlinedIcon style={{ fontSize: 17, color: '#000' }} />
                    : <LocalMallOutlinedIcon style={{ fontSize: 17, color: '#000' }} />}
                  <h4>{park.properties.NAME}</h4>
                </button>
              </Marker>
            } else {
              return null;
            }
          }
        }
        )}
      </MapGL>

    </>
  )


}