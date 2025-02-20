<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'
import 'bootstrap/dist/css/bootstrap.min.css'

const supabase = useSupabaseClient()

definePageMeta({
  middleware: "auth",
})

function subscribeToOrders() {
  const ordersChannel = supabase.channel('orders-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      payload => {
        console.log('New order inserted!', payload)
        fetchOrders() // Update orders, e.g. by re-fetching or modifying state
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      payload => {
        console.log('Order updated!', payload)
        fetchOrders()
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'orders' },
      payload => {
        console.log('Order deleted!', payload)
        fetchOrders()
      }
    )
    .subscribe()

  onUnmounted(() => {
    ordersChannel.unsubscribe()
  })
}

const products = ref([])
const productOptions = ref([])
const currentOrder = ref([])
const orders = ref([])

const orderDetailsHeaders = [
  { text: 'Ürün', value: 'product' },
  { text: 'Adet', value: 'count' },
  { text: 'Seçenekler', value: 'priority' },
  { text: 'İşlemler', value: 'actions' }
]

const ordersHeaders = [
  { text: 'Sipariş No', value: 'order_id' },
  { text: 'Ürünler', value: 'products' },
  { text: 'Fiyat', value: 'cost' },
  { text: 'Durum', value: 'status' },
  { text: 'Açıklama', value: 'description' }
]

async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Error fetching products:', error)
  } else {
    products.value = data
  }
}

async function fetchProductOptions() {
  const { data, error } = await supabase.from('product_options').select('*')
  if (error) {
    console.error('Error fetching product options:', error)
  } else {
    productOptions.value = data
  }
}

function getFilteredOptions(productId, currentItem) {
  const optionsForProduct = productOptions.value.filter(option => option.product_id === productId)
  const selectedOptionIds = currentOrder.value
    .filter(item => item !== currentItem && item.priority)
    .map(item => item.priority)

  return optionsForProduct.filter(
    option => !selectedOptionIds.includes(option.id) || currentItem.priority === option.id
  )
}

function handleProductClick(product, toggle) {
  const optionsForProduct = productOptions.value.filter(opt => opt.product_id === product.id);
  const maxAllowedCount = optionsForProduct.length || 1;

  const existingCount = currentOrder.value.filter(item => item.product.id === product.id).length;

  if (existingCount >= maxAllowedCount) {
    console.warn(`Bu üründen en fazla ${maxAllowedCount} adet ekleyebilirsiniz.`);
    return;
  }

  currentOrder.value.push({
    product,
    count: 1,
    priority: null
  });

  toggle && toggle();
}

function cancelOrder(item) {
  currentOrder.value = currentOrder.value.filter(orderItem => orderItem !== item)
}

function countErrorMessage(count) {
  return count <= 0 ? 'Adet 1 den küçük olamaz' : ''
}

const orderDescription = ref('')

