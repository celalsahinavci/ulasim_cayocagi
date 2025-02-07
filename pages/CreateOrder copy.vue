<template>
  <v-item-group multiple>
    <v-container >
      <v-row class="d-flex justify-center align-center "
      v-for="n in 3"
          :key="n"
          cols="12"
          md="3"
          >
        <v-col
          v-for="n in 3"
          :key="n"
          cols="12"
          md="2"
          style="flex-basis: 12%; max-width: 18%;"
        >
        
          <v-item v-slot="{ isSelected, toggle }">
            <v-card
              :color="isSelected ? 'success' : ''"
              class="d-flex align-center"
              height="150"
              width="150"
              dark
              @click="toggle"
            >
                <v-img
                :src="'/icon.png'"  
                height="100%"
                width="100%"
                alt="Card Image"
                
                ></v-img>
              <v-scroll-y-transition>
                <div
                  class="text-h3 flex-grow-1 text-center"
                >
                  {{ isSelected ? '' : '' }}
                </div>
              </v-scroll-y-transition>
            </v-card>
          </v-item>
        </v-col> 
      </v-row>
    </v-container>
    <v-container>
        <v-container class="fixed-container">
    <v-table density="compact" class="styled-table">
      <thead>
        <tr>
          <th class="text-left">Ürün</th>
          <th class="text-left">Fiyat</th>
          <th class="text-left">Sipariş Durumu</th>
          <th class="text-left">Tarih</th>
          <th class="text-left">Tarih</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in desserts" :key="item.name" class="hover-row">
          <td>{{ item.name }}</td>
          <td>{{ item.calories }}</td>
          <td> {{ isSelected ? 'Onaylandı' : 'Onay Bekliyor' }} </td>
          <td> 00/00/00 </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>  
    </v-container>
    <v-table density="compact" class="styled-table2">
      <thead>
        <tr>
          <th class="text-left">Ürün</th>
          <th class="text-left">Fiyat</th>
          <th class="text-left">Sipariş Durumu</th>
          <th class="text-left">Tarih</th>
          <th class="text-left">Tarih</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in desserts" :key="item.name" class="hover-row">
          <td>{{ item.name }}</td>
          <td>{{ item.calories }}</td>
          <td> {{ isSelected ? 'Onaylandı' : 'Onay Bekliyor' }} </td>
          <td> 00/00/00 </td>
        </tr>
      </tbody>
    </v-table>
  </v-item-group>

</template>

<script setup>
const desserts = [
        { name: 'Frozen Yogurt', calories: 159 },
        { name: 'Ice Cream Sandwich', calories: 237 },
        { name: 'Eclair', calories: 262 },
        { name: 'Cupcake', calories: 305 },
        { name: 'Gingerbread', calories: 356 },
      ]
</script>

<style scoped>
/* Container stilini sabitleme */
.fixed-container {
  position: fixed;
  top: 30%;
  right: 0;
  transform: translateY(-50%); /* Dikeyde tam ortalama */
  width: 600px; /* Container genişliği */
  max-width: 100%;
  z-index: 1000; /* Diğer öğelerin önünde durmasını sağlar */
}

/* Tabloyu güzelleştirmek için */
.styled-table {
  border-collapse: collapse;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.styled-table2 {
  border-collapse: collapse;
  max-width: fit-content;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.styled-table th,
.styled-table td {
  padding: 12px 16px;
  text-align: left;
}

.styled-table th {
  background-color: #1976D2; /* Başlık arka plan rengi */
  color: white; /* Başlık metin rengi */
  font-weight: bold;
}

.styled-table td {
  background-color: #f9f9f9; /* Satır arka plan rengi */
  color: #333; /* Metin rengi */
}

.styled-table tr:hover {
  background-color: #f1f1f1; /* Satır üzerine gelindiğinde renk değişikliği */
  cursor: pointer; /* İmleç değişir */
}

/* Başlıklar için stil */
.styled-table th:first-child {
  border-top-left-radius: 8px;
}

.styled-table th:last-child {
  border-top-right-radius: 8px;
}

/* Son satır için stil */
.styled-table tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.styled-table tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.styled-table2 th,
.styled-table2 td {
  padding: 12px 16px;
  text-align: left;
}

.styled-table2 th {
  background-color: #1976D2; /* Başlık arka plan rengi */
  color: white; /* Başlık metin rengi */
  font-weight: bold;
}

.styled-table2 td {
  background-color: #f9f9f9; /* Satır arka plan rengi */
  color: #333; /* Metin rengi */
}

.styled-table2 tr:hover {
  background-color: #f1f1f1; /* Satır üzerine gelindiğinde renk değişikliği */
  cursor: pointer; /* İmleç değişir */
}

/* Başlıklar için stil */
.styled-table2 th:first-child {
  border-top-left-radius: 8px;
}

.styled-table2 th:last-child {
  border-top-right-radius: 8px;
}

/* Son satır için stil */
.styled-table2 tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.styled-table2 tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}
</style>