import { BrowserRouter, Routes, Route } from "react-router-dom"
import { URLS } from "./constants"
import Home from "./Home"
import Map from "./Map/Map"
import About from "./About"
import Contact from "./Contact"

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path={URLS.HOME} element={<Home />} />
        <Route path={URLS.MAP} element={<Map />} />
        <Route path={URLS.ABOUT} element={<About />} />
        <Route path={URLS.CONTACT} element={<Contact />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
