// composables/useFunctions.js
import { ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'

export const useFunctions = () => {
  const supabase = useSupabaseClient()

  const products = ref([]) // Ürünler
  const productOptions = ref([]) // Tüm ürün seçenekleri (priorities)
  const currentOrder = ref([]) // Sipariş edilen ürünler
  const orders = ref([]) // Onaylanan siparişler

  const optionsCache = new Map()

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

  return {
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
  }
}
