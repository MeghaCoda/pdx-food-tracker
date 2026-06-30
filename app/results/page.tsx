import { Suspense } from 'react'
import { ResultsPage } from './ResultsPage'

export default function ResultsPageRoute() {
  return (
    <Suspense>
      <ResultsPage />
    </Suspense>
  )
}
