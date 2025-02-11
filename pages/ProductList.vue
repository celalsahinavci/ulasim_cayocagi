<template>
    <v-app>
      <v-container fluid class="px-6">
        <v-row justify="center" class="mx-0" align="start">
  
          <!-- Ürün Ekleme -->
          <v-col cols="12" md="4" class="pa-4">
            <v-card outlined>
              <v-card-title class="text-h6">Yeni Ürün Ekle</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-form v-model="productFormValid">
                  <v-text-field
                    v-model="newProduct.name"
                    label="Ürün Adı"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="newProduct.description"
                    label="Açıklama"
                  ></v-textarea>
                  <v-text-field
                    v-model.number="newProduct.price"
                    label="Fiyat"
                    type="number"
                    required
                  ></v-text-field>
      
                  <v-btn @click="addProduct" :disabled="!productFormValid" color="primary">
                    Ürün Ekle
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
  
          <!-- Mevcut Ürünleri Listeleme -->
          <v-col cols="12" md="6" class="pa-4">
            <v-card outlined>
              <v-card-title class="text-h6">Mevcut Ürünler</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-list>
                  <v-list-item-group v-if="products.length > 0">
                    <v-list-item v-for="product in products" :key="product.id">
                      <v-list-item-content>
                        <v-list-item-title>{{ product.name }}</v-list-item-title>
                        <v-list-item-subtitle>Fiyat: {{ product.price }} ₺</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                  <v-alert v-else type="info">Henüz ürün eklenmemiş.</v-alert>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
  
        </v-row>
      </v-container>
    </v-app>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { useSupabaseClient } from '#imports'
  
  const supabase = useSupabaseClient()
  
  // Yeni ürün form verisi
  const newProduct = reactive({
    name: '',
    description: '',
    price: 0,
  })
  
  const products = ref([]) // Ürünler listesi
  const productFormValid = ref(false)
  
  // Ürün ekleme
  const addProduct = async () => {
    const { data, error } = await supabase.from('products').insert([{
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
    }])
  
    if (error) {
      console.error('Ürün eklenirken hata:', error.message)
    } else {
      alert('Ürün başarıyla eklendi!')
      resetForm()  // Formu sıfırlıyoruz
      fetchProducts()  // Ürünleri tekrar alıyoruz
    }
  }
  
  // Ürünleri al
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Ürünler alınırken hata:', error.message)
    } else {
      products.value = data
    }
  }
  
  // Formu sıfırlama
  const resetForm = () => {
    newProduct.name = ''
    newProduct.description = ''
    newProduct.price = 0
  }
  
  onMounted(() => {
    fetchProducts()  // Ürünleri al
  })
  </script>
  
  <style scoped>
  .v-card {
    margin-bottom: 0px;
  }
  
  .v-btn {
    margin-top: 10px;
  }
  
  /* Ensure proper horizontal padding for the row and columns */
  .v-container {
    padding-left: 50px !important;
    padding-right: 50px !important;
  }
  
  .v-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
    gap: 1px; /* Reduced the gap between columns */
  }
  
  .v-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .pa-4 {
    padding: 5px; /* Keeps consistent padding inside each column */
  }
  </style>
  