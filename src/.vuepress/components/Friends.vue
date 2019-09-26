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
export default {
  name: "Friends",
  data() {
    return {
      list: [
        {
          name: "Jooger",
          href: "https://jooger.me",
          head: "https://static.jooger.me/img/common/avatar.png"
        },
        {
          name: "青春博客",
          href: "http://loveteemo.com",
          head: "http://loveteemo.com/favicon.ico"
        },
        {
          name: "王小帅&江小美",
          href: "https://www.tianluogz.com",
          head: "https://www.tianluogz.com/static/index/default/images/logo.png"
        },
        {
          name: "Sanshi-Blog",
          href: "http://www.sanshi30.cn/",
          head: "http://www.sanshi30.cn/favicon.ico"
        },
        {
          name: "花花与风",
          href: "http://www.huahuayufeng.com/",
          head: "http://www.huahuayufeng.com/static/favicon.ico"
        },
        {
          name: "梦魇小栈",
          href: "https://blog.ihoey.com",
          head: "https://blog.ihoey.com/avatar.png"
        },
      ]
    };
  }
};
</script>