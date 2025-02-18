export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  if (!user.value) {
    return navigateTo('/403'); // Kullanıcı giriş yapmamışsa
  }

  // Kullanıcının rolünü al
  const { data, error } = await supabase
    .from('users')
    .select('role_id')
    .eq('id', user.value.id)
    .single();

  if (error || !data) {
    return navigateTo('/403');
  }

  const roleId = data.role_id;
  const roleAccess = {
    1: ['/', '/Orders', '/ProductList', '/CreateOrder', '/profil'], // Admin tüm sayfalara erişebilir
    2: ['/Orders', '/ProductList', '/profil'], // Personel belirli sayfalara erişebilir
    3: ['/CreateOrder', '/profil'], // Kullanıcı sadece belirli sayfalara erişebilir
  };

  if (!roleAccess[roleId]?.includes(to.path)) {
    return navigateTo('/403');
  }
});
