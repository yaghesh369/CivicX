import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(event) {
      setPosition([event.latlng.lat, event.latlng.lng])
      map.flyTo(event.latlng, map.getZoom())
    },
  })

  return position ? <Marker position={position} icon={markerIcon} /> : null
}

export default function MapPicker({ position, setPosition }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <MapContainer
        center={position || [19.076, 72.8777]}
        zoom={14}
        scrollWheelZoom
        className="h-64 w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  )
}
