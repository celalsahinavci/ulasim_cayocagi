<template>
    <v-container class="fill-height d-flex justify-center align-center">
        <v-card class="pa-6" width="400">
            <v-card-title class="text-center">Giriş Yap</v-card-title>
            <v-card-text>
                <v-form ref="loginForm" @submit.prevent="handleLogin">
                    <v-text-field
                        v-model="email"
                        label="E-posta"
                        type="email"
                        variant="outlined"
                        :rules="[rules.required, rules.email]"
                    ></v-text-field>
                    
                    <v-text-field
                        v-model="password"
                        label="Şifre"
                        type="password"
                        variant="outlined"
                        :rules="[rules.required, rules.min]"
                    ></v-text-field>
                    
                    <v-checkbox v-model="rememberMe" label="Beni Hatırla"></v-checkbox>
                    
                    <!-- Display error message if authentication fails -->
                    <v-alert v-if="errorMessage" type="error" class="mb-3">
                        {{ errorMessage }}
                    </v-alert>
                    
                    <v-btn type="submit" color="primary" block :loading="loading">Giriş Yap</v-btn>
                    <v-btn variant="text" block @click="goToRegister">Kayıt Ol</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '#imports'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()
const { signIn } = useAuth()

const rules = {
    required: v => !!v || 'Bu alan zorunludur',
    email: v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin',
    min: v => (v && v.length >= 5) || 'Şifre en az 6 karakter olmalıdır'
}

const handleLogin = async () => {
    errorMessage.value = ''  // Clear any previous errors
    loading.value = true
    try {
        // Assuming signIn throws an error if authentication fails.
        await signIn(email.value, password.value)
        // Optionally redirect or perform further actions upon successful login.
    } catch (err) {
        // Set a custom error message
        errorMessage.value = "E-posta veya şifre yanlış"
        console.error("Login error:", err)
    } finally {
        loading.value = false
    }
}

const goToRegister = () => {
    router.push('/signup')
}
</script>

<style scoped>
.v-container {
    min-height: 100vh;
}
</style>
