<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

const products = ref([]) // Ürünler
const productOptions = ref([]) // Tüm ürün seçenekleri (priorities)
const currentOrder = ref([]) // Sipariş edilen ürünler
const orders = ref([]) // Onaylanan siparişler

// 📌 Ürünleri Supabase'den çek
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Ürünler alınırken hata:', error.message)
    alert('Ürünler alınırken hata oluştu. Lütfen tekrar deneyin.')
  } else {
    products.value = data
  }
}

// 📌 Tüm ürün seçeneklerini (priorities) çek
const fetchProductOptions = async () => {
  const { data, error } = await supabase.from('product_options').select('*')
  if (error) {
    console.error('Ürün seçenekleri alınırken hata:', error.message)
    alert('Ürün seçenekleri alınırken hata oluştu. Lütfen tekrar deneyin.')
  } else {
    productOptions.value = data
  }
}

const optionsCache = new Map()


// 📌 Seçilen ürüne göre filtreleme yap
const getFilteredOptions = (productId) => {
  if (optionsCache.has(productId)) {
    // Eğer cache'de varsa, doğrudan döndürüyoruz
    return optionsCache.get(productId)
  } else {
    // Cache'de yoksa, filtreyi uygulayıp cache'e ekliyoruz
    const filteredOptions = productOptions.value.filter(option => option.product_id === productId)
    optionsCache.set(productId, filteredOptions)
    return filteredOptions
  }
}

// 📌 Sayfa açıldığında verileri çek
onMounted(() => {
  fetchProducts()
  fetchProductOptions()
})

// 📌 Ürün seçildiğinde sipariş listesine ekle
const handleProductClick = (product, toggle) => {
  currentOrder.value.push({
    product,
    count: 1,
    priority: null, // Seçenekler için boş başlangıç
  })
  toggle && toggle()
}

// 📌 Siparişten çıkar
const cancelOrder = (item) => {
  currentOrder.value = currentOrder.value.filter(i => i !== item)
}

const countErrorMessage = computed(() => {
  return currentOrder.value.some(item => item.count < 1) ? 'Adet en az 1 olmalı!' : ''
})

// 📌 Siparişi onayla
const applyAllOrders = () => {
  if (currentOrder.value.length === 0) {
    alert('Sipariş listeniz boş. Lütfen en az bir ürün ekleyin.')
    return
  }

  currentOrder.value.forEach(item => {
    if (!item.product || !item.priority || item.count < 1) {
      alert('Eksik veya hatalı veri var. Lütfen tüm bilgileri doldurduğunuzdan emin olun.')
      return
    }

    const newOrder = {
      id: Date.now() + Math.random(), // Benzersiz ID
      product: item.product,
      time: new Date().toLocaleTimeString(),
      status: 'Uygulandı',
      count: item.count,
      priority: item.priority,
    }
    orders.value.push(newOrder)
  })
  currentOrder.value = []
}


// **Tablo Başlıkları**
const ordersHeaders = [
  { text: 'Ürün Adı', value: 'product' },
  { text: 'Fiyat', value: 'cost' },
  { text: 'Zaman', value: 'time' },
  { text: 'Durum', value: 'status' },
  { text: 'Seçenek', value: 'priority' },
]

const orderDetailsHeaders = [
  { text: 'Ürün Adı', value: 'product' },
  { text: 'Adet', value: 'count' },
  { text: 'Öncelik', value: 'priority' },
  { text: 'İşlemler', value: 'actions', sortable: false },
]
</script>

<template>
  <v-app>
    <v-container fluid class="px-6"> 
      <v-row class="mt-4" justify="center">
        <!-- Ürün Menüsü -->
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

        <!-- Sipariş Bölümü -->
        <v-col cols="12" md="6">
          <v-row class="d-flex justify-center">
            
            <!-- Sipariş Detayları -->
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

            <!-- Siparişler Tablosu -->
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
  max-height: 500px; /* Set max height */
  overflow-y: auto; /* Enable scrolling if content exceeds max height */
}

.card-spacing {
  margin-bottom: 20px; /* Adjust as needed */
}

/* Styling for product cards */
.v-card {
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); /* Yumuşak gölge */
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-4px); /* Hover efekti ile kartı biraz yukarı kaydırma */
}

.v-card img {
  border-radius: 8px;
}

.v-card .text-h6 {
  font-weight: bold;
}

.v-col {
  margin-bottom: 24px; /* Kartlar arasında daha fazla boşluk bırakma */
}

.v-row {
  margin-top: 24px; /* Üst kısımdan biraz boşluk bırakma */
}

.v-btn.error:hover {
  background-color: #ff5252; /* Hover sırasında kırmızı tonunda renk değişimi */
  transform: scale(1.1); /* Butonun biraz büyümesi */
}

.v-btn.primary:hover {
  background-color: #4caf50; /* Hover sırasında yeşil tonunda renk değişimi */
  transform: scale(1.1); /* Butonun biraz büyümesi */
}
.v-data-table tbody tr:hover {
  background-color: #f5f5f5; /* Hover sırasında satır rengini değiştirme */
}

.v-data-table th {
  background-color: #fafafa; /* Başlıkların arka planını açık yapma */
  color: #333; /* Başlık rengini koyu yapma */
  font-weight: bold;
}

.v-data-table td {
  padding: 10px; /* Hücrelere daha fazla boşluk ekleyerek daha temiz bir görünüm sağlama */
}
.v-btn {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.v-btn:hover {
  background-color: #ff4081; /* Hover sırasında renk değişimi */
  transform: scale(1.05); /* Hover sırasında buton büyüme efekti */
}
</style>
