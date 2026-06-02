export const EMPTY_ITINERARY_ITEM = { name: '', time: '' }

export function sortItineraryItems(items = []) {
  return [...items]
    .map((item, index) => ({ ...item, _fallbackOrder: index }))
    .sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : a._fallbackOrder
      const orderB = typeof b.order === 'number' ? b.order : b._fallbackOrder
      return orderA - orderB
    })
    .map(({ _fallbackOrder, ...item }) => item)
}

export function syncItineraryOrder(items = []) {
  return items.map((item, index) => ({ ...item, order: index }))
}

export function normalizeItineraryFromApi(items) {
  if (!items || items.length === 0) {
    return [{ ...EMPTY_ITINERARY_ITEM, order: 0 }]
  }
  return syncItineraryOrder(sortItineraryItems(items))
}

export function serializeItineraryForApi(items = []) {
  return items
    .filter((item) => item.name?.trim() !== '')
    .map((item, index) => ({
      name: item.name.trim(),
      time: item.time,
      order: index,
    }))
}
