<template>
  <v-app>
    <v-container fluid class="pa-6">
      <v-row>
        <!-- Product Addition Section -->
        <v-col cols="12" md="4">
          <v-card outlined class="mb-6">
            <v-card-title class="primary--text text-h6">
              Yeni Ürün Ekle
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-form v-model="productFormValid">
                <v-text-field
                  v-model="newProduct.name"
                  label="Ürün Adı"
                  :rules="[nameRequired]"
                  outlined
                  dense
                  required
                ></v-text-field>
                <v-textarea
                  v-model="newProduct.description"
                  label="Açıklama"
                  outlined
                  dense
                ></v-textarea>
                <v-text-field
                  v-model.number="newProduct.price"
                  label="Fiyat"
                  type="number"
                  :rules="[priceRequired]"
                  outlined
                  dense
                  required
                ></v-text-field>

                <!-- Product Options Section -->
                <v-divider class="my-4"></v-divider>
                <div class="text-subtitle-1 mb-2">Ürün Seçenekleri</div>
                <v-btn @click="addOptionField" color="secondary" small>
                  <v-icon left>mdi-plus</v-icon> Seçenek Ekle
                </v-btn>
                <v-row
                  dense
                  v-for="(option, index) in newProductOptions"
                  :key="index"
                  class="mt-2"
                >
                  <v-col cols="10">
                    <v-text-field
                      v-model="option.name"
                      label="Seçenek Adı"
                      :rules="[optionNameRequired]"
                      outlined
                      dense
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="d-flex align-center">
                    <v-btn @click="removeOptionField(index)" color="error" icon>
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

                <v-btn
                  @click="addProduct"
                  :disabled="!isProductValid || !isOptionsValid"
                  color="primary"
                  block
                  class="mt-4"
                >
                  <v-icon left>mdi-content-save</v-icon> Ürün Ekle
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Product Listing Section -->
        <v-col cols="12" md="8">
          <v-card outlined>
            <v-card-title class="primary--text text-h6">
              Mevcut Ürünler
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-list two-line>
                <v-list-item
                  v-for="product in products"
                  :key="product.id"
                  class="mb-3"
                >
                  <v-list-item-content>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="product.name"
                          label="Ürün Adı"
                          :disabled="!product.isEditing"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="3">
                        <v-text-field
                          v-model.number="product.price"
                          label="Fiyat"
                          type="number"
                          :disabled="!product.isEditing"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="5" class="d-flex align-center">
                        <v-btn
                          @click="toggleEdit(product)"
                          color="primary"
                          class="mr-2"
                          outlined
                        >
                          <v-icon left>
                            {{ product.isEditing ? 'mdi-content-save' : 'mdi-pencil' }}
                          </v-icon>
                          {{ product.isEditing ? 'Kaydet' : 'Düzenle' }}
                        </v-btn>
                        <v-btn
                          v-if="product.isEditing"
                          @click="cancelEdit(product)"
                          color="warning"
                          class="mr-2"
                          outlined
                        >
                          <v-icon left>mdi-cancel</v-icon>
                          İptal
                        </v-btn>
                        <v-btn
                          @click="deleteProduct(product.id)"
                          color="error"
                          outlined
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Sil
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- Product Options Section (Visible only during edit mode) -->
                    <div v-if="product.isEditing">
                      <v-row
                        dense
                        v-for="(option, index) in product.options"
                        :key="index"
                        class="mt-2"
                      >
                        <v-col cols="10">
                          <v-text-field
                            v-model="option.name"
                            label="Seçenek Adı"
                            :rules="[optionNameRequired]"
                            outlined
                            dense
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="2" class="d-flex align-center">
                          <v-btn
                            @click="removeOptionField(product, index)"
                            color="error"
                            icon
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                      <!-- Button to add a new option for the existing product -->
                      <v-btn
                        @click="addOptionToProduct(product)"
                        color="secondary"
                        small
                        class="mt-2"
                      >
                        <v-icon left>mdi-plus</v-icon> Seçenek Ekle
                      </v-btn>
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-alert v-if="products.length === 0" type="info">
                  Henüz ürün eklenmemiş.
                </v-alert>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useFunctions } from '#imports'

const supabase = useSupabaseClient()

