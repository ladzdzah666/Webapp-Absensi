import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';

interface LocationStatusProps {
  currentLocation: GeolocationPosition | null;
  isWithinOfficeRadius: () => boolean;
  locationError?: GeolocationPositionError | null;
  officeDistance?: number | null;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  currentLocation,
  isWithinOfficeRadius,
  locationError = null,
  officeDistance = null,
}) => {
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (currentLocation?.coords?.accuracy) {
      setAccuracy(Math.round(currentLocation.coords.accuracy));
    }
  }, [currentLocation]);

  const isInside = isWithinOfficeRadius();

  return (
    <div className="glass-panel p-2.5 sm:p-3 rounded-2xl border border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
      {/* Status & Jarak */}
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
          locationError
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : !currentLocation
            ? 'bg-slate-800/80 border-slate-700 text-slate-400 animate-pulse'
            : isInside
            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-glow-emerald'
            : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
        }`}>
          {locationError ? (
            <AlertTriangle className="w-4 h-4" />
          ) : isInside ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        <div>
          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
            <span>
              {locationError
                ? `GPS: ${locationError.message}`
                : !currentLocation
                ? 'Mencari sinyal koordinat GPS...'
                : isInside
                ? 'Dalam Area Radius Kantor'
                : 'Di Luar Area Kantor'}
            </span>
            {currentLocation && (
              <span className={`w-2 h-2 rounded-full inline-block ${
                isInside ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`} />
            )}
          </p>

          <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
            {officeDistance !== null && (
              <span>
                Jarak:{' '}
                <strong className={isInside ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {officeDistance > 1000
                    ? `${(officeDistance / 1000).toFixed(2)} km`
                    : `${Math.round(officeDistance)} meter`}
                </strong>
              </span>
            )}
            {accuracy !== null && (
              <>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-amber-300/90">
                  <Radio className="w-3 h-3 text-amber-400" />
                  Akurasi: ~{accuracy}m
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Indikator Status GPS */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 ${
          isInside 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
        }`}>
          <Navigation className="w-2.5 h-2.5 rotate-45" />
          <span>{isInside ? 'Siap Presensi' : 'Dekati Kantor'}</span>
        </span>
      </div>
    </div>
  );
};

export default LocationStatus;