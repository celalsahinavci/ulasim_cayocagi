import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useAuth = () => {
    const supabase = useSupabaseClient() // Doğru fonksiyon
    const user = useSupabaseUser()

    // Kullanıcı giriş fonksiyonu
    const signIn = async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    
      // Kullanıcının rolünü al
      const { data: userData } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', data.user.id)
        .single();
      
      if (userData) {
        const roleId = userData.role_id;
        if (roleId === 1) return navigateTo('/CreateOrder'); // Admin
        if (roleId === 2) return navigateTo('/siparis'); // Personel
        if (roleId === 3) return navigateTo('/CreateOrder'); // Kullanıcı
      }
    
      return navigateTo('/403'); // Rol bulunamazsa 403'e at
    };
    

    // Kullanıcı çıkış fonksiyonu
    const signOut = async () => {
      await supabase.auth.signOut();
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
