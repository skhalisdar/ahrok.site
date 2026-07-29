'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  PackageIcon,
  GraphIcon,
  PulseIcon,
  PlusIcon,
  SearchIcon,
  AlertFillIcon,
  TrashIcon,
  XIcon,
  CheckCircleFillIcon,
  SyncIcon,
  TagIcon,
  LocationIcon,
} from '@primer/octicons-react'
import { PhoneFrame } from '@/components/demos/phone-frame'
import { useYardSale } from '@/components/demos/nycmc/use-yard-sale'
import {
  ITEM_CATEGORIES,
  ITEM_CONDITIONS,
  computeMetrics,
  formatMoney,
  isLowStock,
  isSoldOut,
  type InventoryItem,
  type ItemCategory,
  type ItemCondition,
  type YardSaleWorkspace,
} from '@/lib/nycmc-demo'

type Tab = 'inventory' | 'sales' | 'activity'

export function YardSaleApp() {
  const {
    workspace,
    addItem,
    adjustQuantity,
    recordSale,
    deleteItem,
    resetWorkspace,
  } = useYardSale()

  const [tab, setTab] = useState<Tab>('inventory')
  const [adding, setAdding] = useState(false)
  const [sellFor, setSellFor] = useState<InventoryItem | null>(null)

  if (!workspace) {
    return (
      <PhoneFrame>
        <div
          className="nycmc-demo demo-app"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--nm-text-faint)',
            fontSize: 14,
          }}
        >
          Loading workspace…
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <div className="nycmc-demo demo-app">
      <Header
        onReset={() => {
          if (
            window.confirm(
              'Reset the demo? This restores the sample inventory and clears your changes.',
            )
          ) {
            resetWorkspace()
            setTab('inventory')
          }
        }}
      />

      <div className="demo-body">
        {tab === 'inventory' && (
          <InventoryTab
            workspace={workspace}
            onAdjust={adjustQuantity}
            onSell={(item) => setSellFor(item)}
            onDelete={deleteItem}
            onAdd={() => setAdding(true)}
          />
        )}
        {tab === 'sales' && <SalesTab workspace={workspace} />}
        {tab === 'activity' && <ActivityTab workspace={workspace} />}
      </div>

      <BottomNav tab={tab} onTab={setTab} onAdd={() => setAdding(true)} />

      {adding && (
        <AddItemSheet
          onClose={() => setAdding(false)}
          onSubmit={(input) => {
            addItem(input)
            setAdding(false)
            setTab('inventory')
          }}
        />
      )}

      {sellFor && (
        <SellSheet
          item={sellFor}
          onClose={() => setSellFor(null)}
          onConfirm={(price, qty) => {
            recordSale(sellFor.id, price, qty)
            setSellFor(null)
            setTab('sales')
          }}
        />
      )}
      </div>
    </PhoneFrame>
  )
}

/* ----------------------------------------------------------------- */
/* Header                                                             */
/* ----------------------------------------------------------------- */

