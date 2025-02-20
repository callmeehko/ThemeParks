import { rgbToHex } from '~/types/RGBHex'
import { H3Event } from 'h3';
import { ThemeParkHour, ThemeParkRide } from './ThemePark';

export enum WaltDisneyWorldParkID {
    Magic_Kingdom = 80007944,
    Epcot = 80007838,
    Hollywood_Studios = 80007998,
    Animal_Kingdom = 80007823
}

export enum WaltDisneyWorldResortID {
    Magic_Kingdom = 80007798,
    Epcot = 80007798,
    Hollywood_Studios = 80007798,
    Animal_Kingdom = 80007798
}

export enum WaltDisneyWorldParkSlug {
    Magic_Kingdom = "magickingdompark",
    Epcot = "epcot",
    Hollywood_Studios = "disneyshollywoodstudios",
    Animal_Kingdom = "disneysanimalkingdomthemepark",
}

export function toDisneyWorld(park: WaltDisneyWorldParkID, resort?: WaltDisneyWorldResortID) : string {
    return `/theme-parks/${park}/`
}

export function RGBDisneyToHex(s: string) : null | string {
    const regex = /color:\s*([^;]+)/;
    const match = s.match(regex);
    let sw: any = match ? match[1].trim() : null;
    sw = sw.replace("rgb(", "").replace(")", "").split(", ")
    let ns: Array<Number> = [];
    sw.forEach(n => {
        ns.push(Number(n))
    })
    return rgbToHex(ns);
}

// this seems to be more than just WDW.
export async function generateDisneyAuthenticationCode(event: H3Event) : Promise<any> {
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_AUTH, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': '*/*'
        },
        body: "grant_type=assertion&assertion_type=public&client_id=WDPRO-MOBILE.MDX.WDW.ANDROID-PROD"
    })

    return data.access_token;
}

export async function generateWDW(event: H3Event, park: WaltDisneyWorldParkID) : Promise<any> {
    const code: any = await generateDisneyAuthenticationCode(event);
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_FACILITY + toDisneyWorld(park), {
        method: 'GET',
        headers: {
            'X-App-Id': 'WDW-MDX-ANDROID-3.4.1',
            'User-Agent': "WDPRO-MOBILE.MDX.WDW.ANDROID-PROD",
            'Authorization': `Bearer ${code}`,
            'Accept': '*/*'
        }
    })

    return data;
}

export async function generateWDWSchedule(event: H3Event, park: WaltDisneyWorldParkID) : Promise<any> {
    const code: any = await generateDisneyAuthenticationCode(event);
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_FACILITY + '/schedules/' + park, {
        method: 'GET',
        headers: {
            'X-App-Id': 'WDW-MDX-ANDROID-3.4.1',
            'User-Agent': "WDPRO-MOBILE.MDX.WDW.ANDROID-PROD",
            'Authorization': `Bearer ${code}`,
            'Accept': '*/*'
        }
    })

    const schedule = data["schedules"].filter(date => date.type === "Operating");
    const newSchedule: ThemeParkHour[] = [];

    schedule.forEach(date => {
        const openTime = new Date(`${date.date}T${date.startTime}`).getTime() / 1000;
        const closeTime = new Date(`${date.date}T${date.endTime}`).getTime() / 1000;
        newSchedule.push({
            date: date.date,
            openTime: openTime,
            closeTime: closeTime,
        })
    });


    return newSchedule;
}

export async function generateWDWRides(event: H3Event, park: WaltDisneyWorldParkSlug) : Promise<any> {
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_RIDES + park + '/children');
    const rides: any = data["children"].filter(ride => ride.entityType === "ATTRACTION");

    const newRides: ThemeParkRide[] = [];

    

    return rides;
}