import { useState } from "react";
import ResourceMap from "../ResourceMap/ResourceMap";
import resourceData from "../resourcedata";
import type { ResourceItemType } from "../schema";
import ResourceDetails from "../ResourceDetails/ResourceDetails";

const Map = () => {
    const [selectedItem, setSelectedItem] = useState<ResourceItemType | undefined>()

    return (
        <>
            <h2>Food Map</h2>
            <div style={{display: 'flex', flexDirection: 'row'}}>
            <ResourceMap
                onSelect={(item: ResourceItemType) => setSelectedItem(item)}
                data={resourceData}
            />
            {selectedItem &&
                <ResourceDetails item={selectedItem} />
            }
            </div>
        </>
    )
}

export default Map;