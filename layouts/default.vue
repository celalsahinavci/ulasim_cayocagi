<template>
  <div class="bg-white text-white">
    <!-- Top Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li v-for="(item, index) in filteredMenu" :key="index" class="nav-item mr-4">
              <v-btn class="nav-link" :to="item.to">{{ item.title }}</v-btn>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <div class="container-fluid mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabaseClient, useSupabaseUser } from '#imports';

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const role = ref(null);

// Kullanıcının yetkili olduğu sayfalar
const menuItems = [
  { title: 'Sipariş Oluştur', to: '/CreateOrder', roles: [1,3] },
  { title: 'Siparişlerim', to: '/Orders', roles: [1, 2] },
  { title: 'ÜRÜNLERİ DÜZENLE', to: '/ProductList', roles: [1, 2] },
  { title: 'Profil', to: '/Profile', roles: [1, 2, 3] }, 
];

// Kullanıcının rolünü al
const fetchUserRole = async () => {
  if (!user.value) return;
  const { data } = await supabase
    .from('users')
    .select('role_id')
    .eq('id', user.value.id)
    .single();
  if (data) role.value = data.role_id;
};

// Menüde sadece kullanıcının erişebileceği sayfalar görünecek
const filteredMenu = computed(() => {
  return menuItems.filter((item) => item.roles.includes(role.value));
});

onMounted(fetchUserRole);
</script>

<style scoped>
/* Optional: Additional custom styles */
.bg-dark {
  background-color: black !important;
}

.text-white {
  color: white !important;
}


</style>
