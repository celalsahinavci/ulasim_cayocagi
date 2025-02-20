<template>
  <div class="container-fluid mt-5">
    <div class="row">
      <div class="col-12">
        <div class="card border-primary mb-3 shadow-sm hover-shadow">
          <div class="card-header bg-primary text-white">Siparişlerim</div>
          
          <!-- User Info Section -->
          <div class="card-body">
            <h5 class="card-title">User Information</h5>
            <p><strong>Ad:</strong> {{ userInfo.name }}</p>
            <p><strong>Email:</strong> {{ userInfo.email }}</p>
            <p><strong>Joined:</strong> {{ formatDate(userInfo.created_at) }}</p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="card text-center shadow-sm hover-shadow">
              <div class="card-body">
                <h5 class="card-title">Total Sipariş</h5>
                <p class="h4">{{ totalOrders }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-center shadow-sm hover-shadow">
              <div class="card-body">
                <h5 class="card-title">Toplam Tutar</h5>
                <p class="h4">{{ totalSpent }} ₺</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-center shadow-sm hover-shadow">
              <div class="card-body">
                <h5 class="card-title">Ortalama Sipariş</h5>
                <p class="h4">{{ averageOrder }} ₺</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie Chart Section -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="chart-container">
              <canvas id="ordersChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead class="table-primary">
              <tr>
                <th scope="col">Sipariş No</th>
                <th scope="col">Ürünler</th>
                <th scope="col">Fiyat</th>
                <th scope="col">Durum</th>
                <th scope="col">Tarih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.order_id" class="table-row-hover">
                <td>{{ order.order_id }}</td>
                <td>{{ order.products }}</td>
                <td>{{ order.cost }} ₺</td>
                <td><span :class="getStatusClass(order.status)">{{ order.status }}</span></td>
                <td>{{ formatDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import Chart from 'chart.js/auto'
import dayjs from 'dayjs'

const supabase = useSupabaseClient()
const orders = ref([])
const rawOrders = ref([])
const productNames = ref({})
const userInfo = ref({})

const formatDate = (dateString) => dayjs(dateString).format('DD/MM/YYYY HH:mm')
const getStatusClass = (status) => {
  return status === 'beklemede' ? 'badge bg-warning' :
         status === 'tamamlandı' ? 'badge bg-success' :
         status === 'iptal' ? 'badge bg-danger' : 'badge bg-secondary'
}

const totalOrders = computed(() => rawOrders.value.length)
const totalSpent = computed(() => rawOrders.value.reduce((sum, order) => sum + order.price, 0))
const averageOrder = computed(() => totalOrders.value > 0 ? (totalSpent.value / totalOrders.value).toFixed(2) : 0)

let chartInstance = null

async function fetchProductNames() {
  const { data, error } = await supabase.from('products').select('id, name')
  if (!error) {
    productNames.value = data.reduce((acc, product) => {
      acc[product.id] = product.name
      return acc
    }, {})
  }
}

async function fetchOrders() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  userInfo.value = {
    name: user.user_metadata.name || 'No Name',
    email: user.email,
    created_at: user.created_at
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`id, price, status, created_at, order_items ( product_id, quantity, price, option_id)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!error) {
    rawOrders.value = data
    orders.value = data.map(order => {
      const orderItemsText = order.order_items.map(item => {
        const productName = productNames.value[item.product_id] || `Ürün ${item.product_id}`
        return `${item.quantity}x ${productName}`
      }).join(', ')
      return {
        order_id: order.id,
        products: orderItemsText,
        cost: order.price,
        status: order.status,
        created_at: order.created_at
      }
    })
    updateChart()
  }
}

function updateChart() {
  const productCounts = {}
  rawOrders.value.forEach(order => {
    order.order_items.forEach(item => {
      const productName = productNames.value[item.product_id] || `Ürün ${item.product_id}`
      productCounts[productName] = (productCounts[productName] || 0) + item.quantity
    })
  })

  const labels = Object.keys(productCounts)
  const dataValues = Object.values(productCounts)
  const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']

  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = dataValues
    chartInstance.update()
  } else {
    const ctx = document.getElementById('ordersChart').getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [{ data: dataValues, backgroundColor: backgroundColors }] },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }
}

onMounted(async () => {
  await fetchProductNames()
  await fetchOrders()
})
</script>

<style scoped>
/* Navbar */
.navbar {
  background-color: #28a745; /* Green color for navbar */
}

.navbar .navbar-brand {
  color: white !important;
}

.navbar .nav-link {
  color: white !important;
}

.navbar .nav-link:hover {
  color: #f1f1f1 !important; /* Light color on hover for nav links */
}

/* Table */
.table-primary {
  background-color: #e2f7e3; /* Light green background for table header */
}

.table thead th {
  background-color: #28a745; /* Green background for the table header */
  color: white; /* White text for better contrast */
}

.table-striped tbody tr:nth-child(odd) {
  background-color: #f4fdf4; /* Light green for odd rows */
}

.table-striped tbody tr:nth-child(even) {
  background-color: #ffffff; /* White for even rows */
}

.table tbody tr:hover {
  background-color: #f1f1f1; /* Slightly darker background on row hover */
}


</style>
