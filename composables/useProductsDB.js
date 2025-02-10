export const useProductsDB = () => {
    const supabase = useSupabaseClient()
  

            /* Veri Alma İşlemleri */

    const getProducts = async () => {
        const { data, error } = await supabase.from('products').select('*')
        if (error) {
            console.error('DB Hatası:', error.message)
            return []
        }
        return data
    }

    const getproductoptions = async ( product_id ) => {
        const { data, error } = await supabase.from('product_options').select('*').eq('product_id', product_id)
        if (error) {
            console.error('DB Hatası:', error.message)
            return []
        }
        return data
    }




            /* Veri Güncelleme İşlemleri */

    const updateMarkerKonum = async (id, position1, position2) => {
      const degtarih = new Date().toISOString()
  
      const { error } = await supabase
        .from('MarkerKonum')
        .update({ position1, position2, degtarih })
        .eq('id', id)
  
      if (error) {
        console.error('Güncelleme Hatası:', error.message)
      }
    }
  






    // **🆕 Yeni Marker Ekleme Fonksiyonu**
    const insertMarkerKonum = async (name, mapCenter) => {
      const oltarih = new Date().toISOString()
      const degtarih = oltarih // İlk ekleme olduğu için degtarih de aynı olacak
  
      const { error } = await supabase
        .from('MarkerKonum')
        .insert([
          {
            isim: name,
            position1: mapCenter.lat,
            position2: mapCenter.lng,
            oltarih,
            degtarih
          }
        ])
  
      if (error) {
        console.error('Marker Ekleme Hatası:', error.message)
      }
    }
  
    return { getProducts, getproductoptions }
  }
  