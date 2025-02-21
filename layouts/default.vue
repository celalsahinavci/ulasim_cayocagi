<template>
  <div class="bg-light text-dark min-vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="/"> MyApp</a>

        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <td class="navbar-nav ms-auto">
            <th v-for="(item, index) in filteredMenu" :key="index" class="nav-item">
              <v-btn class="nav-link px-3 ml-4" variant="flat" color="green" :to="item.to">
                {{ item.title }}
              </v-btn>
            </th>
          </td>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
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

const menuItems = [
  { title: 'Sipariş Oluştur', to: '/CreateOrder', roles: [1, 3] },
  { title: 'Siparişler', to: '/Orders', roles: [1, 2] },
  { title: 'ÜRÜNLERİ DÜZENLE', to: '/ProductList', roles: [1, 2] },
  { title: 'Profil', to: '/Profile', roles: [1, 2, 3] }, 
];

// Fetch user role
const fetchUserRole = async () => {
  if (!user.value) return;
  const { data } = await supabase
    .from('users')
    .select('role_id')
    .eq('id', user.value.id)
    .single();
  if (data) role.value = data.role_id;
};

// Filter menu based on role
const filteredMenu = computed(() => {
  return menuItems.filter((item) => item.roles.includes(role.value));
});

onMounted(fetchUserRole);
</script>

<style scoped>
/* Navbar improvements */
.navbar {
  
  padding: 0.8rem 1rem;
}

.navbar-brand {
  font-size: 1.4rem;
  font-weight: bold;
}

.navbar-nav .nav-link {
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.navbar-nav .nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Main container */
.container {
  padding-top: 1rem;
}
</style>
