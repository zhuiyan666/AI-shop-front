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

  async function fetchCart () {
    loading.value = true
    try {
      const res = await getCartApi()
      items.value = (res.data || []).map(i => ({ ...i, checked: true }))
    } finally {
      loading.value = false
    }
  }

  async function addToCart (product, quantity = 1) {
    const exists = items.value.find(i => i.productId === product.id)
    if (exists) {
      exists.quantity += quantity
      await updateCartApi({ cartId: exists.id, quantity: exists.quantity })
    } else {
      const res = await addToCartApi({ productId: product.id, quantity })
      items.value.push({ ...res.data, checked: true })
    }
    ElMessage.success('已加入购物车 🛒')
  }

  async function updateQuantity (cartId, quantity) {
    const item = items.value.find(i => i.id === cartId)
    if (item) item.quantity = quantity
    await updateCartApi({ cartId, quantity })
  }

  async function removeItem (cartId) {
    await removeCartApi(cartId)
    items.value = items.value.filter(i => i.id !== cartId)
  }

  function toggleCheck (cartId) {
    const item = items.value.find(i => i.id === cartId)
    if (item) item.checked = !item.checked
  }

  function toggleAll (val) {
    items.value.forEach(i => { i.checked = val })
  }

  return { items, loading, total, totalCount, checkedItems, fetchCart, addToCart, updateQuantity, removeItem, toggleCheck, toggleAll }
})
