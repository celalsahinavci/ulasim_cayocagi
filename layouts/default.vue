<template>
    <div class="container">
      <!-- Sol üst köşeye simge -->
      <div class="fixed top-4 left-4">
        <NuxtLink to="/">
          <img src="/icon.png" alt="Logo" class="w-11 h-10" style="width: 100px; height: 100px;" />
        </NuxtLink>
      </div>
  
      <!-- Sayfanın içeriği buraya gelecek -->
      <slot />
      <div>
    <v-container class="d-flex align-center" style="height: 100vh;">
      <!-- Butonlar sol orta hizalı -->
      <div class="position-absolute" style="left: 15px; transform: translateY(-50%); top: 40%; max-width: fit-content; ">
        <v-btn block color="primary" class="mb-6" @click="toCreateOrder()">Sipariş Oluştur</v-btn>
        <v-btn block color="secondary" class="mb-6" @click="toOrders()">Siparişlerim</v-btn>
        <v-btn block color="success">İstek ve Şikayet</v-btn>
      </div>
      <div class="position-absolute" style="right:5px; transform: translateY(-50%); top: 40%; max-width: fit-content; ">
        <v-btn block color="primary" class="mb-6" @click="toProductList()">ÜRÜNLERİ DÜZENLE</v-btn>
      </div>
    </v-container>
  </div>
    </div>
  </template>

<script setup>
import {useRouter} from 'vue-router'
const router = useRouter();
const toOrders = () => {
    router.push('/Orders')
};
const toCreateOrder = () => {
    router.push('/CreateOrder')
};

const toProductList = () => {
    router.push('/ProductList')
};

 </script>
  