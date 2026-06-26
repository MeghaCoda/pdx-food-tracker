import { Suspense } from 'react'
import { MapResultsPage } from './MapResultsPage'

export default function MapPage() {
  return (
    <Suspense>
      <MapResultsPage />
    </Suspense>
  )
}
