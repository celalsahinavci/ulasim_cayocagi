<script setup>
import { onMounted } from 'vue'
import { useFunctions } from '@/composables/useFunctions'

const {
  products,
  productOptions,
  currentOrder,
  orders,
  fetchProducts,
  fetchProductOptions,
  getFilteredOptions,
  handleProductClick,
  cancelOrder,
  countErrorMessage,
  applyAllOrders,
} = useFunctions()

onMounted(() => {
  fetchProducts()
  fetchProductOptions()
})
</script>

<template>
  <v-app>
    <v-container fluid class="px-6"> 
      <v-row class="mt-4" justify="center">
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
                          <div class="text-subtitle-2 mt-1">{{ product.price }} marka</div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-row class="d-flex justify-center">
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
                      <div style="display: flex; align-items: center;">
                        <v-text-field
                          v-model.number="item.count"
                          type="number"
                          min="1"
                          dense
                          hide-details
                          style="max-width: 80px"
                        ></v-text-field>
                        <span 
                          style="margin-left: 10px; font-size: 18px; color: #ff4081; font-weight: bold;">
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
                    <v-btn color="primary" @click="applyAllOrders" small>
                      Kaydet
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

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
                      {{ item.count }} adet {{ getFilteredOptions(item.product.id).find(option => option.id === item.priority)?.name }} {{ item.product.name }}
                    </template>
                    
                    <template v-slot:item.cost="{ item }">
                      {{ item.product.price * item.count }}
                    </template>
                    <template v-slot:item.priority="{ item }">
                      {{ getFilteredOptions(item.product.id).find(option => option.id === item.priority)?.name || 'Seçim Yapılmadı' }}
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
  max-height: 500px;
  overflow-y: auto;
}

.card-spacing {
  margin-bottom: 20px;
}

.v-card {
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-4px);
}

.v-card img {
  border-radius: 8px;
}

.v-card .text-h6 {
  font-weight: bold;
}

.v-col {
  margin-bottom: 24px;
}

.v-row {
  margin-top: 24px;
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

.v-data-table th {
  background-color: #fafafa;
  color: #333;
  font-weight: bold;
}

.v-data-table td {
  padding: 10px;
}
.v-btn {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.v-btn:hover {
  background-color: #ff4081;
  transform: scale(1.05);
}
</style>
