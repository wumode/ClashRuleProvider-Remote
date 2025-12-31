<script setup lang="ts">
import { SubscriptionInfo } from "@/components/types";
import SubscriptionCard from "@/components/cards/SubscriptionCard.vue";

defineProps<{
  subscriptionsInfo: Record<string, SubscriptionInfo>;
  api: any;
}>();

const emit = defineEmits<{
  (e: 'show-error', msg: string): void
  (e: 'show-snackbar', value: any): void;
  (e: 'refresh', regions: string[]): void;
  (e: 'copy-to-clipboard', text: string): void;
  (e: 'switch'): void;
}>();
</script>

<template>
  <div class="mb-2">
    <v-row v-if="Object.keys(subscriptionsInfo).length === 0" class="pa-6 justify-center">
      <v-card
          class="mx-auto text-center py-8 px-4"
          max-width="400"
          elevation="10"
          rounded="xl"
          style="background: linear-gradient(135deg, #d6c355 0%, #fda085 100%);"
      >
        <v-card-text class="d-flex flex-column align-center">
          <v-icon
              size="64"
              color="white"
              class="mb-4 bounce"
          >
            mdi-emoticon-happy-outline
          </v-icon>
          <h2 class="text-h6 font-weight-bold white--text mb-2">
            还没有订阅呢 🎉
          </h2>
          <p class="white--text mb-4">
            试试添加一个订阅吧！
          </p>
          <v-btn
              color="info"
              dark
              rounded
              elevation="6"
              @click="emit('switch')"
          >
            去配置 🚀
          </v-btn>
        </v-card-text>
      </v-card>
    </v-row>

    <v-row class="pa-4">
      <v-col cols="12" md="6" v-for="(info, url) in subscriptionsInfo" :key="url">
        <SubscriptionCard
            :info="info"
            :url="String(url)"
            :api="api"
            @refresh="(r) => emit('refresh', r)"
            @show-snackbar="(val) => emit('show-snackbar', val)"
            @show-error="(msg) => emit('show-error', msg)"
            @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}
</style>
