// Fictional, browser-local sample data for the NYCMC Yard Sale demo.
// Not connected to any real system, customer, payment, or upload.

export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair'

export const ITEM_CATEGORIES = [
  'Furniture',
  'Lighting',
  'Kids',
  'Electronics',
  'Kitchen',
  'Other',
] as const
export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

export const ITEM_CONDITIONS: ItemCondition[] = [
  'New',
  'Like New',
  'Good',
  'Fair',
]

export const LOW_STOCK_THRESHOLD = 2

export interface InventoryItem {
  id: string
  name: string
  category: ItemCategory
  condition: ItemCondition
  quantity: number
  price: number
  location: string
  /** Optional product photo path. User-added items have none (a themed tile shows instead). */
  image?: string
  createdAt: number
}

export interface Sale {
  id: string
  itemId: string
  itemName: string
  quantity: number
  salePrice: number
  soldAt: number
}

export interface YardSaleWorkspace {
  org: string
  items: InventoryItem[]
  sales: Sale[]
}

export const NYCMC_STORAGE_KEY = 'nycmc-yard-sale-demo-v1'

let idCounter = 0
export function createId(prefix: string): string {
  idCounter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${random}`
}

export function isLowStock(item: InventoryItem): boolean {
  return item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD
}

export function isSoldOut(item: InventoryItem): boolean {
  return item.quantity <= 0
}

export function getSeedWorkspace(): YardSaleWorkspace {
  const now = Date.now()
  const day = 1000 * 60 * 60 * 24

  return {
    org: 'NYC Muslim Center',
    items: [
      {
        id: 'item_brass_lamp',
        name: 'Vintage brass lamp',
        category: 'Lighting',
        condition: 'Good',
        quantity: 3,
        price: 28,
        location: 'Shelf A2',
        image: '/demos/nycmc/vintage-brass-lamp.png',
        createdAt: now - day * 12,
      },
      {
        id: 'item_kids_bike',
        name: "Children's bicycle",
        category: 'Kids',
        condition: 'Like New',
        quantity: 1,
        price: 45,
        location: 'Floor, Bay 3',
        image: '/demos/nycmc/childrens-bicycle.png',
        createdAt: now - day * 10,
      },
      {
        id: 'item_dining_chairs',
        name: 'Dining chair set',
        category: 'Furniture',
        condition: 'Good',
        quantity: 4,
        price: 60,
        location: 'Back room',
        image: '/demos/nycmc/dining-chair-set.png',
        createdAt: now - day * 9,
      },
      {
        id: 'item_coffee_table',
        name: 'Coffee table',
        category: 'Furniture',
        condition: 'Fair',
        quantity: 2,
        price: 35,
        location: 'Back room',
        image: '/demos/nycmc/coffee-table.png',
        createdAt: now - day * 8,
      },
      {
        id: 'item_game_bundle',
        name: 'Nintendo game bundle',
        category: 'Electronics',
        condition: 'Good',
        quantity: 1,
        price: 52,
        location: 'Display case',
        image: '/demos/nycmc/nintendo-game-bundle.png',
        createdAt: now - day * 6,
      },
      {
        id: 'item_coat_rack',
        name: 'Winter coat rack',
        category: 'Furniture',
        condition: 'Like New',
        quantity: 5,
        price: 22,
        location: 'Shelf C1',
        image: '/demos/nycmc/winter-coat-rack.png',
        createdAt: now - day * 4,
      },
      {
        id: 'item_dinnerware',
        name: 'Ceramic dinnerware set',
        category: 'Kitchen',
        condition: 'New',
        quantity: 6,
        price: 30,
        location: 'Shelf B4',
        image: '/demos/nycmc/ceramic-dinnerware-set.png',
        createdAt: now - day * 3,
      },
    ],
    sales: [
      {
        id: 'sale_seed_1',
        itemId: 'item_brass_lamp',
        itemName: 'Vintage brass lamp',
        quantity: 1,
        salePrice: 30,
        soldAt: now - day * 2,
      },
      {
        id: 'sale_seed_2',
        itemId: 'item_dinnerware',
        itemName: 'Ceramic dinnerware set',
        quantity: 1,
        salePrice: 28,
        soldAt: now - day * 1,
      },
    ],
  }
}

export interface YardSaleMetrics {
  totalItems: number
  lowStock: number
  itemsSold: number
  potentialRevenue: number
  actualRevenue: number
}

export function computeMetrics(workspace: YardSaleWorkspace): YardSaleMetrics {
  const totalItems = workspace.items.reduce((sum, i) => sum + i.quantity, 0)
  const lowStock = workspace.items.filter(isLowStock).length
  const itemsSold = workspace.sales.reduce((sum, s) => sum + s.quantity, 0)
  const potentialRevenue = workspace.items.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0,
  )
  const actualRevenue = workspace.sales.reduce(
    (sum, s) => sum + s.quantity * s.salePrice,
    0,
  )
  return { totalItems, lowStock, itemsSold, potentialRevenue, actualRevenue }
}

export function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
