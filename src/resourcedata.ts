import type { ResourceItemType } from "./schema";

const emptyResourceItem: ResourceItemType = {
id: 0,
name: '',
address: '',
address2: '',
city: '',
state: '',
zipCode: '',
latLon: [0, 0],
offerDesc: '',
offerSource: '',
snapRequired: false,
donationLink: '',
deliveryAvailable: false,
volunteerLink: '',
website: '',
phoneNumber: '',
hours: {
    monday: [{start: '00:00', end: '00:01'}],
    tuesday: [{start: '00:00', end: '00:01'}],
    wednesday: [{start: '00:00', end: '00:01'}],
    thursday: [{start: '00:00', end: '00:01'}],
    friday: [{start: '00:00', end: '00:01'}],
    saturday: [{start: '00:00', end: '00:01'}],
    sunday: [{start: '00:00', end: '00:01'}],
 },
infoLastVerified: 'Nov 4, 2025',
lastUpdated: 'Nov 4, 2025',
notes: ''
};

const resourceData: ResourceItemType[] = [
    {
        id: 1,
        name: 'Heretic Coffee Co.',
        address: '5120 SE 28th Ave',
        address2: '',
        city: 'Portland',
        state: 'OR',
        zipCode: '97202',
        latLon: [45.485814, -122.637107],
        offerDesc: "If you are losing your snap benefits and are unsure how to feed your family, then breakfast is on us.",
        snapRequired: false,
        offerSource: 'https://www.instagram.com/p/DQQOlszjwWg/',
        website: 'https://hereticcoffee.com/',
        donationLink: '',
        deliveryAvailable: false,
        hours: {
            monday: [{ start: '08:00', end: '14:00'}],
            tuesday: [{ start: '08:00', end: '14:00'}],
            wednesday: [{ start: '08:00', end: '14:00'}],
            thursday: [{ start: '08:00', end: '14:00'}],
            friday: [{ start: '08:00', end: '14:00'}],
            saturday: [{ start: '09:30', end: '14:00'}],
            sunday: [{ start: '09:30', end: '14:00'}],
         },
         phoneNumber: 5555555555,
         volunteerLink: 'https://hereticcoffee.com/pages/volunteer',
        infoLastVerified: 'Nov 4, 2025',
        lastUpdated: 'Nov 4, 2025',
        notes: ''
        },
        {
            id: 2,
            name: `Nan's Taqueria`,
            address: '15640 SE Happy Valley Town Center Dr',
            address2: '',
            city: 'Happy Valley',
            state: 'OR',
            zipCode: '97086',
            latLon: [45.427485, -122.499275],
            offerDesc: 'Email nansvillagepdx@gmail.com. Tell us how many people are in your family (including number of adults and children), when you need to pick it up, and any allergy restrictions you have. We will provide meals for the whole family, plus whatever else we can offer from donations. We will treat it like a to go order, with pickup or delivery available, free of charge and no questions asked.',
            deliveryAvailable: true,
            offerSource: 'https://www.instagram.com/p/DQe9n45klFw/',
            snapRequired: false,
            donationLink: 'https://linktr.ee/nanstaqueria',
            website: 'https://linktr.ee/nanstaqueria',
            hours: {
                monday: [{start: '00:00', end: '00:01'}],
                tuesday: [{start: '00:00', end: '00:01'}],
                wednesday: [{start: '00:00', end: '00:01'}],
                thursday: [{start: '00:00', end: '00:01'}],
                friday: [{start: '00:00', end: '00:01'}],
                saturday: [{start: '00:00', end: '00:01'}],
                sunday: [{start: '00:00', end: '00:01'}],
             },
            phoneNumber: 9712183175,
            infoLastVerified: 'Nov 4, 2025',
            lastUpdated: 'Nov 4, 2025',
            notes: ''
        }
    ]

export {
    emptyResourceItem
};
export default resourceData;