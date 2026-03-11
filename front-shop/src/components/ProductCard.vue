<template>
  <div class="product-card glass-card" @click="$router.push(`/product/${product.id}`)">
    <!-- 标签 -->
    <div class="card-tags">
      <span v-for="tag in product.tags" :key="tag" class="tag" :class="tag">{{ tag }}</span>
    </div>

    <!-- 图片 -->
    <div class="card-img-wrap">
      <img :src="product.image" :alt="product.name" class="card-img" loading="lazy" />
      <div class="img-overlay">
        <button class="quick-view" @click.stop="$router.push(`/product/${product.id}`)">快速查看</button>
      </div>
    </div>

    <!-- 信息 -->
    <div class="card-body">
      <p class="card-category">{{ product.category }}</p>
      <h3 class="card-name">{{ product.name }}</h3>
      <div class="card-rating">
        <el-rate :model-value="product.rating" disabled size="small" />
        <span class="sales">已售 {{ product.sales?.toLocaleString() }}</span>
      </div>
      <div class="card-price">
        <span class="price">¥{{ product.price.toLocaleString() }}</span>
        <span v-if="product.originalPrice" class="original">¥{{ product.originalPrice.toLocaleString() }}</span>
      </div>
      <button class="add-cart-btn" @click.stop="$emit('add-cart', product)">
        <el-icon><ShoppingCart /></el-icon>
        加入购物车
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ product: { type: Object, required: true } })
defineEmits(['add-cart'])
</script>

<style scoped>
.product-card {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}
.product-card:hover {
  transform: translateY(-8px);
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 20px 50px rgba(99,102,241,0.2);
}

.card-tags {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 2;
  display: flex; gap: 6px;
}
.tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
}
.tag.热卖 { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.tag.新品 { background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
.tag.优惠 { background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }

.card-img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: rgba(15,15,26,0.5);
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.product-card:hover .card-img { transform: scale(1.08); }

.img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.product-card:hover .img-overlay { opacity: 1; }

.quick-view {
  padding: 8px 20px;
  background: white;
  color: #1a1a2e;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.card-body { padding: 16px; }
.card-category { font-size: 12px; color: #6366f1; margin-bottom: 6px; }
.card-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.sales { font-size: 11px; color: #64748b; }
.card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
.price { font-size: 20px; font-weight: 700; color: #f472b6; }
.original { font-size: 13px; color: #475569; text-decoration: line-through; }

.add-cart-btn {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.1));
  border: 1px solid rgba(99,102,241,0.35);
  border-radius: 8px;
  color: #818cf8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}
.add-cart-btn:hover {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-color: #6366f1;
  color: white;
  transform: translateY(-1px);
}
</style>
