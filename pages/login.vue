<!-- 
<template>
    <div>
    <v-container>
        <v-card class="pa-6" elevation="2">
            <v-card-title>Giriş Yap</v-card-title>
            <v-card-text>
                <v-text-field v-model="email" label="E-posta" type="email"></v-text-field>
                <v-text-field v-model="password" label="Şifre" type="password"></v-text-field>
                <v-alert v-if="errorMessage" type="error" dense>{{ errorMessage }}</v-alert>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="handleLogin">Giriş Yap</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
    
    <v-btn @click="kaydet()">Yeni kullanıcı kayddet</v-btn>
    </div>
</template>
    
<script setup>
import { useRouter } from 'vue-router'
const email = ref('mahmut@gmail.com')
const password = ref('12345')
const errorMessage = ref('')
const { signIn } = useAuth()
const router = useRouter()

const handleLogin = async () => {
    errorMessage.value = ''
    try {
        await signIn(email.value, password.value)
        router.push('/CreateOrder') // Başarılı girişte yönlendirme
    } catch (error) {
        errorMessage.value = error.message
    }
}

const kaydet = async () => {
    try {
        await useSingup()
    } catch (error) {
        console.log("Sorun Ne: "+error)
    }
}
</script> 
-->



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
                
                <v-alert v-if="error" type="error" class="mb-3">
                    {{ error }}
                </v-alert>
                
                <v-btn type="submit" color="primary" block :loading="loading">Giriş Yap</v-btn>
                <v-btn variant="text" block @click="goToRegister">Kayıt Ol</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref(null);
const loading = ref(false);
const router = useRouter();
const { login } = useAuth();

const rules = {
    required: v => !!v || 'Bu alan zorunludur',
    email: v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin',
    min: v => (v && v.length >= 6) || 'Şifre en az 6 karakter olmalıdır'
};

const handleLogin = async () => {
    error.value = null;
    loading.value = true;
    try {
        await login(email.value, password.value, rememberMe.value);
        router.push('/');
    } catch (err) {
        error.value = 'Giriş başarısız. Bilgilerinizi kontrol edin.';
    }
    loading.value = false;
};

const goToRegister = () => {
    router.push('/signup');
};
</script>

<style scoped>
.v-container {
    min-height: 100vh;
}
</style>
