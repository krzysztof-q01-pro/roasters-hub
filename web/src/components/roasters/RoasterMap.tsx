"use client";

import { useSyncExternalStore } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface MapRoaster {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  image?: string;
  verified: boolean;
}

interface MapCafe {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

// Custom brown pin icon for roasters
const roasterIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    background: #974400;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(151,68,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
  ">&#9749;</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// Custom orange/amber pin icon for cafes
const cafeIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    background: #f97316;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(249,115,22,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
  ">&#9787;</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

export function RoasterMap({ roasters, cafes = [] }: { roasters: MapRoaster[]; cafes?: MapCafe[] }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
        <p className="text-on-surface-variant/60 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[48, 10]}
      zoom={4}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {roasters.map((roaster) => (
        <Marker key={roaster.id} position={[roaster.lat, roaster.lng]} icon={roasterIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <h4 className="font-bold text-sm mb-1">{roaster.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{roaster.city}, {roaster.country}</p>
              {roaster.verified && (
                <span className="inline-block bg-green-700 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-2">
                  Verified
                </span>
              )}
              <br />
              <Link href={`/roasters/${roaster.slug}`} className="text-xs text-orange-700 font-medium hover:underline">
                View Profile &rarr;
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {cafes.map((cafe) => (
        <Marker key={cafe.id} position={[cafe.lat, cafe.lng]} icon={cafeIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <h4 className="font-bold text-sm mb-1">{cafe.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{cafe.city}, {cafe.country}</p>
              <Link href={`/cafes/${cafe.slug}`} className="text-xs text-orange-500 font-medium hover:underline">
                View Cafe &rarr;
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
