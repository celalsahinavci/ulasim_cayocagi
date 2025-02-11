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






  
    return { getProducts, getproductoptions }
  }
  