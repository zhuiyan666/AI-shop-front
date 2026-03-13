import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartApi, addToCartApi, updateCartApi, removeCartApi } from '../api/cart'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + (item.checked ? item.price * item.quantity : 0), 0)
  )
  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  const checkedItems = computed(() => items.value.filter(i => i.checked))

  async function fetchCart (options = {}) {
    const silent = Boolean(options.silent)
    if (!silent) loading.value = true
    try {
      const res = await getCartApi()
      items.value = (res.data || []).map(i => ({ ...i, checked: true }))
    } finally {
      if (!silent) loading.value = false
    }
  }

  async function addToCart (product, quantity = 1) {
    try {
      const nextQuantity = Math.max(1, Number(product?.quantity ?? quantity) || 1)
      const exists = items.value.find(i => i.productId === product.id)
      if (exists) {
        const previous = exists.quantity
        const next = previous + nextQuantity
        exists.quantity = next
        try {
          await updateCartApi({ cartId: exists.id, productId: exists.productId, quantity: next })
        } catch (e) {
          exists.quantity = previous
          throw e
        }
      } else {
        const res = await addToCartApi({ productId: product.id, quantity: nextQuantity })
        items.value.push({ ...res.data, checked: true })
      }
      ElMessage.success('已加入购物车')
    } catch (e) {
      const msg = e?.response?.data?.message || '加入购物车失败，请检查后端服务与数据库'
      ElMessage.error(msg)
      throw e
    }
  }

  async function updateQuantity (cartId, productId, quantity) {
    const item = items.value.find(i => i.id === cartId)
    if (!item) return

    const previous = item.quantity
    const next = Math.max(1, Number(quantity) || 1)
    item.quantity = next
    try {
      await updateCartApi({ cartId, productId, quantity: next })
      await fetchCart({ silent: true })
    } catch (e) {
      item.quantity = previous
      await fetchCart({ silent: true })
      throw e
    }
  }

  async function removeItem (cartId, productId) {
    await removeCartApi({ cartId, productId })
    items.value = items.value.filter(i => i.id !== cartId)
  }

  async function clearItems (cartIds = []) {
    const ids = [...new Set(cartIds.map(id => Number(id)).filter(Boolean))]
    if (!ids.length) return
    await Promise.all(ids.map(id => removeCartApi({ cartId: id })))
    items.value = items.value.filter(i => !ids.includes(Number(i.id)))
  }

  function toggleCheck (cartId) {
    const item = items.value.find(i => i.id === cartId)
    if (item) item.checked = !item.checked
  }

  function toggleAll (val) {
    items.value.forEach(i => { i.checked = val })
  }

  function resetCart () {
    items.value = []
    loading.value = false
  }

  return { items, loading, total, totalCount, checkedItems, fetchCart, addToCart, updateQuantity, removeItem, clearItems, toggleCheck, toggleAll, resetCart }
})
