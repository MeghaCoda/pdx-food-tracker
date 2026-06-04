import { Link } from "react-router-dom"
import { URLS } from "./constants";

const Home = () => {
    return (
        <div>
            <h1>PDX Food Tracker</h1>
            <p>
                This site is to be a community-maintained resource where people in the Portland, Oregon metro area can locate free food. It includes restaurants offering free food during the November 2025 government shutdown as well as ongoing offerings from local pantries and businesses.

                Is this site missing an offer? <Link to={URLS.CONTACT}>Let me know!</Link>
            </p>
            <Link to={URLS.MAP}>See Map</Link>
            <Link to={URLS.LIST}>See Complete List (not all offers have a location)</Link>
            <Link to={URLS.FOODRIGHTNOW}>I need to find food right now.</Link>
            </div>    
)
}

export default Home;