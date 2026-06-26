'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { IconList, IconMap2 } from '@tabler/icons-react'
import LocationMap from '@/components/LocationMap/LocationMap'
import type { ResourceWithLocation } from '@/schemas/zodSchema'
import { FILTER_CHIPS, API_ROUTES } from '@/lib/constants'
import { LIST_LABEL, MAP_LABEL, LOADING_RESOURCES } from './constants'

type View = 'list' | 'map'

export function MapResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: locations = [] } = useQuery<ResourceWithLocation[]>({
    queryKey: ['locations'],
    queryFn: () => fetch(API_ROUTES.LOCATIONS).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  function isChipActive(key: string, value: string) {
    const param = searchParams.get(key)
    return param ? param.split(',').includes(value) : false
  }

  function toggleChip(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get(key)?.split(',').filter(Boolean) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    if (next.length) {
      params.set(key, next.join(','))
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mobile-only: List/Map segmented toggle */}
      <div className="flex md:hidden border-b border-border">
        <button
          type="button"
          onClick={() => setView('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            view === 'list'
              ? 'text-foreground border-foreground'
              : 'text-muted-foreground border-transparent'
          }`}
        >
          <IconList size={15} stroke={1.5} />
          {LIST_LABEL}
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            view === 'map'
              ? 'text-foreground border-foreground'
              : 'text-muted-foreground border-transparent'
          }`}
        >
          <IconMap2 size={15} stroke={1.5} />
          {MAP_LABEL}
        </button>
      </div>

      {/* Filter chip row — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-b border-border [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {FILTER_CHIPS.map((chip) => {
          const active = isChipActive(chip.key, chip.value)
          return (
            <button
              key={`${chip.key}-${chip.value}`}
              type="button"
              onClick={() => toggleChip(chip.key, chip.value)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                active
                  ? 'bg-[#2B5CA8] border-[#2B5CA8] text-white'
                  : 'bg-background border-border text-foreground hover:border-[#2B5CA8]'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* List panel — hidden on mobile when map view active; always visible on desktop */}
        <aside
          className={`${view === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 md:flex-shrink-0 overflow-y-auto md:border-r md:border-border`}
        >
          {locations.length === 0 && (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">
              {LOADING_RESOURCES}
            </p>
          )}
          {locations.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setSelectedId(item.id)}
              onMouseLeave={() => setSelectedId(null)}
              onClick={() => setSelectedId(item.id)}
              className={`px-4 py-3 border-b border-border cursor-pointer transition-colors ${
                selectedId === item.id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              <p className="font-medium text-sm leading-tight">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.physical_location.address}
                {item.physical_location.address2 && `, ${item.physical_location.address2}`}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </aside>

        {/* Map panel — hidden on mobile when list view active; always visible on desktop */}
        <div
          className={`${view === 'map' ? 'flex' : 'hidden'} md:flex flex-1 min-w-0`}
        >
          <LocationMap
            data={locations}
            selectedId={selectedId}
            onSelect={(item) => setSelectedId((item as ResourceWithLocation).id)}
          />
        </div>
      </div>
    </div>
  )
}
