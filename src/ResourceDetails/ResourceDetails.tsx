import type { ResourceItemType } from "../schema"

interface ResourceDetailsProps {
    item: ResourceItemType
}

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;


const ResourceDetails = ({ item}: ResourceDetailsProps) => {
    return (
        <div className="resource-wrapper">
            <h3>{item.name}</h3>
            <p>{item.address}</p>
            {item.address2 && <p>{item.address2}</p>}
            <p>{`${item.city}, ${item.state} ${item.zipCode}`}</p>
            <p>Phone Number: {item.phoneNumber}</p>
            <p>Offer Description: {item.offerDesc}</p>
            <p>Offer Source: {item.offerSource}</p>
            <p>Do you have to be eligible for SNAP? {item.snapRequired ? "yes" : "no"}</p>
            <p>website: <a target="_blank">{item.website}</a></p>
            {item.donationLink && <p>Donation Link: <a target="_blank">{item.donationLink}</a></p>}
            {item.volunteerLink && <p>Volunteer Link: <a target="_blank">{item.volunteerLink}</a></p>}
            <p>Delivery Available? {item.deliveryAvailable ? "yes" : "no"}</p>
            <p>Hours: {JSON.stringify(item.hours)}</p>
            <p>Offer last verified: {item.infoLastVerified}</p>
            <p>Info last updated: {item.lastUpdated}</p>
        </div>
    )
}

export default ResourceDetails;