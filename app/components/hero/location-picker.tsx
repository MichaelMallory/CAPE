'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation: { lat: number; lng: number } | null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [lng, setLng] = useState(initialLocation?.lng || -74.006);
  const [lat, setLat] = useState(initialLocation?.lat || 40.7128);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: zoom,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    });

    marker.current = new mapboxgl.Marker({
      color: '#FF0000',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const position = marker.current?.getLngLat();
      if (position) {
        setLng(position.lng);
        setLat(position.lat);
        onLocationSelect(position.lat, position.lng);
      }
    });

    map.current.on('click', (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      marker.current?.setLngLat([lng, lat]);
      setLng(lng);
      setLat(lat);
      onLocationSelect(lat, lng);
    });

    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 