import { Point } from './geometry';
import { Rectangle } from './geometry';

export interface Profile {
  cxFeet: number;
  cxGrid: number;
  cyFeet: number;
  cyGrid: number;
  focus: Point;
  origin: Point;
  title: string;
  zoom: number;
}

export const PROFILES: Record<string, Profile> = {
  lae: {
    cxFeet: 10560,
    cyFeet: 15840,
    cxGrid: 1320,
    cyGrid: 1320,
    focus: {
      lat: 43.15540545705978,
      lon: -72.15321792955824
    },
    origin: {
      lat: 43.17727946502029,
      lon: -72.17305139671191
    },
    title: 'LAE',
    zoom: 16
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