function Header({ onReset }: { onReset: () => void }) {
  return (
    <header
      style={{
        flexShrink: 0,
        padding: '14px 16px 12px',
        backgroundColor: 'var(--nm-surface)',
        borderBottom: '1px solid var(--nm-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <span className="demo-logo-chip" style={{ height: 38 }}>
        {/* Source artwork has heavy padding; render tall and clip to chip. */}
        <img
          src="/brand/nycmc-yard-sale-logo.png"
          alt="NYCMC Yard Sale"
          width={150}
          height={150}
          style={{
            height: 96,
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'left center',
          }}
        />
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          type="button"
          className="nm-icon-btn"
          onClick={onReset}
          aria-label="Reset demo"
          title="Reset demo"
        >
          <SyncIcon size={16} />
        </button>
        <Link
          href="/products"
          className="nm-icon-btn"
          aria-label="Exit demo"
          title="Exit demo"
        >
          <XIcon size={18} />
        </Link>
      </div>
    </header>
  )
}

/* ----------------------------------------------------------------- */
/* Inventory tab                                                      */
/* ----------------------------------------------------------------- */

function InventoryTab({
  workspace,
  onAdjust,
  onSell,
  onDelete,
  onAdd,
}: {
  workspace: YardSaleWorkspace
  onAdjust: (id: string, delta: number) => void
  onSell: (item: InventoryItem) => void
  onDelete: (id: string) => void
  onAdd: () => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ItemCategory | 'All'>('All')

  const metrics = useMemo(() => computeMetrics(workspace), [workspace])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return workspace.items.filter((i) => {
      const matchesCat = category === 'All' || i.category === category
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      return matchesCat && matchesQuery
    })
  }, [workspace.items, query, category])

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      {/* Stat strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <MiniStat label="Items" value={String(metrics.totalItems)} />
        <MiniStat
          label="Low stock"
          value={String(metrics.lowStock)}
          tone={metrics.lowStock > 0 ? 'amber' : 'default'}
        />
        <MiniStat label="On hand" value={formatMoney(metrics.potentialRevenue)} />
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--nm-text-faint)',
            display: 'inline-flex',
          }}
        >
          <SearchIcon size={15} />
        </span>
        <input
          className="nm-input"
          style={{ paddingLeft: 34 }}
          placeholder="Search items or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search inventory"
        />
      </div>

      {/* Category chips */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 12,
          marginBottom: 4,
        }}
      >
        {(['All', ...ITEM_CATEGORIES] as const).map((cat) => {
          const active = category === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: active ? 'var(--nm-green)' : 'var(--nm-border-strong)',
                backgroundColor: active ? 'var(--nm-green)' : 'transparent',
                color: active ? '#fff' : 'var(--nm-text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No items found"
          body={
            workspace.items.length === 0
              ? 'Add your first item to start tracking inventory.'
              : 'Try a different search or category.'
          }
          actionLabel="Add item"
          onAction={onAdd}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onAdjust={onAdjust}
              onSell={onSell}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MiniStat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'amber'
}) {
  return (
    <div
      className="nm-card"
      style={{
        padding: '10px 10px',
        backgroundColor: tone === 'amber' ? 'var(--nm-amber-soft)' : 'var(--nm-surface)',
        borderColor: tone === 'amber' ? 'rgba(192,119,42,0.35)' : 'var(--nm-border)',
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: tone === 'amber' ? 'var(--nm-amber)' : 'var(--nm-text)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--nm-text-muted)', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  )
}

function ItemCard({
  item,
  onAdjust,
  onSell,
  onDelete,
}: {
  item: InventoryItem
  onAdjust: (id: string, delta: number) => void
  onSell: (item: InventoryItem) => void
  onDelete: (id: string) => void
}) {
  const low = isLowStock(item)
  const soldOut = isSoldOut(item)

  return (
    <div className="nm-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Thumb item={item} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--nm-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--nm-text-muted)',
                  marginTop: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <LocationIcon size={11} />
                {item.location || 'Unassigned'}
              </div>
            </div>
            <button
              type="button"
              className="nm-icon-btn"
              style={{ width: 30, height: 30, flexShrink: 0 }}
              onClick={() => {
                if (window.confirm(`Remove "${item.name}" from inventory?`)) {
                  onDelete(item.id)
                }
              }}
              aria-label={`Delete ${item.name}`}
            >
              <TrashIcon size={14} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            <Pill>{item.category}</Pill>
            <Pill>{item.condition}</Pill>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--nm-green-deep)',
                marginLeft: 'auto',
              }}
            >
              {formatMoney(item.price)}
            </span>
          </div>
        </div>
      </div>

      {(low || soldOut) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: soldOut ? '#f3e3e0' : 'var(--nm-amber-soft)',
            color: soldOut ? '#a3412f' : 'var(--nm-amber)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <AlertFillIcon size={12} />
          {soldOut ? 'Sold out — restock or remove' : `Low stock — ${item.quantity} left`}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          borderTop: '1px solid var(--nm-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--nm-border-strong)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => onAdjust(item.id, -1)}
            disabled={item.quantity <= 0}
            aria-label={`Decrease ${item.name} quantity`}
            style={qtyBtnStyle(item.quantity <= 0)}
          >
            −
          </button>
          <span
            style={{
              minWidth: 34,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--nm-text)',
            }}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onAdjust(item.id, 1)}
            aria-label={`Increase ${item.name} quantity`}
            style={qtyBtnStyle(false)}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="nm-btn nm-btn-primary"
          style={{ flex: 1, padding: '9px 12px' }}
          onClick={() => onSell(item)}
          disabled={soldOut}
        >
          <TagIcon size={14} />
          Record sale
        </button>
      </div>
    </div>
  )
}

function qtyBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 34,
    height: 34,
    border: 'none',
    background: 'transparent',
    color: disabled ? 'var(--nm-text-faint)' : 'var(--nm-text)',
    fontSize: 18,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    lineHeight: 1,
  }
}