definePageMeta({
  middleware: 'auth',
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

// Validation rules
const nameRequired = (value) => !!value || 'Ürün adı gereklidir'
const priceRequired = (value) => value > 0 || 'Fiyat gereklidir'
const optionNameRequired = (value) => !!value || 'Seçenek adı gereklidir'

// Check if product is valid before adding
const isProductValid = computed(() => {
  return newProduct.name && newProduct.price > 0
})

// Check if options are valid before adding
const isOptionsValid = computed(() => {
  return (
    newProductOptions.value.length > 0 &&
    newProductOptions.value.every((option) => option.name.trim() !== '')
  )
})

// Add a new product
const addProduct = async () => {
  if (!isProductValid.value || !isOptionsValid.value) return // Don't add if invalid

  // Insert new product into 'products' table and return the new record
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
      },
    ])
    .select('*')

  if (error) {
    console.error('Ürün eklenirken hata:', error.message)
    return
  } else {
    alert('Ürün başarıyla eklendi!')
  }

  // Get the new product's id (assumes data[0] exists)
  const newProductId = data[0].id

  // If there are any options, insert them into 'product_options'
  if (newProductOptions.value.length > 0) {
    const optionsToInsert = newProductOptions.value.map((option) => ({
      product_id: newProductId,
      name: option.name,
    }))

    const { error: optionsError } = await supabase
      .from('product_options')
      .insert(optionsToInsert)
    if (optionsError) {
      console.error('Ürün seçenekleri eklenirken hata:', optionsError.message)
      alert('Ürün eklendi fakat seçenekler eklenemedi.')
    }
  }

  resetForm()
  fetchProducts() // Refresh the product list
}

// Fetch existing products from 'products' table
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_options(*)') // Fetch product options as well
  if (error) {
    console.error('Ürünler alınırken hata:', error.message)
  } else {
    // Initialize each product's `isEditing` property to false and attach its options
    products.value = data.map((product) => ({
      ...product,
      isEditing: false,
      options: product.product_options || [],
    }))
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
  if (!product.isEditing) {
    // Entering edit mode: store a backup of the current values (name, price, and options)
    product._backup = {
      name: product.name,
      price: product.price,
      options: [...product.options], // backup current options
    }
    product.isEditing = true
  } else {
    // Save the changes to Supabase (product details)
    const { error } = await supabase
      .from('products')
      .update({ name: product.name, price: product.price })
      .eq('id', product.id)

    if (error) {
      console.error('Ürün güncellenirken hata:', error.message)
    } else {
      alert('Ürün başarıyla güncellendi!')
    }

    // Update the product options: update existing options and insert new ones
    if (product.options.length > 0) {
      for (const option of product.options) {
        if (option.id) {
          const { error: optionsError } = await supabase
            .from('product_options')
            .update({ name: option.name })
            .eq('id', option.id)

          if (optionsError) {
            console.error('Ürün seçenekleri güncellenirken hata:', optionsError.message)
          }
        } else {
          // Insert new option since it doesn't exist in the database yet
          const { data: insertedData, error: insertError } = await supabase
            .from('product_options')
            .insert({ product_id: product.id, name: option.name })
            .select('*')
          if (insertError) {
            console.error('Yeni ürün seçeneği eklenirken hata:', insertError.message)
          } else if (insertedData && insertedData.length > 0) {
            option.id = insertedData[0].id
          }
        }
      }
    }

    // Remove backup and exit editing mode
    delete product._backup
    product.isEditing = false
  }
}

// Cancel editing: revert changes and exit edit mode
const cancelEdit = (product) => {
  if (product._backup) {
    product.name = product._backup.name
    product.price = product._backup.price
    product.options = [...product._backup.options]
    delete product._backup
  }
  product.isEditing = false
}

// Add a new option input field for the new product form
const addOptionField = () => {
  newProductOptions.value.push({ name: '' })
}

// Add a new option input field for an existing product (in edit mode)
const addOptionToProduct = (product) => {
  product.options.push({ name: '' })
}

// Remove an option input field (for new product form or existing product)
// For new products: only index is passed; for existing products: pass (product, index)
const removeOptionField = async (indexOrProduct, index) => {
  // When called from the new product form, only the index is provided
  if (typeof index === 'undefined') {
    newProductOptions.value.splice(indexOrProduct, 1)
  } else {
    // When editing an existing product, remove from its options array
    const option = indexOrProduct.options[index]
    // If the option exists in the database (has an id), delete it from Supabase
    if (option.id) {
      const { error } = await supabase
        .from('product_options')
        .delete()
        .eq('id', option.id)
      if (error) {
        console.error('Ürün seçeneği silinirken hata:', error.message)
      }
    }
    // Remove the option from the local array
    indexOrProduct.options.splice(index, 1)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
