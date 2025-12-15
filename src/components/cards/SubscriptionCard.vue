<script setup lang="ts">
import {
  formatBytes,
  formatTimestamp,
  getExpireColor,
  extractDomain,
  getUsedPercentageFloor,
  getUsageColor
} from '@/components/utils'
import { SubscriptionInfo } from "@/components/types";

defineProps<{
  info: SubscriptionInfo
  url: string
  refreshing: boolean
}>()

defineEmits<{
  (e: 'update-subscription', url: string): void
  (e: 'toggle-subscription', url: string, enabled: boolean): void
  (e: 'copy-to-clipboard', url: string): void
}>()
</script>
<template>
  <v-card
      variant="tonal"
      class="subscription-card mb-2 mt-2"
  >
    <div class="card-header">
      <v-card-title class="card-title">
        {{ extractDomain(url) }}
      </v-card-title>
      <v-card-actions>
        <v-btn
            class="card-refresh-button"
            @click="$emit('update-subscription', url)"
            :loading="refreshing"
        >
          <v-icon left class="mr-2">
            mdi-refresh
          </v-icon>
          刷新
        </v-btn>
      </v-card-actions>
    </div>
    <v-card-text>
      <div class="mb-2">
        <v-chip
            v-if="info.proxy_num != null"
            size="small"
            color="info"
            class="mr-2"
        >
          <v-icon class="mr-2">
            mdi-server-network
          </v-icon>
          节点：{{ info.proxy_num }}
        </v-chip>
        <v-chip
            v-if="info.last_update"
            size="small"
            color="info"
            class="mr-2"
        >
          <v-icon class="mr-2">
            mdi-clock-outline
          </v-icon>
          更新：{{ formatTimestamp(info.last_update) }}
        </v-chip>
        <v-chip
            v-if="info.expire"
            size="small"
            :color="getExpireColor(info.expire)"
        >
          <v-icon class="mr-2">
            mdi-calendar-clock
          </v-icon>
          到期：{{ formatTimestamp(info.expire) }}
        </v-chip>
      </div>
      <div class="d-flex justify-space-between mb-2">
        <span>已用流量：</span>
        <strong>{{ formatBytes(info.download + info.upload) }}</strong>
      </div>
      <div class="d-flex justify-space-between mb-2">
        <span>剩余流量：</span>
        <strong>{{ formatBytes(info.total - info.download) }}</strong>
      </div>
      <v-progress-linear
          :model-value="getUsedPercentageFloor(info)"
          :color="getUsageColor(getUsedPercentageFloor(info))"
          height="10"
          class="mb-2"
          rounded
          striped
      />
      <div class="d-flex py-2 justify-space-between text-caption text-grey">
        <span>下载：{{ formatBytes(info.download) }}</span>
        <span>上传：{{ formatBytes(info.upload) }}</span>
        <span>总量：{{ formatBytes(info.total) }}</span>
      </div>
    </v-card-text>
    <v-divider></v-divider>
    <div class="toggle-container">
      <v-tooltip location="top" text="复制链接">
        <template #activator="{ props }">
          <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              @click="$emit('copy-to-clipboard', url)"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip location="top" text="启用自动更新">
        <template v-slot:activator="{ props }">
          <v-switch
              v-model="info.enabled"
              v-bind="props"
              @change="$emit('toggle-subscription', url, info.enabled)"
          ></v-switch>
        </template>
      </v-tooltip>
    </div>
  </v-card>
</template>
<style scoped>
.subscription-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.subscription-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-refresh-button {
  text-transform: none;
  font-weight: 500;
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
