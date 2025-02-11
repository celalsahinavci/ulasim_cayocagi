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

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref(null);
const loading = ref(false);
const router = useRouter();
const { signIn } = useAuth();
const errorMessage=ref();

const rules = {
    required: v => !!v || 'Bu alan zorunludur',
    email: v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin',
    min: v => (v && v.length >= 5) || 'Şifre en az 6 karakter olmalıdır'
};

const handleLogin = async () => {
    errorMessage.value = ''
    try {
        await signIn(email.value, password.value)
    } catch (error) {
        errorMessage.value = error.message
    }
}

const goToRegister = () => {
    router.push('/signup');
};
</script>

<style scoped>
.v-container {
    min-height: 100vh;
}
</style>
