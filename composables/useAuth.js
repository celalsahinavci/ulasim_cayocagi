import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useAuth = () => {
    const supabase = useSupabaseClient() // Doğru fonksiyon
    const user = useSupabaseUser()

    // Kullanıcı giriş fonksiyonu
    const signIn = async (email, password) => {
        console.log(email, password)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        console.log(data)
        if (error) throw error
        
        return data
    }

    // Kullanıcı çıkış fonksiyonu
    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return { user, signIn, signOut }
}
