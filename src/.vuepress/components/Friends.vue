<template>
<div class="content">
  <a class="card" v-for="item in list" :href="item.href" target="_blank">
    <img :src="item.head" :alt="item.name" />
    {{ item.name }}
  </a>
</div>
</template>

<style scoped>
.content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; 
  grid-template-rows: 1fr;
  grid-column-gap: 15px;
  grid-row-gap: 10px;
}

@media (max-width: 959px) {
  .content {
    grid-template-columns: 1fr; 
  }
}

.card {
  color: #666;
  padding: 0 20px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  height: 50px;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-style: italic;
  font-family: Damion,cursive,Helvetica Neue For Number,-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol
}

.card:hover {
  text-decoration: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.card img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 20px;
}
</style>

<script>
import { FRIENDS } from '../utils/dictionary'

export default {
  name: "Friends",
  data() {
    return {
      list: FRIENDS
    }
  }
};
</script>