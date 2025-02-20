<template>
  <v-app>
    <!-- Top Navbar -->
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>
        <NuxtLink to="/">
          <img src="/icon.png" alt="Logo" class="w-11 h-10" />
        </NuxtLink>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      
      <template v-for="(item, index) in filteredMenu" :key="index">
        <v-btn text :to="item.to">{{ item.title }}</v-btn>
      </template>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <slot />
    </v-main>
  </v-app>
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
  { title: 'Siparişler', to: '/Orders', roles: [1, 2] },
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