async function applyAllOrders() {
  if (currentOrder.value.length === 0) {
    console.warn('No order items to save.')
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  const user_id = user ? user.id : null

  const totalPrice = currentOrder.value.reduce((total, item) => {
    return total + item.count * item.product.price
  }, 0)

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id,
      price: totalPrice,
      status: 'beklemede',
      description: orderDescription.value
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return
  }

  const orderItems = currentOrder.value.map(item => ({
    order_id: orderData.id,
    product_id: item.product.id,
    quantity: item.count,
    price: item.product.price,
    option_id: item.priority ? item.priority : null
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error inserting order items:', itemsError)
    return
  }

  currentOrder.value = []
  fetchOrders()
  console.log('Order successfully saved!')
}

async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      price,
      status,
      created_at,
      description,
      order_items (
        product_id,
        quantity,
        price,
        option_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
  } else {
    const today = new Date().toISOString().split('T')[0]

    orders.value = data.filter(order => {
      const createdDate = order.created_at.split('T')[0]
      return createdDate === today
    }).map(order => {
      const orderItemsText = order.order_items.map(item => {
        const product = products.value.find(p => p.id === item.product_id)
        const productName = product ? product.name : 'Bilinmeyen Ürün'
        const option = productOptions.value.find(opt => opt.id === item.option_id)
        const optionName = option ? `(${option.name})` : ''
        return `${item.quantity}x ${productName} ${optionName}`.trim()
      }).join(', ')

      return {
        order_id: order.id,
        products: orderItemsText,
        cost: order.price,
        status: order.status,
        created_at: order.created_at,
        description: order.description
      }
    })
  }
}

onMounted(() => {
  fetchProducts()
  fetchProductOptions()
  fetchOrders()
  subscribeToOrders()
})

const getStatusColor = (status) => {
  switch (status) {
    case 'beklemede':
      return 'orange'
    case 'tamamlandı':
      return 'green'
    case 'iptal':
      return 'red'
    default:
      return 'grey'
  }
}
</script>

<template>
  <div class="container-fluid mt-4">
    <div class="row g-4">
      <!-- Ürün Menüsü -->
      <div class="col-12 col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">Ürün Menüsü</div>
          <div class="card-body">
            <div class="row">
              <div class="col-6 col-md-4" v-for="product in products" :key="product.id">
                <div class="card mb-3" @click="handleProductClick(product)" style="cursor: pointer;">
                  <img :src="product.icon || '/icon.png'" class="card-img-top" alt="Product Image">
                  <div class="card-body">
                    <h5 class="card-title">{{ product.name }}</h5>
                    <p class="card-text text-muted">{{ product.price }} ₺</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sipariş Detayları -->
      <div class="col-12 col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-info text-white">Sipariş Detayları</div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Seçenekler</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in currentOrder" :key="item.product.id">
                    <td>{{ item.product.name }}</td>
                    <td>
                      <input type="number" v-model.number="item.count" min="1" class="form-control">
                    </td>
                    <td>
                      <select v-model="item.priority" class="form-select">
                        <option v-for="option in getFilteredOptions(item.product.id, item)" :key="option.id" :value="option.id">
                          {{ option.name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <button class="btn btn-danger btn-sm" @click="cancelOrder(item)">
                        <i class="bi bi-x-circle"></i> İptal
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="d-flex justify-content-end mt-3">
              <input v-model="orderDescription" class="form-control w-50" placeholder="Sipariş Açıklaması" />
              <button class="btn btn-primary ms-2" @click="applyAllOrders">
                <i class="bi bi-save"></i> Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Siparişler -->
      <div class="col-12 col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">Siparişler</div>
          <div class="card-body">
            <div class="table-responsive" style="max-height: 400px;">
              <table class="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Ürünler</th>
                    <th>Fiyat</th>
                    <th>Durum</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in orders" :key="order.order_id">
                    <td>{{ order.order_id }}</td>
                    <td style="word-wrap: break-word;">{{ order.products }}</td>
                    <td>{{ order.cost }} ₺</td>
                    <td>
                      <span :class="'badge rounded-pill bg-' + getStatusColor(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td style="word-wrap: break-word;">{{ order.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Global Body Styles */
body {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* Container Spacing */
.container-fluid {
  padding: 2rem;
}

/* Card Styles */
.card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Card Header Styles */
.card-header {
  color: #fff;
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  text-align: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  font-weight: bold;
}

/* Specific Header Colors */
.card-header.bg-primary {
  background-color: #007bff !important;
}
.card-header.bg-info {
  background-color: #17a2b8 !important;
}
.card-header.bg-success {
  background-color: #28a745 !important;
}

/* Card Body */
.card-body {
  padding: 1rem;
  background-color: #fff;
}

/* Table Styles */
.table-responsive {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.table {
  margin-bottom: 0;
}
.table thead th {
  background-color: #f8f9fa;
  color: #343a40;
  font-weight: bold;
  text-align: center;
  border-bottom: 2px solid #dee2e6;
}
.table tbody td {
  text-align: center;
  vertical-align: middle;
}

/* Form Controls */
.form-control,
.form-select {
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid #ced4da;
  transition: border-color 0.2s ease;
}
.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

/* Button Styles */
.btn {
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  text-transform: uppercase;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}
.btn-primary:hover {
  background-color: #0069d9;
  border-color: #0062cc;
}
.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Badge Colors */
.badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}
.bg-orange {
  background-color: #fd7e14 !important;
}
.bg-green {
  background-color: #28a745 !important;
}
.bg-red {
  background-color: #dc3545 !important;
}
.bg-grey {
  background-color: #6c757d !important;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .container-fluid {
    padding: 1rem;
  }
}
</style>
