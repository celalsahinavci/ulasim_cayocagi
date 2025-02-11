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
                  <!-- Product Fields -->
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
  
                  <!-- Product Options Section -->
                  <v-divider class="my-4"></v-divider>
                  <div class="mb-2 text-h6">Ürün Seçenekleri</div>
                  <v-btn @click="addOptionField" color="secondary" small>
                    Seçenek Ekle
                  </v-btn>
                  <div v-for="(option, index) in newProductOptions" :key="index" class="mt-2 d-flex align-center">
                    <v-text-field
                      v-model="option.name"
                      label="Seçenek Adı"
                      required
                      class="flex-grow-1"
                    ></v-text-field>
                    <v-btn @click="removeOptionField(index)" color="error" small>
                      Kaldır
                    </v-btn>
                  </div>
  
                  <v-btn @click="addProduct" :disabled="!productFormValid" color="primary" class="mt-4">
                    Ürün Ekle
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
  
          <!-- Mevcut Ürünleri Listeleme ve Düzenleme -->
          <v-col cols="12" md="6" class="pa-4">
            <v-card outlined>
              <v-card-title class="text-h6">Mevcut Ürünler</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-list>
                  <v-list-item-group v-if="products.length > 0">
                    <v-list-item v-for="product in products" :key="product.id">
                      <v-list-item-content>
                        <!-- Ürün İsmi (Güncellenebilir) -->
                        <v-text-field
                          v-model="product.name"
                          label="Ürün Adı"
                          :disabled="!product.isEditing"
                        ></v-text-field>
  
                        <!-- Ürün Fiyatı (Güncellenebilir) -->
                        <v-text-field
                          v-model.number="product.price"
                          label="Fiyat"
                          type="number"
                          :disabled="!product.isEditing"
                        ></v-text-field>
  
                        <!-- Düzenle/Kaydet Butonu -->
                        <v-btn 
                          @click="toggleEdit(product)" 
                          color="primary"
                        >
                          {{ product.isEditing ? 'Kaydet' : 'Düzenle' }}
                        </v-btn>
  
                        <!-- Silme Butonu -->
                        <v-btn @click="deleteProduct(product.id)" color="red" dark>
                          Sil
                        </v-btn>
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
  import { useFunctions } from '#imports'
  
  const supabase = useSupabaseClient()
  
  definePageMeta({
    middleware: "auth",
  })
  
  // New product form data
  const newProduct = reactive({
    name: '',
    description: '',
    price: 0,
  })
  
  // Array for new product options
  const newProductOptions = ref([])
  
  // Get functions for deleting/updating existing products
  const { deleteProduct, updateProduct } = useFunctions()
  
  const products = ref([]) // List of existing products
  const productFormValid = ref(false)
  
  // Add a new product
  const addProduct = async () => {
    // Insert new product into 'products' table
    const { data, error } = await supabase.from('products').insert([{
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
    }]).select('*')  // Returns the inserted record including its id
  
    if (error) {
      console.error('Ürün eklenirken hata:', error.message)
      return
    } else {
      alert('Ürün başarıyla eklendi!')
    }
  
    // Get the new product's id (assumes data[0] exists)
    const newProductId = data[0].id
  
    // If there are any options, insert them into 'product_options'
    if(newProductOptions.value.length > 0) {
      const optionsToInsert = newProductOptions.value.map(option => ({
        product_id: newProductId,
        name: option.name,
      }))
  
      const { error: optionsError } = await supabase.from('product_options').insert(optionsToInsert)
      if(optionsError) {
        console.error('Ürün seçenekleri eklenirken hata:', optionsError.message)
        alert('Ürün eklendi fakat seçenekler eklenemedi.')
      }
    }
  
    resetForm()
    fetchProducts()  // Refresh the product list
  }
  
  // Fetch existing products from 'products' table
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Ürünler alınırken hata:', error.message)
    } else {
      // Initialize each product's `isEditing` property to false
      products.value = data.map(product => ({ ...product, isEditing: false }))
    }
  }
  
  // Reset new product form and options
  const resetForm = () => {
    newProduct.name = ''
    newProduct.description = ''
    newProduct.price = 0
    newProductOptions.value = []
  }
  
  // Toggle edit mode for a product (and update it if saving)
  const toggleEdit = async (product) => {
    if (product.isEditing) {
      // Save the changes to Supabase
      const { error } = await supabase
        .from('products')
        .update({ name: product.name, price: product.price })
        .eq('id', product.id)
        
      if (error) {
        console.error('Ürün güncellenirken hata:', error.message)
      } else {
        alert('Ürün başarıyla güncellendi!')
      }
    }
    // Toggle the editing state
    product.isEditing = !product.isEditing
  }
  
  // Add a new option field for the product being created
  const addOptionField = () => {
    newProductOptions.value.push({ name: '' })
  }
  
  // Remove an option field from the new product form
  const removeOptionField = (index) => {
    newProductOptions.value.splice(index, 1)
  }
  
  onMounted(() => {
    fetchProducts()  // Load existing products on mount
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
    gap: 1px;
  }
  
  .v-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .pa-4 {
    padding: 5px;
  }
  </style>
  