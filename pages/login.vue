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
