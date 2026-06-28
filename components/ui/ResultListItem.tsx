'use client'

import { cn } from '@/lib/utils'

interface ResultListItemProps {
  name: string
  address: string
  description?: string
  selected?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
}

export function ResultListItem({
  name,
  address,
  description,
  selected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: ResultListItemProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'px-4 py-3 border-b border-border cursor-pointer transition-colors bg-surface-1',
        selected ? 'bg-accent/20' : 'hover:bg-accent/10',
        className
      )}
    >
      <p className="font-medium text-sm leading-tight text-text-primary">{name}</p>
      <p className="text-xs text-text-muted mt-0.5">{address}</p>
      {description && (
        <p className="text-xs text-text-muted mt-1 line-clamp-2">{description}</p>
      )}
    </div>
  )
}
