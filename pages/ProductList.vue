<template>
  <div>
    <div class="container-fluid p-4">
      <div class="row">
        <!-- Product Addition Section -->
        <div class="col-12 col-md-4 mb-4">
          <div class="card border mb-3">
            <div class="card-header text-primary h5">
              Yeni Ürün Ekle
            </div>
            <hr class="my-0" />
            <div class="card-body">
              <form novalidate>
                <div class="mb-3">
                  <label class="form-label">Ürün Adı</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newProduct.name"
                    required
                  />
                </div>
                <!-- <div class="mb-3">
                  <label class="form-label">Açıklama</label>
                  <textarea
                    class="form-control"
                    v-model="newProduct.description"
                    rows="2"
                  ></textarea>
                </div> -->
                <div class="mb-3">
                  <label class="form-label">Fiyat</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="newProduct.price"
                    required
                  />
                </div>

                <!-- Product Options Section -->
                <hr class="my-4" />
                <div class="mb-2 fw-bold">Ürün Seçenekleri</div>
                <button
                  type="button"
                  @click="addOptionField"
                  class="btn btn-secondary btn-sm mb-2"
                >
                  <i class="bi bi-plus me-1"></i> Seçenek Ekle
                </button>
                <div
                  class="row g-2 mt-2"
                  v-for="(option, index) in newProductOptions"
                  :key="index"
                >
                  <div class="col-10">
                    <input
                      type="text"
                      class="form-control"
                      v-model="option.name"
                      placeholder="Seçenek Adı"
                      required
                    />
                  </div>
                  <div class="col-2 d-flex align-items-center">
                    <button
                      type="button"
                      @click="removeOptionField(index)"
                      class="btn btn-danger btn-sm"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  @click="addProduct"
                  :disabled="!isProductValid || !isOptionsValid"
                  class="btn btn-primary w-100 mt-4"
                >
                  <i class="bi bi-save me-1"></i> Ürün Ekle
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Product Listing Section -->
        <div class="col-12 col-md-8 mb-4">
          <div class="card border">
            <div class="card-header text-primary h5">
              Mevcut Ürünler
            </div>
            <hr class="my-0" />
            <div class="card-body">
              <div v-if="products.length === 0" class="alert alert-info">
                Henüz ürün eklenmemiş.
              </div>
              <div v-for="product in products" :key="product.id" class="mb-4 border rounded p-3">
                <div class="row">
                  <div class="col-12 col-sm-4 mb-2">
                    <label class="form-label">Ürün Adı</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="product.name"
                      :disabled="!product.isEditing"
                    />
                  </div>
                  <div class="col-12 col-sm-3 mb-2">
                    <label class="form-label">Fiyat</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="product.price"
                      :disabled="!product.isEditing"
                    />
                  </div>
                  <div class="col-12 col-sm-1 mb-2">
                    <label class="form-label">Fiyat</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="product.price"
                      :disabled="!product.isEditing"
                    />
                  </div>
                  <div class="col-12 col-sm-4 d-flex align-items-center">
                    <div v-if="!product.isEditing">
                      <button
                        type="button"
                        @click="toggleEdit(product)"
                        class="btn btn-primary me-2"
                      >
                        <i class="bi bi-pencil me-1"></i> Düzenle
                      </button>
                    </div>
                    <div v-else>
                      <button
                        type="button"
                        @click="confirmSave(product)"
                        class="btn btn-primary me-2"
                      >
                        <i class="bi bi-save me-1"></i> Kaydet
                      </button>
                      <button
                        type="button"
                        @click="cancelEdit(product)"
                        class="btn btn-warning me-2"
                      >
                        <i class="bi bi-x-circle me-1"></i> İptal
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="confirmDelete(product)"
                      class="btn btn-danger"
                    >
                      <i class="bi bi-trash me-1"></i> Sil
                    </button>
                  </div>
                </div>

                <!-- Product Options Section (Visible only during edit mode) -->
                <div v-if="product.isEditing" class="mt-3">
                  <div
                    class="row g-2 mt-2"
                    v-for="(option, index) in product.options"
                    :key="index"
                  >
                    <div class="col-10">
                      <input
                        type="text"
                        class="form-control"
                        v-model="option.name"
                        placeholder="Seçenek Adı"
                        required
                      />
                    </div>
                    <div class="col-2 d-flex align-items-center">
                      <button
                        type="button"
                        @click="confirmRemoveOption(product, index)"
                        class="btn btn-danger btn-sm"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="addOptionToProduct(product)"
                    class="btn btn-secondary btn-sm mt-2"
                  >
                    <i class="bi bi-plus me-1"></i> Seçenek Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog as a Bootstrap Modal -->
    <div
      class="modal fade"
      tabindex="-1"
      role="dialog"
      :class="{ show: confirmDialog.show }"
      :style="{ display: confirmDialog.show ? 'block' : 'none' }"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ confirmDialog.message }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="confirmDialog.show = false"
            ></button>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="confirmDialog.show = false"
            >
              İptal
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleConfirm"
            >
              Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal backdrop -->
    <div
      class="modal-backdrop fade"
      :class="{ show: confirmDialog.show }"
      v-if="confirmDialog.show"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useFunctions } from '#imports'

const supabase = useSupabaseClient()

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

// Validation rules (for informational purposes)
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

// Confirmation dialog reactive object
const confirmDialog = reactive({
  show: false,
  message: '',
  onConfirm: null,
})

// Helper to handle confirmation
const handleConfirm = () => {
  if (confirmDialog.onConfirm) {
    confirmDialog.onConfirm()
  }
  confirmDialog.show = false
}

// Open confirmation dialog with given message and callback
const openConfirmDialog = (message, onConfirm) => {
  confirmDialog.message = message
  confirmDialog.onConfirm = onConfirm
  confirmDialog.show = true
}

// Confirm deletion of a product
const confirmDelete = (product) => {
  openConfirmDialog('Ürünü silmek istediğinize emin misiniz?', () => {
    // Call deleteProduct from your composable
    deleteProduct(product.id)
    // Optionally, refresh the product list after deletion
    fetchProducts()
  })
}

// Confirm saving changes when editing a product
const confirmSave = (product) => {
  openConfirmDialog('Değişiklikleri kaydetmek istediğinize emin misiniz?', () => {
    toggleEdit(product)
  })
}

// Confirm removal of a product option
const confirmRemoveOption = (product, index) => {
  openConfirmDialog('Ürün seçeneğini silmek istediğinize emin misiniz?', async () => {
    await removeOptionField(product, index)
  })
}

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
