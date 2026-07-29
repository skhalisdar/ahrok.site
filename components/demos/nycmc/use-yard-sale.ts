'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  NYCMC_STORAGE_KEY,
  createId,
  getSeedWorkspace,
  type InventoryItem,
  type ItemCategory,
  type ItemCondition,
  type YardSaleWorkspace,
} from '@/lib/nycmc-demo'

function loadWorkspace(): YardSaleWorkspace {
  if (typeof window === 'undefined') return getSeedWorkspace()
  try {
    const raw = window.localStorage.getItem(NYCMC_STORAGE_KEY)
    if (!raw) return getSeedWorkspace()
    const parsed = JSON.parse(raw) as YardSaleWorkspace
    if (!parsed || !Array.isArray(parsed.items) || !Array.isArray(parsed.sales)) {
      return getSeedWorkspace()
    }
    return parsed
  } catch {
    return getSeedWorkspace()
  }
}

export function useYardSale() {
  const [workspace, setWorkspace] = useState<YardSaleWorkspace | null>(null)

  // Load the visitor's private workspace from localStorage on mount.
  useEffect(() => {
    setWorkspace(loadWorkspace())
  }, [])

  // Persist any change back to localStorage.
  useEffect(() => {
    if (!workspace) return
    try {
      window.localStorage.setItem(NYCMC_STORAGE_KEY, JSON.stringify(workspace))
    } catch {
      // Ignore write failures (private mode, quota) — demo is non-critical.
    }
  }, [workspace])

  const addItem = useCallback(
    (input: {
      name: string
      category: ItemCategory
      condition: ItemCondition
      quantity: number
      price: number
      location: string
    }) => {
      const item: InventoryItem = {
        id: createId('item'),
        name: input.name.trim(),
        category: input.category,
        condition: input.condition,
        quantity: Math.max(0, Math.round(input.quantity)),
        price: Math.max(0, input.price),
        location: input.location.trim(),
        createdAt: Date.now(),
      }
      setWorkspace((prev) =>
        prev ? { ...prev, items: [item, ...prev.items] } : prev,
      )
      return item.id
    },
    [],
  )

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === itemId
                ? { ...i, quantity: Math.max(0, Math.round(quantity)) }
                : i,
            ),
          }
        : prev,
    )
  }, [])

  const adjustQuantity = useCallback((itemId: string, delta: number) => {
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === itemId
                ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                : i,
            ),
          }
        : prev,
    )
  }, [])

  const recordSale = useCallback(
    (itemId: string, salePrice: number, quantity: number) => {
      setWorkspace((prev) => {
        if (!prev) return prev
        const item = prev.items.find((i) => i.id === itemId)
        if (!item) return prev
        const soldQty = Math.min(Math.max(1, Math.round(quantity)), item.quantity)
        if (soldQty <= 0) return prev
        const sale = {
          id: createId('sale'),
          itemId,
          itemName: item.name,
          quantity: soldQty,
          salePrice: Math.max(0, salePrice),
          soldAt: Date.now(),
        }
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity - soldQty } : i,
          ),
          sales: [sale, ...prev.sales],
        }
      })
    },
    [],
  )

  const deleteItem = useCallback((itemId: string) => {
    setWorkspace((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev,
    )
  }, [])

  const resetWorkspace = useCallback(() => {
    setWorkspace(getSeedWorkspace())
  }, [])

  return {
    workspace,
    addItem,
    setQuantity,
    adjustQuantity,
    recordSale,
    deleteItem,
    resetWorkspace,
  }
}
