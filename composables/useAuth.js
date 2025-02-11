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

    // Kullanıcı Kayıt ol fonksiyonu
    const useSingup = async (email, password, full_name) => {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name },
            },
            email_confirm: true,
        });

        if (error) console.error("Hata oluştu: ", error);
        else console.log("Kullanıcı kaydedildi:", data);
    }

    return { user, signIn, signOut, useSingup }
}
