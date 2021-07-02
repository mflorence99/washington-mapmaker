import { Point } from './geometry';
import { Rectangle } from './geometry';

export interface Profile {
  cxFeet: number;
  cxGrid: number;
  cyFeet: number;
  cyGrid: number;
  focus?: Point;
  origin: Point;
  title?: string;
  zoom: number;
}

export const PROFILES: Record<string, Profile> = {
  center: {
    cxFeet: 15840,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.17364718386878, lon: -72.09850695019732 },
    origin: { lat: 43.18490951655938, lon: -72.13330520983168 },
    title: 'Town Center',
    zoom: 17
  },

  east: {
    cxFeet: 10560,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.19207281777971, lon: -72.02382878892247 },
    origin: { lat: 43.21047135814069, lon: -72.04833282823988 },
    title: 'East Washinghton',
    zoom: 17
  },

  highland: {
    cxFeet: 15840,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.13539201633708, lon: -72.07166316923501 },
    origin: { lat: 43.157376566018925, lon: -72.10798515673109 },
    title: 'Highland Lake',
    zoom: 17
  },

  island: {
    cxFeet: 10560,
    cyFeet: 10560,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.169945926164075, lon: -72.0709605745613 },
    origin: { lat: 43.188444997708324, lon: -72.07845939989515 },
    title: 'Island Pond',
    zoom: 17
  },

  lae: {
    cxFeet: 10560,
    cyFeet: 15840,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: { lat: 43.144269475682684, lon: -72.14602126693184 },
    origin: { lat: 43.17727946502029, lon: -72.17305139671191 },
    title: 'LAE',
    zoom: 17
  },

  // NOTE: just used for thumbnail
  thumbnail: {
    cxFeet: 158400,
    cyFeet: 211200,
    cxGrid: 52800,
    cyGrid: 52800,
    origin: {
      lat: 43.634458,
      lon: -72.504642
    },
    zoom: 11
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
