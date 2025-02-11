<template>
    <v-container class="fill-height d-flex justify-center align-center">
      <v-card class="pa-5" width="400">
        <v-card-title class="text-center text-h5">Kayıt Ol</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="handleSignup">
            <!-- İsim -->
            <v-text-field 
              v-model="fullName" 
              label="Ad Soyad" 
              prepend-icon="mdi-account" 
              required 
            />
            
            <!-- E-posta -->
            <v-text-field 
              v-model="email" 
              label="E-posta" 
              type="email"
              prepend-icon="mdi-email" 
              required 
              :rules="[rules.required, rules.email]"
            />
  
            <!-- Şifre -->
            <v-text-field 
              v-model="password" 
              label="Şifre" 
              type="password" 
              prepend-icon="mdi-lock" 
              required 
              :rules="[rules.required, rules.min]"
            />
  
            <!-- Kayıt Ol Butonu -->
            <v-btn type="submit" block color="primary" :loading="loading">
              Kayıt Ol
            </v-btn>
          </v-form>
        </v-card-text>
  
        <!-- Zaten hesabın var mı? -->
        <v-card-actions class="justify-center">
          <v-btn variant="text" to="/login">Zaten bir hesabın var mı? Giriş yap</v-btn>
        </v-card-actions>
  
        <!-- Hata Mesajı -->
        <v-alert v-if="errorMessage" type="error" class="mt-3">
          {{ errorMessage }}
        </v-alert>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuth } from '@/composables/useAuth';
  import { navigateTo } from '#app';
  
  const { useSingup } = useAuth();
  const fullName = ref('');
  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMessage = ref('');

  const rules = {
    required: v => !!v || 'Bu alan zorunludur',
    email: v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin',
    min: v => (v && v.length >= 6) || 'Şifre en az 6 karakter olmalıdır'
    };
  
  const handleSignup = async () => {
    loading.value = true;
    errorMessage.value = '';
  
    try {
      await useSingup(email.value, password.value, fullName.value);
      navigateTo('/login'); // Başarılı kayıt sonrası giriş sayfasına yönlendir
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      loading.value = false;
    }
  };
</script>
  