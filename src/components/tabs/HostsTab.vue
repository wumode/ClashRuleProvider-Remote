<script setup lang="ts">
import {ref, computed} from 'vue'
import {itemsPerPageOptions} from "@/components/constants"
import {getBoolColor, pageTitle} from '@/components/utils'
import type {HostData} from "@/components/types"
import {defaultHost} from "@/components/constants";
import HostsTable from "@/components/tables/HostsTable.vue";
import HostDialog from "@/components/dialog/HostDialog.vue";

const props = defineProps<{
  hosts: HostData[],
  bestCloudflareIPs: string[],
  api: any
}>()

const emit = defineEmits(['refresh', 'show-snackbar', 'show-error'])

// State
const searchHosts = ref('')
const pageHosts = ref(1)
const itemsPerPageHosts = ref(10)
const hostDialog = ref(false)
const currentHost = ref<HostData>({...defaultHost})
const isAdding = ref(true)
const loading = ref(false)

// Computed
const filteredHosts = computed(() => {
  if (!searchHosts.value) return props.hosts;
  const keyword = searchHosts.value.toLowerCase();
  return props.hosts.filter(item =>
      Object.values(item).some(val =>
          String(val).toLowerCase().includes(keyword)
      )
  );
});

const paginatedHosts = computed(() => {
  const start = (pageHosts.value - 1) * itemsPerPageHosts.value
  const end = start + itemsPerPageHosts.value
  return filteredHosts.value.slice(start, end)
})

const pageCountHosts = computed(() => {
  if (itemsPerPageHosts.value === -1) {
    return 1;
  }
  return Math.ceil(props.hosts.length / itemsPerPageHosts.value);
});


// Methods
function openAddHostDialog() {
  currentHost.value = {...defaultHost};
  isAdding.value = true;
  hostDialog.value = true;
}

function editHost(domain: string) {
  const hostItem = props.hosts.find(r => r.domain === domain);
  if (hostItem) {
    currentHost.value = {...hostItem}
    isAdding.value = false;
    hostDialog.value = true;
  }
}

async function deleteHost(name: string) {
  loading.value = true;
  try {
    await props.api.delete('/plugin/ClashRuleProvider/hosts', {
      domain: name
    });
    emit('refresh');
  } catch (err: any) {
    emit('show-error', err.message || '删除 host 失败');
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="10" sm="6" class="d-flex justify-start">
          <v-text-field
              v-model="searchHosts"
              label="搜索Hosts"
              clearable
              density="compact"
              variant="solo-filled"
              hide-details
              class="search-field"
              prepend-inner-icon="mdi-magnify"
              flat
              rounded="pill"
              single-line
              :disabled="loading"
          ></v-text-field>
        </v-col>
        <v-col cols="2" sm="6" class="d-flex justify-end">
          <v-btn-group variant="outlined" rounded>
            <v-btn @click="openAddHostDialog" icon="mdi-plus" :disabled="loading"></v-btn>
          </v-btn-group>
        </v-col>
      </v-row>
    </div>
    <!-- 桌面端表格 -->
    <div class="d-none d-sm-flex clash-data-table">
      <HostsTable
        :hosts="hosts"
        :search="searchHosts"
        :page="pageHosts"
        :items-per-page="itemsPerPageHosts"
        @edit="editHost"
        @delete="deleteHost"
      />
    </div>
    <!-- 移动端卡片 -->
    <div class="d-sm-none">
      <v-row>
        <v-col
            v-for="item in paginatedHosts"
            :key="item.domain"
            cols="12"
        >
          <v-card rounded="lg" elevation="1">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <span class="font-weight-bold">{{ item.domain }}</span>
              </div>
              <v-chip :color="getBoolColor(item.using_cloudflare)" size="small" label>
                {{ item.using_cloudflare ? 'Cloudflare' : 'hosts' }}
              </v-chip>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <div class="text-body-2"><strong>IP：</strong>
                <v-chip
                    v-for="ip in (item.using_cloudflare? bestCloudflareIPs : item.value)"
                    :key="ip"
                    size="small"
                    class="ma-1"
                >
                  {{ ip }}
                </v-chip>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="d-flex justify-center">
              <v-btn icon size="small" color="primary" variant="text"
                     @click="editHost(item.domain)"
                     :disabled="loading"
              >
                <v-icon>mdi-file-edit-outline</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon size="small" color="error" variant="text"
                     @click="deleteHost(item.domain)"
                     :disabled="loading"
              >
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <div class="pa-4" style="min-height: 4rem;">
      <v-row align="center" no-gutters>
        <v-col cols="2" md="1">
        </v-col>
        <v-col cols="8" md="10" class="d-flex justify-center">
          <!-- 桌面端分页器：只在 sm 及以上显示 -->
          <v-pagination
              v-model="pageHosts"
              :length="pageCountHosts"
              total-visible="5"
              rounded="circle"
              class="d-none d-sm-flex my-0"
              :disabled="loading"
          />
          <!-- 移动端分页器：只在 sm 以下显示 -->
          <v-pagination
              v-model="pageHosts"
              :length="pageCountHosts"
              total-visible="0"
              rounded="circle"
              class="d-sm-none my-0"
              :disabled="loading"
          />

        </v-col>
        <v-col cols="2" md="1" class="d-flex justify-end">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon rounded="circle" variant="tonal" :disabled="loading">
                {{ pageTitle(itemsPerPageHosts) }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                  v-for="(item, index) in itemsPerPageOptions"
                  :key="index"
                  :value="item.value"
                  @click="itemsPerPageHosts = item.value"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </div>
    <v-divider></v-divider>
  </div>

  <HostDialog
      v-model="hostDialog"
      :initial-host="currentHost"
      :is-adding="isAdding"
      :best-cloudflare-i-ps="bestCloudflareIPs"
      :api="api"
      @refresh="emit('refresh')"
      @show-snackbar="(v) => emit('show-snackbar', v)"
      @show-error="(v) => emit('show-error', v)"
      @close="hostDialog = false"
  />
</template>

<style scoped>
</style>
