
// 403.vue Sayfası
<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-6 text-center" width="400">
      <v-card-title>Erişim Engellendi</v-card-title>
      <v-card-text>Bu sayfaya erişim yetkiniz bulunmamaktadır.</v-card-text>
      <v-btn color="primary" @click="$router.push('/login')">Giriş Sayfasına Dön</v-btn>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-container {
  min-height: 100vh;
}
</style>
