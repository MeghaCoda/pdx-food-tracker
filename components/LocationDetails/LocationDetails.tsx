import type { ResourceWithLocation } from "@/schemas/zodSchema";

interface LocationDetailsProps {
    item: ResourceWithLocation
}

const LocationDetails = ({ item }: LocationDetailsProps) => {
    const loc = item.physical_location;
    return (
        <div className="Location-wrapper">
            <p>{item.name}</p>
            {item.description && <p>{item.description}</p>}
            <p>{loc.address}</p>
            {loc.address2 && <p>{loc.address2}</p>}
            <p>{`${loc.city}, ${loc.state} ${loc.zip_code}`}</p>
            {loc.phone_number && <p>Phone Number: {loc.phone_number}</p>}
            {loc.neighborhood && <p>Neighborhood: {loc.neighborhood}</p>}
        </div>
    )
}

export default LocationDetails;
