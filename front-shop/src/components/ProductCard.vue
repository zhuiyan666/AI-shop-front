<template>
  <div class="product-card glass-card" @click="$router.push(`/product/${product.id}`)">
    <div class="card-tags">
      <span v-for="tag in product.tags" :key="tag" class="tag" :class="tag">{{ tag }}</span>
    </div>

    <div class="card-img-wrap">
      <img :src="product.image" :alt="product.name" class="card-img" loading="lazy" />
      <div class="img-overlay">
        <button class="quick-view" @click.stop="$router.push(`/product/${product.id}`)">快速查看</button>
      </div>
    </div>

    <div class="card-body">
      <p class="card-category">{{ product.category }}</p>
      <h3 class="card-name">{{ product.name }}</h3>
      <div class="card-meta">
        <span class="merchant">{{ product.merchantName || product.brand || '平台商家' }}</span>
        <span class="buyers">购买 {{ (product.buyerCount ?? product.sales ?? 0).toLocaleString() }}</span>
      </div>
      <div class="card-rating">
        <el-rate :model-value="product.rating" disabled size="small" />
        <span class="sales">已售 {{ product.sales?.toLocaleString() }}</span>
      </div>
      <div class="card-price">
        <span class="price">¥{{ product.price.toLocaleString() }}</span>
        <span v-if="product.originalPrice" class="original">¥{{ product.originalPrice.toLocaleString() }}</span>
      </div>
      <button class="add-cart-btn" @click.stop="$emit('add-cart', product)">
        <IconFont name="icon-cart-full-fill" size="14px" />
        加入购物车
      </button>
    </div>
  </div>
</template>

<script setup>
import IconFont from './IconFont.vue'

defineProps({ product: { type: Object, required: true } })
defineEmits(['add-cart'])
</script>

<style scoped>
.product-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 24px;
  box-shadow: 0 14px 30px rgba(255, 79, 109, 0.06);
  transition: all 0.3s ease;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 14px 14px auto auto;
  width: 24px;
  height: 24px;
  border-top: 1px solid rgba(255, 79, 109, 0.14);
  border-right: 1px solid rgba(255, 79, 109, 0.14);
  pointer-events: none;
}

.product-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 79, 109, 0.28);
  box-shadow: 0 18px 34px rgba(255, 79, 109, 0.12);
}

.card-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.tag {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #ff4f6d;
  background: rgba(255, 79, 109, 0.08);
  border: 1px solid rgba(255, 79, 109, 0.14);
  border-radius: 999px;
}

.card-img-wrap {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(180deg, #fff6f6 0%, #fffaf8 100%);
  border-bottom: 1px solid rgba(255, 79, 109, 0.08);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.product-card:hover .card-img {
  transform: scale(1.04);
}

.img-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .img-overlay {
  opacity: 1;
}

.quick-view {
  padding: 9px 18px;
  background: #ffffff;
  color: #ff4f6d;
  border: 1px solid rgba(255, 79, 109, 0.16);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.card-body {
  padding: 18px;
}

.card-body::after {
  content: '';
  display: block;
  width: 28px;
  height: 1px;
  margin-top: 14px;
  background: rgba(255, 79, 109, 0.22);
}

.card-category {
  margin-bottom: 8px;
  color: #ff4f6d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-name {
  margin-bottom: 10px;
  color: #3a241c;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  color: #9b7867;
  font-size: 11px;
}

.merchant,
.buyers {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.merchant {
  max-width: 56%;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.sales {
  font-size: 11px;
  color: #a07b63;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.price {
  color: #ff5a36;
  font-size: 22px;
  font-weight: 700;
}

.original {
  color: #b59a86;
  font-size: 13px;
  text-decoration: line-through;
}

.add-cart-btn {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ffffff;
  color: #ff4f6d;
  border: 1px solid rgba(255, 79, 109, 0.16);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.add-cart-btn:hover {
  transform: translateY(-1px);
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
}
</style>