function Thumb({ item }: { item: InventoryItem }) {
  if (item.image) {
    return (
      <img
        src={item.image || '/placeholder.svg'}
        alt={item.name}
        width={72}
        height={72}
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--nm-border)',
        }}
      />
    )
  }
  // User-added items: a friendly themed tile with the item's initial.
  const initial = item.name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      aria-hidden="true"
      style={{
        width: 72,
        height: 72,
        borderRadius: 12,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--nm-green-soft)',
        color: 'var(--nm-green-deep)',
        fontSize: 26,
        fontWeight: 700,
      }}
    >
      {initial}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        backgroundColor: 'var(--nm-surface-alt)',
        color: 'var(--nm-text-muted)',
      }}
    >
      {children}
    </span>
  )
}

/* ----------------------------------------------------------------- */
/* Sales tab                                                          */
/* ----------------------------------------------------------------- */

function SalesTab({ workspace }: { workspace: YardSaleWorkspace }) {
  const metrics = useMemo(() => computeMetrics(workspace), [workspace])

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      <div
        className="nm-card"
        style={{
          padding: 16,
          marginBottom: 16,
          background:
            'linear-gradient(135deg, var(--nm-green) 0%, var(--nm-green-deep) 100%)',
          border: 'none',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>
          Total raised
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {formatMoney(metrics.actualRevenue)}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
          {metrics.itemsSold} {metrics.itemsSold === 1 ? 'item' : 'items'} sold
        </div>
      </div>

      <SectionLabel>Recent sales</SectionLabel>

      {workspace.sales.length === 0 ? (
        <EmptyState
          title="No sales yet"
          body="Record a sale from any inventory item to see it here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {workspace.sales.map((sale) => (
            <div
              key={sale.id}
              className="nm-card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  color: 'var(--nm-green)',
                  flexShrink: 0,
                }}
              >
                <CheckCircleFillIcon size={20} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--nm-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {sale.itemName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>
                  Qty {sale.quantity} · {relativeTime(sale.soldAt)}
                </div>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--nm-green-deep)',
                }}
              >
                {formatMoney(sale.salePrice * sale.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- */
/* Activity tab                                                       */
/* ----------------------------------------------------------------- */

function ActivityTab({ workspace }: { workspace: YardSaleWorkspace }) {
  const metrics = useMemo(() => computeMetrics(workspace), [workspace])
  const lowItems = workspace.items.filter(isLowStock)
  const soldOutItems = workspace.items.filter(isSoldOut)

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      <SectionLabel>Overview</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <BigStat label="Items on hand" value={String(metrics.totalItems)} />
        <BigStat label="Items sold" value={String(metrics.itemsSold)} />
        <BigStat label="Raised so far" value={formatMoney(metrics.actualRevenue)} />
        <BigStat
          label="Inventory value"
          value={formatMoney(metrics.potentialRevenue)}
        />
      </div>

      <SectionLabel>Needs attention</SectionLabel>
      {lowItems.length === 0 && soldOutItems.length === 0 ? (
        <div
          className="nm-card"
          style={{
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--nm-green-deep)',
          }}
        >
          <CheckCircleFillIcon size={18} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Everything is well stocked.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...soldOutItems, ...lowItems].map((item) => {
            const out = isSoldOut(item)
            return (
              <div
                key={item.id}
                className="nm-card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderColor: out ? 'rgba(163,65,47,0.3)' : 'rgba(192,119,42,0.3)',
                  backgroundColor: out ? '#f3e3e0' : 'var(--nm-amber-soft)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    color: out ? '#a3412f' : 'var(--nm-amber)',
                  }}
                >
                  <AlertFillIcon size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text)' }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>
                    {out ? 'Sold out' : `${item.quantity} left`} · {item.location}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="nm-card" style={{ padding: 14 }}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: 'var(--nm-text)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--nm-text-faint)',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- */
/* Bottom navigation                                                  */
/* ----------------------------------------------------------------- */

function BottomNav({
  tab,
  onTab,
  onAdd,
}: {
  tab: Tab
  onTab: (tab: Tab) => void
  onAdd: () => void
}) {
  return (
    <nav className="demo-nav" aria-label="Yard sale sections">
      <NavItem
        label="Inventory"
        active={tab === 'inventory'}
        onClick={() => onTab('inventory')}
        icon={<PackageIcon size={18} />}
      />
      <NavItem
        label="Sales"
        active={tab === 'sales'}
        onClick={() => onTab('sales')}
        icon={<GraphIcon size={18} />}
      />
      <div className="demo-nav-add-slot">
        <button
          type="button"
          className="demo-nav-add"
          onClick={onAdd}
          aria-label="Add item"
        >
          <PlusIcon size={22} />
        </button>
        <span className="demo-nav-add-label">Add</span>
      </div>
      <NavItem
        label="Activity"
        active={tab === 'activity'}
        onClick={() => onTab('activity')}
        icon={<PulseIcon size={18} />}
      />
      <NavItem
        label="Reset"
        active={false}
        onClick={() => onTab('inventory')}
        icon={<PackageIcon size={18} />}
        hidden
      />
    </nav>
  )
}

function NavItem({
  label,
  active,
  onClick,
  icon,
  hidden,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  hidden?: boolean
}) {
  if (hidden) return null
  return (
    <button
      type="button"
      className="demo-nav-item"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}

/* ----------------------------------------------------------------- */
/* Add item sheet                                                     */
/* ----------------------------------------------------------------- */

function AddItemSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: {
    name: string
    category: ItemCategory
    condition: ItemCondition
    quantity: number
    price: number
    location: string
  }) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ItemCategory>('Furniture')
  const [condition, setCondition] = useState<ItemCondition>('Good')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')

  const valid = name.trim().length > 0 && Number(price) >= 0

  return (
    <Sheet title="Add item" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          onSubmit({
            name,
            category,
            condition,
            quantity: Number(quantity) || 1,
            price: Number(price) || 0,
            location,
          })
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <Field label="Item name">
          <input
            className="nm-input"
            placeholder="e.g. Bookshelf"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Category">
            <select
              className="nm-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
            >
              {ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select
              className="nm-select"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
            >
              {ITEM_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Quantity">
            <input
              className="nm-input"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Price ($)">
            <input
              className="nm-input"
              type="number"
              min={0}
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Location">
          <input
            className="nm-input"
            placeholder="e.g. Shelf A2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>

        <button
          type="submit"
          className="nm-btn nm-btn-primary"
          style={{ marginTop: 4 }}
          disabled={!valid}
        >
          <PlusIcon size={16} />
          Add to inventory
        </button>
      </form>
    </Sheet>
  )
}

/* ----------------------------------------------------------------- */
/* Sell sheet                                                         */
/* ----------------------------------------------------------------- */

function SellSheet({
  item,
  onClose,
  onConfirm,
}: {
  item: InventoryItem
  onClose: () => void
  onConfirm: (price: number, qty: number) => void
}) {
  const [price, setPrice] = useState(String(item.price))
  const [qty, setQty] = useState('1')

  const numQty = Math.min(Math.max(1, Number(qty) || 1), item.quantity)
  const total = (Number(price) || 0) * numQty

  return (
    <Sheet title={`Sell ${item.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Sale price ($)">
            <input
              className="nm-input"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label={`Quantity (max ${item.quantity})`}>
            <input
              className="nm-input"
              type="number"
              min={1}
              max={item.quantity}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 12,
            backgroundColor: 'var(--nm-green-soft)',
            color: 'var(--nm-green-deep)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>Sale total</span>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{formatMoney(total)}</span>
        </div>

        <button
          type="button"
          className="nm-btn nm-btn-primary"
          onClick={() => onConfirm(Number(price) || 0, numQty)}
        >
          <CheckCircleFillIcon size={16} />
          Confirm sale
        </button>
        <p
          style={{
            fontSize: 12,
            color: 'var(--nm-text-muted)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Demo only — no real payment is processed.
        </p>
      </div>
    </Sheet>
  )
}

/* ----------------------------------------------------------------- */
/* Shared sheet + helpers                                             */
/* ----------------------------------------------------------------- */

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          border: 'none',
          background: 'rgba(20, 24, 18, 0.45)',
          cursor: 'default',
        }}
      />
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--nm-bg)',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: '18px 16px calc(20px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '88%',
          overflowY: 'auto',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--nm-text)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            className="nm-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'block' }}>
      <span
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--nm-text-muted)',
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div
      className="nm-card"
      style={{
        padding: '28px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ color: 'var(--nm-text-faint)' }}>
        <PackageIcon size={28} />
      </span>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--nm-text)' }}>
        {title}
      </div>
      <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: 0 }}>{body}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="nm-btn nm-btn-soft"
          style={{ marginTop: 6 }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'just now'
  if (diff < hour) {
    const m = Math.round(diff / minute)
    return `${m} min ago`
  }
  if (diff < day) {
    const h = Math.round(diff / hour)
    return `${h} ${h === 1 ? 'hour' : 'hours'} ago`
  }
  const d = Math.round(diff / day)
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d} days ago`
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}


