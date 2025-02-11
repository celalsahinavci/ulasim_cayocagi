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

      <!-- Navbar buttons -->
      <v-btn text @click="toCreateOrder">Sipariş Oluştur</v-btn>
      <v-btn text @click="toOrders">Siparişlerim</v-btn>
      <v-btn text @click="toProductList">ÜRÜNLERİ DÜZENLE</v-btn>
      <v-btn text>İstek ve Şikayet</v-btn>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const toOrders = () => {
  router.push('/Orders')
}

const toCreateOrder = () => {
  router.push('/CreateOrder')
}

const toProductList = () => {
  router.push('/ProductList')
}
</script>
