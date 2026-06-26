"use client"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LocationMap from "@/components/LocationMap";
import type { ResourceWithLocation } from "@/schemas/zodSchema";
import LocationDetails from "../LocationDetails/LocationDetails";
import SearchBar from "../SearchBar/SearchBar";

const Map = () => {
    const [selectedItem, setSelectedItem] = useState<ResourceWithLocation | undefined>()

    const { data: locations = [] } = useQuery<ResourceWithLocation[]>({
        queryKey: ["locations"],
        queryFn: () => fetch("/api/locations").then((res) => res.json()),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row flex-1 min-h-0">
                <aside className="w-full md:w-1/4 md:max-w-125 shrink-0 gap-4">
                    <p>This is some left hand column content</p>
                    <SearchBar />
                    {selectedItem && <LocationDetails item={selectedItem} />}
                </aside>

                <div className="flex-1 min-w-0">
                    <LocationMap
                        onSelect={(item) => setSelectedItem(item as ResourceWithLocation)}
                        data={locations}
                    />
                </div>
            </div>
        </>
    )
}

export default Map;
