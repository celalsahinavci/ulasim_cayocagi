<script setup>
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
const supabase = useSupabaseClient()

definePageMeta({
  middleware: "auth",
})

// Reactive variables to hold data
const products = ref([])
const productOptions = ref([])
const currentOrder = ref([])
const orders = ref([])

// Table headers for the Sipariş Detayları table
const orderDetailsHeaders = [
  { text: 'Ürün', value: 'product' },
  { text: 'Adet', value: 'count' },
  { text: 'Seçenekler', value: 'priority' },
  { text: 'İşlemler', value: 'actions' }
]

// Table headers for the Siparişler table (one row per order)
const ordersHeaders = [
  { text: 'Sipariş No', value: 'order_id' },
  { text: 'Ürünler', value: 'products' },
  { text: 'Fiyat', value: 'cost' },
  { text: 'Durum', value: 'status' },
  { text: 'Açıklama', value: 'description' }
]

// Fetch products from Supabase
async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Error fetching products:', error)
  } else {
    products.value = data
  }
}

// Fetch product options from Supabase (assumes a "product_id" field exists)
async function fetchProductOptions() {
  const { data, error } = await supabase.from('product_options').select('*')
  if (error) {
    console.error('Error fetching product options:', error)
  } else {
    productOptions.value = data
  }
}

// Get options filtered by the given product id
function getFilteredOptions(productId) {
  return productOptions.value.filter(option => option.product_id === productId)
}

// Handle a product click: add it to currentOrder every time it's clicked.
function handleProductClick(product, toggle) {
  currentOrder.value.push({
    product,
    count: 1,
    priority: null
  })
  // If needed, update UI selection state with toggle()
  toggle && toggle()
}

// Remove an item from the current order list
function cancelOrder(item) {
  currentOrder.value = currentOrder.value.filter(orderItem => orderItem !== item)
}

// Optionally, display a message if count is less than 1.
function countErrorMessage(count) {
  return count <= 0 ? 'Adet 1 den küçük olamaz' : ''
}

// Create a new order and insert order items into Supabase
const orderDescription = ref('')

// Function to apply all orders and add description
async function applyAllOrders() {
  if (currentOrder.value.length === 0) {
    console.warn('No order items to save.')
    return
  }

  // Retrieve the current user's ID (adjust based on your auth setup)
  const { data: { user } } = await supabase.auth.getUser()
  const user_id = user ? user.id : null

  // Calculate the total price for the order
  const totalPrice = currentOrder.value.reduce((total, item) => {
    return total + item.count * item.product.price
  }, 0)

  // Insert a new order record in the orders table, including the description
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id,
      price: totalPrice,
      status: 'beklemede',
      description: orderDescription.value // Add the description here
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return
  }

  // Prepare order items for insertion
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

  // Clear the current order and refresh the orders list
  currentOrder.value = []
  fetchOrders()
  console.log('Order successfully saved!')
}

// Fetch orders (with their order items) from Supabase.
// Group orders so that each order appears as a single row with a summary of items.
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
    orders.value = data.map(order => {
      // Build a summary text for all items in the order
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
})

// Function to get status color
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
  <v-app>
    <v-container fluid class="px-0">
      <v-row class="fill-height" align="stretch" justify="start">
        <!-- Ürün Menüsü -->
        <v-col cols="12" md="4" class="d-flex">
          <v-card outlined class="menu-card flex-grow-1">
            <v-card-title class="text-h6 primary--text">Ürün Menüsü</v-card-title>
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
                      <v-item v-slot="{ active, toggle }">
                        <v-card
                          :color="active ? 'light-green lighten-4' : 'white'"
                          class="d-flex flex-column align-center hover-card"
                          height="auto"
                          @click="handleProductClick(product, toggle)"
                          elevation="2"
                        >
                          <v-img
                            :src="product.icon || '/icon.png'"
                            height="150px"
                            width="100%"
                            alt="Product Image"
                            class="mb-2 rounded-img"
                          ></v-img>
                          <div class="text-h6">{{ product.name }}</div>
                          <div class="text-subtitle-2 mt-1">{{ product.price }} ₺</div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sipariş Detayları and Siparişler -->
        <v-col cols="12" md="8" class="d-flex">
          <v-row class="fill-height" align="stretch" justify="start">
            <!-- Sipariş Detayları -->
            <v-col cols="12" class="mb-4" v-if="currentOrder.length > 0">
              <v-card outlined class="menu-card">
                <v-card-title class="primary--text">Sipariş Detayları</v-card-title>
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
                      <div class="d-flex align-center">
                        <v-text-field
                          v-model.number="item.count"
                          type="number"
                          min="1"
                          dense
                          hide-details
                          class="count-input"
                        ></v-text-field>
                        <span class="count-price">
                          Toplam fiyat: {{ item.count * item.product.price }} ₺
                        </span>
                      </div>
                    </template>

                    <template v-slot:item.priority="{ item }">
                      <v-select
                        v-model="item.priority"
                        :items="getFilteredOptions(item.product.id)"
                        item-title="name"
                        item-value="id"
                        label="Seçenekler"
                        dense
                        outlined
                      />
                    </template>
                    
                    <template v-slot:item.actions="{ item }">
                      <v-btn color="error" @click="cancelOrder(item)" small>
                        İptal
                      </v-btn>
                    </template>
                  </v-data-table>
                  <div class="text-right mt-3">
                    <v-text-field
                  v-model="orderDescription"
                   label="Sipariş Açıklaması"
                   outlined
                   dense
                   ></v-text-field>
                    <v-btn color="primary" @click="applyAllOrders" small>
                      Kaydet
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Siparişler -->
            <v-col cols="12" v-if="orders.length > 0">
              <v-card outlined class="menu-card">
                <v-card-title class="primary--text">Siparişler</v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="ordersHeaders"
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
                    <template v-slot:item.description="{ item }">
                      {{ item.description }} 
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

<style scoped>
.v-toolbar {
  margin-bottom: 16px;
}

.menu-scrollable {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.card-spacing {
  margin-bottom: 20px;
}

.menu-card {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition: transform 0.2s ease-in-out;
  flex-grow: 1;
}

.menu-card:hover {
  transform: translateY(-4px);
}

.v-card .text-h6 {
  font-weight: bold;
}

.v-card img {
  border-radius: 8px;
}

.v-btn.error:hover {
  background-color: #ff5252;
  transform: scale(1.1);
}

.v-btn.primary:hover {
  background-color: #4caf50;
  transform: scale(1.1);
}

.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}
.v-data-table {
  max-height: 300px; /* Adjust this value as needed */
  overflow-y: auto; /* Allow scrolling if the content overflows */
}
.v-data-table th {
  background-color: #fafafa;
  color: #333;
  font-weight: bold;
}

.v-data-table td {
  padding: 10px;
}

.count-input {
  max-width: 80px;
}

.count-price {
  margin-left: 10px;
  font-size: 18px;
  color: #ff4081;
  font-weight: bold;
}

.v-btn {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.v-btn:hover {
  background-color: #ff4081;
  transform: scale(1.05);
}

.rounded-img {
  border-radius: 8px;
}

.hover-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
}

.fill-height {
  height: 100%;
}

.d-flex {
  display: flex;
}

.flex-grow-1 {
  flex-grow: 1;
}

.v-col {
  padding: 0;
  margin-bottom: 0;
}
</style>
