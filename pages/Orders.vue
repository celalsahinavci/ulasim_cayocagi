<script setup>
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import 'bootstrap/dist/css/bootstrap.min.css'

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
  <div class="container-fluid mt-4">
    <div class="row g-4">
      <!-- Manage Orders -->
      <div class="col-12 col-md-12 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">Pending Orders</div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Fiyat</th>
                    <th>Açıklama</th>
                    <th>Durum</th>
                    <th>Sipariş Veren Kullanıcı</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in orders" :key="order.id">
                    <td>{{ order.id }}</td>
                    <td>{{ order.price }} ₺</td>
                    <td>{{ order.description }}</td>
                    <td>
                      <span class="badge rounded-pill bg-warning">{{ order.status }}</span>
                    </td>
                    <td>{{ order.users.isim  }}</td>
                    <td>
                      <button class="btn btn-success btn-sm" @click="applyOrder(order.id)">
                        <i class="bi bi-check-circle"></i> Onayla
                      </button>
                      <button class="btn btn-danger btn-sm ms-2" @click="denyOrder(order.id)">
                        <i class="bi bi-x-circle"></i> İptal Et
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Denial Modal -->
    <div v-if="denialModalVisible" class="modal fade show" style="display: block;" tabindex="-1" aria-labelledby="denialModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="denialModalLabel">Order Denial Description</h5>
            <button type="button" class="btn-close" @click="denialModalVisible = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="denialDescription" class="form-control" rows="3" placeholder="Enter reason for denial..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="denialModalVisible = false">Close</button>
            <button type="button" class="btn btn-danger" @click="confirmDenyOrder">Confirm Denial</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Table Styles */
.table-responsive {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}
.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

/* Modal Styles */
.modal-backdrop.show {
  opacity: 0.5;
}
</style>
