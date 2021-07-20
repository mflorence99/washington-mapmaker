import { Point } from './geometry';
import { Rectangle } from './geometry';

export interface Profile {
  cxFeet: number;
  cxGrid: number;
  cyFeet: number;
  cyGrid: number;
  focus?: Point;
  origin: Point;
  scale?: {
    cxFeet: number;
    interval: number;
    markers: [number, number, number];
  };
  title?: string;
  zoom: number;
}

export const PROFILES: Record<string, Profile> = {
  center: {
    cxFeet: 15840,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.17667538633558, lon: -72.09721948987017 },
    origin: { lat: 43.18490951655938, lon: -72.13330520983168 },
    scale: {
      cxFeet: 2000,
      interval: 100,
      markers: [0, 1000, 2000]
    },
    title: 'Town Center',
    zoom: 17
  },

  east: {
    cxFeet: 10560,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.190664952045644, lon: -72.0190973722202 },
    origin: { lat: 43.21047135814069, lon: -72.04833282823988 },
    scale: {
      cxFeet: 2000,
      interval: 100,
      markers: [0, 1000, 2000]
    },
    title: 'East Washinghton',
    zoom: 17
  },

  highland: {
    cxFeet: 15840,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.14520867564755, lon: -72.08866837438943 },
    origin: { lat: 43.157376566018925, lon: -72.10798515673109 },
    scale: {
      cxFeet: 2000,
      interval: 100,
      markers: [0, 1000, 2000]
    },
    title: 'Highland Lake',
    zoom: 17
  },

  island: {
    cxFeet: 10560,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.17540728708604, lon: -72.06443744223708 },
    origin: { lat: 43.188444997708324, lon: -72.07845939989515 },
    scale: {
      cxFeet: 2000,
      interval: 100,
      markers: [0, 1000, 2000]
    },
    title: 'Island Pond',
    zoom: 17
  },

  lae: {
    cxFeet: 10560,
    cyFeet: 15840,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.149317638444955, lon: -72.13877930259163 },
    origin: { lat: 43.17727946502029, lon: -72.17305139671191 },
    scale: {
      cxFeet: 2000,
      interval: 100,
      markers: [0, 1000, 2000]
    },
    title: 'LAE',
    zoom: 17
  },

  // NOTE: just used for thumbnail
  sullivan: {
    cxFeet: 158400,
    cyFeet: 211200,
    cxGrid: 52800,
    cyGrid: 52800,
    origin: {
      lat: 43.634458,
      lon: -72.504642
    },
    zoom: 11
  },

  nh: {
    cxFeet: 654720,
    cyFeet: 1056000,
    cxGrid: 52800,
    cyGrid: 52800,
    origin: {
      lat: 45.439295,
      lon: -72.970874
    },
    zoom: 9
  }
};

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const R_EARTH = 20902000; // feet

export function bbox(profile: Profile): Rectangle {
  // @ see https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters
  return {
    bottom: profile.origin.lat - (profile.cyFeet / R_EARTH) * RAD2DEG,
    left: profile.origin.lon,
    right:
      profile.origin.lon +
      ((profile.cxFeet / R_EARTH) * RAD2DEG) /
        Math.cos(profile.origin.lat * DEG2RAD),
    top: profile.origin.lat
  };
}
