<script setup>
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import 'vuetify/styles'  // Import Vuetify styles
import { VBtn, VCard, VCardText, VCardTitle, VDataTable, VDialog, VTextField, VCardActions } from 'vuetify/components'

const supabase = useSupabaseClient()

// Fetching orders from the database
const orders = ref([])

// Denial description and status change date
const denialDescription = ref('') // To store the denial description
const denialModalVisible = ref(false) // To control showing denial modal
const selectedOrder = ref(null) // Store selected order to deny

// Fetch the orders that are pending and display them
async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`id, price, status, created_at, description, status_date, user_id, users(*)`) // Fetching user details as well
    .eq('status', 'beklemede') // Only fetching pending orders
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
  } else {
    orders.value = data
  }
}

// Apply or approve the order
async function applyOrder(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'onaylandı', 
      status_date: new Date().toISOString() // Set approval date
    })
    .eq('id', orderId)

  if (error) {
    console.error('Error applying order:', error)
  } else {
    fetchOrders() // Re-fetch the orders after applying
    console.log(`Order ${orderId} has been applied successfully`)
  }
}

// Deny the order and show denial description modal
function denyOrder(orderId) {
  selectedOrder.value = orderId
  denialModalVisible.value = true
}

// Confirm denial with the description and set the date
async function confirmDenyOrder() {
  if (selectedOrder.value && denialDescription.value) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'reddedildi', 
        denial_description: denialDescription.value, 
        status_date: new Date().toISOString() // Set denial date
      })
      .eq('id', selectedOrder.value)

    if (error) {
      console.error('Error denying order:', error)
    } else {
      fetchOrders() // Re-fetch the orders after denying
      console.log(`Order ${selectedOrder.value} has been denied successfully`)
      denialModalVisible.value = false // Close modal after denial
      denialDescription.value = '' // Reset description
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <v-container fluid>
    <v-row>
      <!-- Manage Orders -->
      <v-col cols="12">
        <v-card class="shadow-sm">
          <v-card-title class="bg-success text-white">Pending Orders</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[
                { text: 'Sipariş No', value: 'id' },
                { text: 'Fiyat', value: 'price' },
                { text: 'Açıklama', value: 'description' },
                { text: 'Durum', value: 'status' },
                { text: 'Sipariş Veren Kullanıcı', value: 'users.isim' },
                { text: 'İşlemler', value: 'actions', sortable: false }
              ]"
              :items="orders"
              item-key="id"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn color="green" small @click="applyOrder(item.id)">
                  <v-icon left>mdi-check-circle</v-icon> Onayla
                </v-btn>
                <v-btn color="red" small class="ml-2" @click="denyOrder(item.id)">
                  <v-icon left>mdi-close-circle</v-icon> İptal Et
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Denial Modal -->
    <v-dialog v-model="denialModalVisible" max-width="500px">
      <v-card>
        <!-- Remove VDialogTitle and place the title directly in the card -->
        <v-card-title class="headline">Order Denial Description</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="denialDescription"
            label="Enter reason for denial"
            multiline
            rows="4"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="denialModalVisible = false">Close</v-btn>
          <v-btn color="red" @click="confirmDenyOrder">Confirm Denial</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* Vuetify Styles */
.v-card-title {
  font-weight: bold;
  font-size: 18px;
}

.v-btn {
  font-weight: 600;
  text-transform: uppercase;
}

.v-data-table .v-btn {
  margin-top: 5px;
}
</style>
