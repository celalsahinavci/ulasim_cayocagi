<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card outlined class="pa-6">
          <v-card-title class="primary--text text-h6">Siparişlerim</v-card-title>
          <v-divider></v-divider>

          <!-- User Info Section -->
          <v-card class="pa-4 mb-6">
            <v-card-title>User Information</v-card-title>
            <v-card-text>
              <p><strong>Ad:</strong> {{ userInfo.name }}</p>
              <p><strong>Email:</strong> {{ userInfo.email }}</p>
              <p><strong>Joined:</strong> {{ formatDate(userInfo.created_at) }}</p>
            </v-card-text>
          </v-card>

          <v-card-text>
            <!-- Summary Cards -->
            <v-row class="mb-6">
              <v-col cols="12" md="4">
                <v-card class="pa-4">
                  <v-card-title>Total Sipariş</v-card-title>
                  <v-card-text class="text-h5">{{ totalOrders }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="pa-4">
                  <v-card-title>Toplam Tutar</v-card-title>
                  <v-card-text class="text-h5">{{ totalSpent }} ₺</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="pa-4">
                  <v-card-title>Ortalama Sipariş</v-card-title>
                  <v-card-text class="text-h5">{{ averageOrder }} ₺</v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Pie Chart Section -->
            <v-row class="mb-6">
              <v-col cols="12">
                <div class="chart-container">
                  <canvas id="ordersChart"></canvas>
                </div>
              </v-col>
            </v-row>

            <!-- Orders Table -->
            <v-data-table
              :headers="ordersTableHeaders"
              :items="orders"
              class="elevation-1"
              dense
            >
              <template v-slot:item.order_id="{ item }">
                {{ item.order_id }}
              </template>
              <template v-slot:item.products="{ item }">
                {{ item.products }}
              </template>
              <template v-slot:item.cost="{ item }">
                {{ item.cost }} ₺
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" dark>{{ item.status }}</v-chip>
              </template>
              <template v-slot:item.created_at="{ item }">
                {{ formatDate(item.created_at) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import Chart from 'chart.js/auto'
import dayjs from 'dayjs'

const supabase = useSupabaseClient()

// Orders and raw order data
const orders = ref([])
const rawOrders = ref([])
const productNames = ref({}) // Stores product names
const userInfo = ref({}) // Store user information

// Table headers
const ordersTableHeaders = [
  { text: 'Sipariş No', value: 'order_id' },
  { text: 'Ürünler', value: 'products' },
  { text: 'Fiyat', value: 'cost' },
  { text: 'Durum', value: 'status' },
  { text: 'Tarih', value: 'created_at' }
]

// Format date using dayjs
function formatDate(dateString) {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm')
}

// Determine color for status chip
function getStatusColor(status) {
  switch (status) {
    case 'beklemede': return 'orange'
    case 'tamamlandı': return 'green'
    case 'iptal': return 'red'
    default: return 'grey'
  }
}

// Summary computed properties
const totalOrders = computed(() => rawOrders.value.length)
const totalSpent = computed(() => {
  return rawOrders.value.reduce((sum, order) => sum + order.price, 0)
})
const averageOrder = computed(() => {
  return totalOrders.value > 0 ? (totalSpent.value / totalOrders.value).toFixed(2) : 0
})

// Chart.js instance
let chartInstance = null

// Fetch product names from Supabase
async function fetchProductNames() {
  const { data, error } = await supabase.from('products').select('id, name')
  if (error) {
    console.error("Error fetching product names:", error)
    return
  }
  productNames.value = data.reduce((acc, product) => {
    acc[product.id] = product.name // Map ID to name
    return acc
  }, {})
}

// Fetch orders for the logged-in user
async function fetchOrders() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fetch user information
  userInfo.value = {
    name: user.user_metadata.name || 'No Name', // Name from user_metadata
    email: user.email,
    created_at: user.created_at
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`id, price, status, created_at, order_items ( product_id, quantity, price, option_id)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return
  }

  rawOrders.value = data

  // Map orders for the table
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

// Create or update the Pie Chart
function updateChart() {
  const productCounts = {}

  rawOrders.value.forEach(order => {
    order.order_items.forEach(item => {
      const productName = productNames.value[item.product_id] || `Ürün ${item.product_id}`
      if (!productCounts[productName]) {
        productCounts[productName] = 0
      }
      productCounts[productName] += item.quantity
    })
  })

  const labels = Object.keys(productCounts)
  const dataValues = Object.values(productCounts)

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  const backgroundColors = labels.map((_, index) => colors[index % colors.length])

  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = dataValues
    chartInstance.data.datasets[0].backgroundColor = backgroundColors
    chartInstance.update()
  } else {
    const ctx = document.getElementById('ordersChart').getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels, // Product names
        datasets: [{
          label: 'Sipariş Edilen Ürünler',
          data: dataValues,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Sipariş Edilen Ürünler' }
        }
      }
    })
  }
}

onMounted(async () => {
  await fetchProductNames() // Get product names first
  await fetchOrders() // Then fetch orders and user info
})
</script>

<style scoped>
.chart-container {
  max-width: 100%;
  height: 400px;
}
</style>
