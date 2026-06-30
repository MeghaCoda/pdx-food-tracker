'use client'

import { useState } from 'react'
import { IconList, IconMap2 } from '@tabler/icons-react'
import { FilterChip } from '@/components/ui/FilterChip'
import { FilterSection } from '@/components/ui/FilterSection'
import { EligibilityCard } from '@/components/ui/EligibilityCard'
import { CtaBar } from '@/components/ui/CtaBar'
import { TabBar } from '@/components/ui/TabBar'
import { ResultListItem } from '@/components/ui/ResultListItem'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterDrawer } from '@/components/ui/FilterDrawer'
import { useSearchFilters } from '@/store/searchFilters'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-text-muted border-b border-border pb-1.5 mb-4">
        {title}
      </h2>
      {note && <p className="text-sm text-text-secondary mb-4">{note}</p>}
      {children}
    </section>
  )
}

function Token({ children }: { children: string }) {
  return (
    <code className="text-[10px] bg-surface-0 text-text-muted px-1.5 py-0.5 rounded-sm font-mono">
      {children}
    </code>
  )
}

function Label({ children }: { children: string }) {
  return <p className="text-xs text-text-muted mt-1">{children}</p>
}

function Item({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-4 items-start mb-4">{children}</div>
}

function AppBg({ children }: { children: React.ReactNode }) {
  return <div className="bg-background p-3 rounded-lg">{children}</div>
}

// ─── Demo state helpers ─────────────────────────────────────────────────────────

function useToggleSet(initial: string[] = []) {
  const [set, setSet] = useState<Set<string>>(new Set(initial))
  function toggle(v: string) {
    setSet((s) => {
      const next = new Set(s)
      next.has(v) ? next.delete(v) : next.add(v)
      return next
    })
  }
  function clear() { setSet(new Set()) }
  function replace(values: string[]) { setSet(new Set(values)) }
  return { has: (v: string) => set.has(v), toggle, clear, replace, arr: Array.from(set) }
}

// ─── Color swatch ──────────────────────────────────────────────────────────────

function Swatch({ hex, name, token }: { hex: string; name: string; token: string }) {
  return (
    <Item>
      <div className="w-10 h-10 rounded-lg border border-black/8 shrink-0" style={{ background: hex }} />
      <Label>{name}</Label>
      <Token>{token}</Token>
    </Item>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const priceFilters = useToggleSet(['free'])
  const foodFilters = useToggleSet()
  const eligibility = useToggleSet(['anyone'])
  const chipDemo = useToggleSet(['free'])
  const [tab, setTab] = useState('list')
  const [selectedResult, setSelectedResult] = useState<string | null>(null)

  // FilterDrawer demo
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { reset: resetFilters } = useSearchFilters()

  const anyoneSelected = eligibility.has('anyone')

  function handleEligibilityToggle(value: string) {
    if (value === 'anyone') { eligibility.toggle('anyone'); return }
    if (anyoneSelected) eligibility.toggle('anyone')
    eligibility.toggle(value)
  }

  const ELIG_OPTIONS = [
    { value: 'honor_system', label: 'Honor system' },
    { value: 'snap_ebt',     label: 'SNAP / EBT' },
    { value: 'wic',          label: 'WIC' },
    { value: 'seniors',      label: 'Seniors (65+)' },
    { value: 'children',     label: 'Children' },
    { value: 'income',       label: 'Income restricted' },
  ]

  const DEMO_RESULTS = [
    { id: '1', name: 'NE Portland Food Pantry', address: '742 NE Alberta St', description: 'Open weekdays 9–5. No documentation required.' },
    { id: '2', name: 'SE Community Kitchen',    address: '1847 SE Division St', description: 'Hot meals served Mon/Wed/Fri 11am–1pm.' },
    { id: '3', name: 'Eastside Senior Meals',   address: '3201 SE 82nd Ave', description: 'For adults 60+. Call ahead to register.' },
  ]

  const MAP_TABS = [
    { value: 'list', label: 'List', icon: <IconList size={15} stroke={1.5} /> },
    { value: 'map',  label: 'Map',  icon: <IconMap2 size={15} stroke={1.5} /> },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-text-primary mb-1">Design System</h1>
      <p className="text-sm text-text-secondary mb-8">
        Living reference for Rose City Finds UI components and tokens.
      </p>

      {/* ── Color tokens ──────────────────────────────────────────── */}
      <Section title="Color tokens">
        <Row>
          <Swatch hex="#4F5DC4" name="primary"        token="--color-primary" />
          <Swatch hex="#3D4AAF" name="primary-hover"  token="--color-primary-hover" />
          <Swatch hex="#E4E7F8" name="primary-subtle" token="--color-primary-subtle" />
          <Swatch hex="#B39DDB" name="secondary"      token="--color-secondary" />
          <Swatch hex="#AB61C4" name="accent"         token="--color-accent" />
        </Row>
        <Row>
          <Swatch hex="#F0F2FA" name="background"     token="--color-background" />
          <Swatch hex="#FFFFFF" name="surface-1"      token="--color-surface-1" />
          <Swatch hex="#D4D8F0" name="border"         token="--color-border" />
          <Swatch hex="#0D0D0D" name="text-primary"   token="--color-text-primary" />
          <Swatch hex="#4A4D6E" name="text-secondary" token="--color-text-secondary" />
          <Swatch hex="#7A7D9E" name="text-muted"     token="--color-text-muted" />
        </Row>
        <Row>
          <Swatch hex="#2E7D6E" name="success" token="--color-success" />
          <Swatch hex="#EAB308" name="warning" token="--color-warning" />
          <Swatch hex="#C41E1E" name="error"   token="--color-error" />
        </Row>
      </Section>

      {/* ── Typography ────────────────────────────────────────────── */}
      <Section title="Typography">
        <div className="flex flex-col gap-3">
          <Item>
            <p className="text-[22px] font-medium text-text-primary">Page heading</p>
            <Token>22px / 500 / --color-text-primary</Token>
          </Item>
          <Item>
            <p className="text-lg font-medium text-text-primary">Section heading</p>
            <Token>18px / 500 / --color-text-primary</Token>
          </Item>
          <Item>
            <p className="text-[15px] text-text-primary leading-relaxed">Body text — used for descriptions and content</p>
            <Token>15px / 400 / --color-text-primary</Token>
          </Item>
          <Item>
            <p className="text-sm text-text-secondary">Secondary text — labels, metadata</p>
            <Token>14px / 400 / --color-text-secondary</Token>
          </Item>
          <Item>
            <p className="text-xs text-text-muted">Muted text — placeholder, helper, timestamps</p>
            <Token>13px / 400 / --color-text-muted</Token>
          </Item>
          <Item>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-text-muted">Section label (caps)</p>
            <Token>11px / 600 / uppercase / 0.08em / --color-text-muted</Token>
          </Item>
        </div>
      </Section>

      {/* ── FilterChip ────────────────────────────────────────────── */}
      <Section
        title="FilterChip"
        note="Pill filter toggle with decorative checkbox square. compact variant omits the checkbox and reduces padding — used in the results bar."
      >
        <Row>
          <Item>
            <FilterChip label="Free" selected={false} onClick={() => {}} />
            <Label>Unselected</Label>
            <Token>bg-surface-1 border-border text-text-primary</Token>
          </Item>
          <Item>
            <FilterChip label="Free" selected={true} onClick={() => {}} />
            <Label>Selected (primary)</Label>
            <Token>bg-primary border-primary text-text-inverse</Token>
          </Item>
          <Item>
            <FilterChip label="Free" selected={true} onClick={() => {}} selectedClassName="bg-success border-success text-text-inverse" />
            <Label>Selected (success)</Label>
            <Token>selectedClassName override</Token>
          </Item>
        </Row>
        <Row>
          <Item>
            <FilterChip label="Discount" selected={false} onClick={() => {}} compact />
            <Label>Compact unselected</Label>
            <Token>compact — no checkbox</Token>
          </Item>
          <Item>
            <FilterChip label="Free" selected={true} onClick={() => {}} compact />
            <Label>Compact selected</Label>
          </Item>
        </Row>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">Interactive demo</p>
        <AppBg>
          <div className="flex flex-wrap gap-2">
            {['Free', 'Discount', 'Prepared', 'Groceries', 'Restaurant', 'Pickup'].map((label) => (
              <FilterChip
                key={label}
                label={label}
                selected={chipDemo.has(label)}
                onClick={() => chipDemo.toggle(label)}
                compact
              />
            ))}
          </div>
        </AppBg>
      </Section>

      {/* ── FilterSection ─────────────────────────────────────────── */}
      <Section
        title="FilterSection"
        note="Card wrapper that groups filter chips under a caps label. Background is surface-1 on the background page."
      >
        <AppBg>
          <div className="flex flex-col gap-3">
            <FilterSection label="Price">
              <div className="flex gap-3">
                <FilterChip
                  label="Free"
                  selected={priceFilters.has('free')}
                  onClick={() => priceFilters.toggle('free')}
                  selectedClassName="bg-success border-success text-text-inverse"
                  fullWidth
                />
                <FilterChip
                  label="Discount"
                  selected={priceFilters.has('discount')}
                  onClick={() => priceFilters.toggle('discount')}
                  fullWidth
                />
              </div>
            </FilterSection>
            <FilterSection label="Food type">
              <div className="flex flex-wrap gap-2">
                {['Prepared', 'Groceries', 'Restaurant'].map((label) => (
                  <FilterChip
                    key={label}
                    label={label}
                    selected={foodFilters.has(label)}
                    onClick={() => foodFilters.toggle(label)}
                  />
                ))}
              </div>
            </FilterSection>
          </div>
        </AppBg>
        <Row>
          <Item>
            <Label>Card</Label>
            <Token>bg-surface-1 border border-border rounded-xl</Token>
          </Item>
          <Item>
            <Label>Group label</Label>
            <Token>11px / 600 / uppercase / tracking-widest / text-text-muted</Token>
          </Item>
        </Row>
      </Section>

      {/* ── EligibilityCard ───────────────────────────────────────── */}
      <Section
        title="EligibilityCard"
        note="Eligibility selector with a full-width 'Anyone' row and a 2-column grid of specific criteria. anyoneSelected controls which checkboxes are active."
      >
        <AppBg>
          <EligibilityCard
            sectionLabel="Eligibility"
            anyoneLabel="Anyone — no requirements"
            options={ELIG_OPTIONS}
            selected={eligibility.arr}
            anyoneSelected={anyoneSelected}
            onToggle={handleEligibilityToggle}
          />
        </AppBg>
        <Row>
          <Item>
            <Label>Anyone row</Label>
            <Token>full-width, border-b border-border</Token>
          </Item>
          <Item>
            <Label>Grid cols</Label>
            <Token>grid-cols-2, col divider 0.5px border-border</Token>
          </Item>
        </Row>
      </Section>

      {/* ── CtaBar ────────────────────────────────────────────────── */}
      <Section
        title="CtaBar"
        note="Full-width sticky action bar. Uses primary background — same as the header."
      >
        <AppBg>
          <CtaBar label="Show me results" sublabel="· list and map" onClick={() => {}} />
        </AppBg>
        <Row>
          <Item>
            <Label>Background</Label>
            <Token>bg-primary → hover:bg-primary-hover</Token>
          </Item>
          <Item>
            <Label>Label</Label>
            <Token>16px / 700 / text-text-inverse</Token>
          </Item>
          <Item>
            <Label>Sublabel</Label>
            <Token>14px / 400 / text-text-inverse/80</Token>
          </Item>
        </Row>
      </Section>

      {/* ── TabBar ────────────────────────────────────────────────── */}
      <Section
        title="TabBar"
        note="Segmented toggle used on the results page for List / Map views."
      >
        <AppBg>
          <div className="bg-surface-1 rounded-xl border border-border overflow-hidden">
            <TabBar tabs={MAP_TABS} activeTab={tab} onTabChange={setTab} />
            <p className="px-4 py-3 text-sm text-text-muted">Active tab: {tab}</p>
          </div>
        </AppBg>
        <Row>
          <Item>
            <Label>Active tab</Label>
            <Token>text-text-primary border-b-2 border-text-primary</Token>
          </Item>
          <Item>
            <Label>Inactive tab</Label>
            <Token>text-text-muted border-transparent</Token>
          </Item>
        </Row>
      </Section>

      {/* ── ResultListItem ────────────────────────────────────────── */}
      <Section
        title="ResultListItem"
        note="A single result row. Hover and selected states use accent tint."
      >
        <AppBg>
          <div className="bg-surface-1 rounded-xl border border-border overflow-hidden">
            {DEMO_RESULTS.map((item) => (
              <ResultListItem
                key={item.id}
                name={item.name}
                address={item.address}
                description={item.description}
                selected={selectedResult === item.id}
                onClick={() => setSelectedResult(item.id === selectedResult ? null : item.id)}
                onMouseEnter={() => setSelectedResult(item.id)}
                onMouseLeave={() => setSelectedResult(null)}
              />
            ))}
          </div>
        </AppBg>
        <Row>
          <Item>
            <Label>Name</Label>
            <Token>15px / 500 / text-text-primary</Token>
          </Item>
          <Item>
            <Label>Address</Label>
            <Token>13px / text-text-muted</Token>
          </Item>
          <Item>
            <Label>Description</Label>
            <Token>13px / text-text-muted / line-clamp-2</Token>
          </Item>
          <Item>
            <Label>Selected/hover bg</Label>
            <Token>bg-accent/20 · bg-accent/10</Token>
          </Item>
        </Row>
      </Section>

      {/* ── StatusBadge ───────────────────────────────────────────── */}
      <Section
        title="StatusBadge"
        note="Semantic availability indicator. Never used for brand styling — only for open/limited/closed states on resource listings."
      >
        <Row>
          <Item>
            <StatusBadge variant="success" label="Open" />
            <Token>--color-success / --color-success-subtle</Token>
          </Item>
          <Item>
            <StatusBadge variant="warning" label="Limited" />
            <Token>--color-warning / --color-warning-subtle</Token>
          </Item>
          <Item>
            <StatusBadge variant="error" label="Closed" />
            <Token>--color-error / --color-error-subtle</Token>
          </Item>
        </Row>
      </Section>

      {/* ── FilterDrawer ──────────────────────────────────────────── */}
      <Section
        title="FilterDrawer"
        note="Full-screen overlay drawer with a two-column layout: category list on the left, filter options on the right. Footer has 'Clear filters' on the left and 'Search' on the right."
      >
        <AppBg>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-text-inverse bg-primary hover:bg-primary-hover transition-colors"
          >
            Open filter drawer
          </button>
        </AppBg>
        <Row>
          <Item>
            <Label>Category label</Label>
            <Token>w-28 / 11px / uppercase / tracking-widest / text-text-muted</Token>
          </Item>
          <Item>
            <Label>Chips</Label>
            <Token>compact FilterChip — all categories visible at once</Token>
          </Item>
          <Item>
            <Label>Footer</Label>
            <Token>border-t border-border, space-between</Token>
          </Item>
        </Row>
      </Section>

      {/* ── Radius scale ──────────────────────────────────────────── */}
      <Section title="Radius scale">
        <Row>
          {[
            { name: 'radius-sm',   cls: 'rounded-sm',   approx: '≈ 5px' },
            { name: 'radius-md',   cls: 'rounded-md',   approx: '≈ 7px' },
            { name: 'radius-lg',   cls: 'rounded-lg',   approx: '10px (base)' },
            { name: 'radius-xl',   cls: 'rounded-xl',   approx: '≈ 15px' },
            { name: 'radius-2xl',  cls: 'rounded-2xl',  approx: '≈ 20px' },
            { name: 'radius-full', cls: 'rounded-full', approx: '9999px' },
          ].map(({ name, cls, approx }) => (
            <Item key={name}>
              <div className={`w-12 h-12 bg-primary-subtle ${cls}`} />
              <Label>{name}</Label>
              <Token>{approx}</Token>
            </Item>
          ))}
        </Row>
      </Section>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSearch={() => setDrawerOpen(false)}
        onClearFilters={resetFilters}
      />
    </div>
  )
}
