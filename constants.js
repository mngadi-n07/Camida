import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';
export const bucketUrl = "https://s3.eu-north-1.amazonaws.com/cami-pic-qn.23/image/"

export const shops = new Map([
    ["Checkers",require("./assets/images/Checkers.jpg")],
    ["Clicks",require("./assets/images/Clicks.png")],
    ["Dischem",require("./assets/images/Dischem.jpg")],
    ["Makro",require("./assets/images/Makro.png")],
    ["Pick n Pay",require("./assets/images/pnp.png")],
    ["Shoprite",require("./assets/images/Shoprite.png")],
    ["Spar",require("./assets/images/Spar.png")],
    ["TFG",require("./assets/images/tfg.jpg")],
    ["Woolworths",require("./assets/images/Woolies.jpg")],
]);


export const primaryColor = "#FF7E1D";
export const secondaryColor = "#FFF8F0";
export const prodUnitId = __DEV__ ? TestIds : Platform.select({
      ios: 'ca-app-pub-7842144803620791/8108748209',
      android: 'ca-app-pub-7842144803620791/5494589930',
    });