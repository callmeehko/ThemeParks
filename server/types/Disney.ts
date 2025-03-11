export interface DisneyAuthResponse {
    access_token: string;
    expires_in: number;
}

export interface DisneyScheduleData {
    date: string;
    startTime: string;
    endTime: string;
    type: string;
}

export interface DisneyQueueData {
    STANDBY?: {
        waitTime: number;
    };
}

export interface DisneyRideData {
    name: string;
    status: string;
    entityType: string;
    queue: DisneyQueueData;
}

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