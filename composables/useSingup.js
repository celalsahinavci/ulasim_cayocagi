export const useSingup = async () => {

    const supabase = useSupabaseClient()
    
    const { data, error } = await supabase.auth.signUp({
        email: 'kimsin@gmail.com',
        password: '123456',
        options: {
            data: { full_name: 'kimsin sen',  },
        },
        email_confirm: true,
    });

    if (error) console.error(error);
    else console.log("Kullanıcı kaydedildi:", data);
}
