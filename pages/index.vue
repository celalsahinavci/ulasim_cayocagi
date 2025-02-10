<template>
  <div>
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


</script>

<style>

</style>