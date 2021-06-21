export interface Profile {
  cxFeet: number;
  cxGrid: number;
  cyFeet: number;
  cyGrid: number;
  left: number;
  title: string;
  top: number;
  zoom: number;
}

export const PROFILES: Record<string, Profile> = {
  lae: {
    cxFeet: 10560,
    cyFeet: 15840,
    cxGrid: 1320,
    cyGrid: 1320,
    left: -72.173346,
    top: 43.178273,
    title: 'LAE',
    zoom: 16
  }
};

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const R_EARTH = 20902000; // feet

export function bbox(profile: Profile): { bottom; left; right; top } {
  // @ see https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters
  return {
    bottom: profile.top - (profile.cyFeet / R_EARTH) * RAD2DEG,
    left: profile.left,
    right:
      profile.left +
      ((profile.cxFeet / R_EARTH) * RAD2DEG) / Math.cos(profile.top * DEG2RAD),
    top: profile.top
  };
}
