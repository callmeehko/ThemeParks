interface ParkRegion {
    name: string;
    ids: string[];
}

export default eventHandler((event) => {

    let regions: ParkRegion[] = [
        {
            name: "Walt Disney World",
            ids: ["ak", "epcot", "hs", "mk"]
        },
        {
            name: "Universal Orlando Resort",
            ids: ["usf", "ioa"]
        },
    ]

    return regions;
})