import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix icon leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function FlyToUser({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 17);
    }
  }, [map, position]); // Thêm position vào dependency

  return null;
}

function App() {
  const [places, setPlaces] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const lastPlaceRef = useRef(null);

  // 🔊 SPEAK - Dùng useCallback để hàm không bị tạo lại mỗi lần render
  const speak = useCallback((text, force = false) => {
    if (!isAudioEnabled && !force) return;

    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    window.speechSynthesis.speak(utterance);
  }, [isAudioEnabled]);

  // 📡 API - Xóa 'map' vì nó không tồn tại ở đây và không cần thiết
  useEffect(() => {
    fetch("http://localhost:5111/api/places")
      .then(res => res.json())
      .then(data => setPlaces(data))
      .catch(err => console.error(err));
  }, []); // Để mảng trống để chỉ chạy 1 lần khi load trang

  // 📍 GPS TRACKING
  useEffect(() => {
    if (!isAudioEnabled) return;

    // Định nghĩa getDistance bên trong hoặc dùng useCallback
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPos([lat, lng]);

        if (places.length === 0) return;

        const nearest = places.reduce((min, p) => {
          const dist = getDistance(lat, lng, p.latitude, p.longitude);
          if (!min || dist < min.distance) {
            return { place: p, distance: dist };
          }
          return min;
        }, null);

        if (!nearest) return;

        const p = nearest.place;
        const distance = nearest.distance;

        if (distance < 0.03) {
          if (lastPlaceRef.current !== p.id) {
            speak(`Bạn đang đến ${p.name}. ${p.description}`);
            lastPlaceRef.current = p.id;
          }
        } else {
          lastPlaceRef.current = null;
        }
      },
      (err) => console.error("GPS lỗi:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [places, isAudioEnabled, speak]); // Thêm speak vào dependency

  return (
    <div>
      <h1>Food Map 🍜</h1>
      <button
        onClick={() => {
          setIsAudioEnabled(true);
          speak("Đã bật thuyết minh", true);
        }}
        style={{
          marginBottom: "10px",
          padding: "10px",
          background: "green",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        🔊 Bật thuyết minh
      </button>

      <MapContainer
        center={[10.7769, 106.7009]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]}>
            <Popup>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>💰 {p.price_range}</p>
            </Popup>
          </Marker>
        ))}

        {userPos && (
          <>
            <Marker position={userPos}>
              <Popup>Bạn đang ở đây 📍</Popup>
            </Marker>
            <FlyToUser position={userPos} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default App;