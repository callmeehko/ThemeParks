interface ParkRegion {
    name: string;
    mainid: string;
    ids: string[];
}

export default eventHandler((event) => {

    let regions: ParkRegion[] = [
        {
            name: "Walt Disney World",
            mainid: "wdw",
            ids: ["ak", "epcot", "hs", "mk"]
        },
        {
            name: "Universal Orlando Resort",
            mainid: "uor",
            ids: ["usf", "ioa"]
        },
    ]

    return regions;
})