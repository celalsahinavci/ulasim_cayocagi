<template>
  <v-app>
    <v-container fluid class="px-6"> 
      <!-- Main Content: Product Menu and Orders -->
      <v-row class="mt-4" justify="center">

        <!-- Product Menu Column -->
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-title class="text-h6">Ürün Menüsü</v-card-title>
            <v-divider></v-divider>
            <v-card-text class="menu-scrollable">
              <v-item-group multiple>
                <v-container>
                  <v-row class="d-flex justify-center align-center">
                    <v-col
                      v-for="product in products"
                      :key="product.id"
                      cols="12" md="6" lg="4"
                      class="my-3"
                      style="flex-basis: 20%;"
                    >
                      <v-item v-slot="{ a1, toggle }">
                        <v-card
                          :color="a1 ? 'success' : ''"
                          class="d-flex flex-column align-center"
                          height="auto"
                          @click="handleProductClick(product, toggle)"
                          elevation="2"
                        >
                          <v-img
                            :src="product.icon || '/icon.png'"
                            height="150px"
                            width="100%"
                            alt="Product Image"
                            class="mb-2"
                          ></v-img>
                          <div class="text-h6">{{ product.name }}</div>
                          <div class="text-subtitle-2 mt-1">${{ product.cost }}</div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Orders Section -->
        <v-col cols="12" md="6">
          <v-row class="d-flex justify-center ">
            <!-- Order Details Table -->
            <v-col cols="12" md="12" class="mb-4">
              <v-card outlined class="menu-scrollable">
                <v-card-title>Sipariş Detayları</v-card-title>
                <v-card-text>
                  <v-data-table 
                    :headers="orderDetailsHeaders"
                    :items="currentOrder"
                    class="elevation-1"
                    dense
                  >
                    <template v-slot:item.product="{ item }">
                      {{ item.product.name }}
                    </template>
                    <template v-slot:item.count="{ item }">
                      <v-text-field
                        v-model.number="item.count"
                        type="number"
                        min="1"
                        dense
                        hide-details
                        style="max-width: 80px"
                      ></v-text-field>
                    </template>
                    <template v-slot:item.priority="{ item }">
                      <v-select
  v-model="item.priority"
  :items="priorities"
  item-title="text"
  item-value="value"
  dense
  hide-details
  style="max-width: 150px;"
></v-select>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn color="error" @click="cancelOrder(item)" small>
                        İptal
                      </v-btn>
                    </template>
                  </v-data-table>
                  <!-- Kaydet Button below the table -->
                  <div class="text-right mt-3">
                    <v-btn color="primary" @click="applyAllOrders" small>
                      Kaydet
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Orders Table -->
            <v-col cols="12" md="12">
              <v-card outlined class="menu-scrollable">
                <v-card-title>Siparişler</v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="ordersHeaders"
                    :items="orders"
                    class="elevation-1"
                    dense
                  >
                    <template v-slot:item.product="{ item }">
                      {{ item.product.name }}
                    </template>
                    <template v-slot:item.cost="{ item }">
                      ${{ item.product.cost }}
                    </template>
                    <template v-slot:item.priority="{ item }">
                      {{ getPriorityText(item.priority) }}
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

// Headers for the Orders table
const ordersHeaders = [
  { text: 'Ürün Adı', value: 'product' },
  { text: 'Fiyat', value: 'cost' },
  { text: 'Zaman', value: 'time' },
  { text: 'Durum', value: 'status' },
  { text: 'Öncelik', value: 'priority' },
]

// Headers for the Order Details table, now with a Priority column.
const orderDetailsHeaders = [
  { text: 'Ürün Adı', value: 'product' },
  { text: 'Adet', value: 'count' },
  { text: 'Öncelik', value: 'priority' },
  { text: 'İşlemler', value: 'actions', sortable: false },
]

// Example list of products.
const products = ref([
  { id: 1, name: 'Ürün A', cost: 10, icon: '/icon.png' },
  { id: 2, name: 'Ürün B', cost: 15, icon: '/icon.png' },
  { id: 3, name: 'Ürün C', cost: 20, icon: '/icon.png' },
  // Add more products as needed
])

// List of orders that have been "saved"
const orders = ref([])

// List of products added to order details.
const currentOrder = ref([])

// List of priority options (using Turkish labels)
const priorities = [
  { text: 'Şekersiz', value: 'no_sugar' },
  { text: 'Normal', value: 'normal' },
  { text: 'Az Şekerli', value: 'less_sugar' },
  { text: 'Çok Şekerli', value: 'more_sugar' }
]

// When clicking a product, always add a new row with a default priority.
function handleProductClick(product, toggle) {
  currentOrder.value.push({ product, count: 1, priority: 'normal' })
  toggle && toggle()
}

// Remove an individual order detail row.
function cancelOrder(item) {
  const index = currentOrder.value.findIndex(i => i === item)
  if (index !== -1) {
    currentOrder.value.splice(index, 1)
  }
}

// Apply (save) all current order details to the orders table and clear them.
function applyAllOrders() {
  currentOrder.value.forEach(item => {
    const newOrder = {
      id: Date.now() + Math.random(), // Ensure a unique id
      product: item.product,
      time: new Date().toLocaleTimeString(),
      status: 'Uygulandı',
      count: item.count,
      priority: item.priority
    }
    orders.value.push(newOrder)
  })
  currentOrder.value = []
}

// Utility function to get priority display text from its value.
function getPriorityText(value) {
  const option = priorities.find(p => p.value === value)
  return option ? option.text : value
}
</script>

<style scoped>
.v-toolbar {
  margin-bottom: 16px;
}

.menu-scrollable {
  max-height: 500px; /* Set max height */
  overflow-y: auto; /* Enable scrolling if content exceeds max height */
}

.card-spacing {
  margin-bottom: 20px; /* Adjust as needed */
}

/* Styling for product cards */
.v-card {
  cursor: pointer;
}

.v-card img {
  border-radius: 8px;
}

.v-card .text-h6 {
  font-weight: bold;
}

.v-col {
  margin-bottom: 16px; /* Space between columns */
}
</style>
