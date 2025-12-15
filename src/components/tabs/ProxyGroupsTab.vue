<script setup lang="ts">
import {computed, ref} from 'vue';
import ProxyGroupsTable from '@/components/tables/ProxyGroupsTable.vue';
import ProxyGroupCard from '@/components/cards/ProxyGroupCard.vue';
import ProxyGroupsDialog from '@/components/dialog/ProxyGroupsDialog.vue';
import {itemsPerPageOptions} from '@/components/constants';
import {pageTitle} from '@/components/utils';
import {ProxyGroupData, ProxyProviderData} from '@/components/types';

const props = defineProps<{
  proxyGroups: ProxyGroupData[];
  proxyProviders: ProxyProviderData[];
  customOutbounds: string[];
  api: any;
}>();

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void;
  (e: 'show-snackbar', value: any): void;
  (e: 'show-error', msg: string): void;
  (e: 'show-yaml', obj: any): void;
  (e: 'copy-to-clipboard', text: string): void;
}>();

const searchProxyGroups = ref('');
const pageProxyGroup = ref(1);
const itemsPerPageProxyGroup = ref(10);

// Dialog State
const proxyGroupDialogVisible = ref(false)
const editingProxyGroupName = ref<string | null>(null)
const currentProxyGroup = ref<ProxyGroupData | null>(null)


const filteredProxyGroups = computed(() => {
  if (!searchProxyGroups.value) return props.proxyGroups;
  const keyword = searchProxyGroups.value.toLowerCase();
  return props.proxyGroups.filter(item =>
      Object.values(item).some(val =>
          String(val).toLowerCase().includes(keyword)
      )
  );
});

const paginatedProxyGroups = computed(() => {
  const start = (pageProxyGroup.value - 1) * itemsPerPageProxyGroup.value;
  const end = start + itemsPerPageProxyGroup.value;
  return filteredProxyGroups.value.slice(start, end);
});

const pageCountProxyGroups = computed(() => {
  if (itemsPerPageProxyGroup.value === -1) {
    return 1;
  }
  return Math.ceil(filteredProxyGroups.value.length / itemsPerPageProxyGroup.value);
});


// Actions
function openAddProxyGroupDialog() {
  editingProxyGroupName.value = null;
  currentProxyGroup.value = null;
  proxyGroupDialogVisible.value = true;
}

function editProxyGroup(name: string) {
  const proxyGroupData = props.proxyGroups.find(p => p.proxy_group.name === name);
  if (proxyGroupData) {
    editingProxyGroupName.value = name;
    currentProxyGroup.value = {...proxyGroupData}
    proxyGroupDialogVisible.value = true;
  }
}

async function deleteProxyGroup(name: string) {
  try {
    const n = encodeURIComponent(name)
    await props.api.delete(`/plugin/ClashRuleProvider/proxy-groups/${n}`);
    emit('refresh', ["proxy-groups", "clash-outbounds"]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除规则失败');
    }
  }
}

function closeProxyGroupsDialog() {
  currentProxyGroup.value = null;
  proxyGroupDialogVisible.value = false;
}
</script>

<template>
  <div class="mb-2">
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="10" sm="6" class="d-flex justify-start">
          <v-text-field
              v-model="searchProxyGroups"
              label="搜索代理组"
              clearable
              density="compact"
              variant="solo-filled"
              hide-details
              class="search-field"
              prepend-inner-icon="mdi-magnify"
              flat
              rounded="pill"
              single-line
          ></v-text-field>
        </v-col>
        <v-col cols="2" sm="6" class="d-flex justify-end">
          <v-btn-group variant="outlined" rounded>
            <v-btn
                @click="openAddProxyGroupDialog"
                icon="mdi-plus"
            >
            </v-btn>
          </v-btn-group>
        </v-col>
      </v-row>
    </div>
    <!-- 桌面端表格 -->
    <div class="d-none d-sm-flex clash-data-table">
      <ProxyGroupsTable
          :items-per-page="itemsPerPageProxyGroup"
          :page="pageProxyGroup"
          :proxy-groups="proxyGroups"
          :search="searchProxyGroups"
          @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
          @show-yaml="(o) => emit('show-yaml', o)"
          @edit-proxy-group="editProxyGroup"
          @delete-proxy-group="deleteProxyGroup"
      ></ProxyGroupsTable>
    </div>
    <!-- 移动端卡片 -->
    <div class="d-sm-none">
      <v-row>
        <v-col
            v-for="item in paginatedProxyGroups"
            :key="item.proxy_group.name"
            cols="12"
        >
          <ProxyGroupCard
              :proxy-group-data="item"
              @edit-proxy-group="editProxyGroup"
              @delete-proxy-group="deleteProxyGroup"
          ></ProxyGroupCard>
        </v-col>
      </v-row>
    </div>
    <div class="pa-4" style="min-height: 4rem;">
      <v-row align="center" no-gutters>
        <v-col cols="2" md="1">
        </v-col>
        <v-col cols="8" md="10" class="d-flex justify-center">
          <v-pagination
              v-model="pageProxyGroup"
              :length="pageCountProxyGroups"
              total-visible="5"
              class="d-none d-sm-flex my-0"
              rounded="circle"
          />
          <v-pagination
              v-model="pageProxyGroup"
              :length="pageCountProxyGroups"
              total-visible="0"
              class="d-sm-none my-0"
              rounded="circle"
          />
        </v-col>
        <v-col cols="2" md="1" class="d-flex justify-end">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon rounded="circle" variant="tonal">
                {{ pageTitle(itemsPerPageProxyGroup) }}
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                  v-for="(item, index) in itemsPerPageOptions"
                  :key="index"
                  :value="item.value"
                  @click="itemsPerPageProxyGroup = item.value"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </div>
    <v-divider></v-divider>

    <!-- Add ProxyGroup Dialog -->
    <ProxyGroupsDialog
        v-model="proxyGroupDialogVisible"
        v-if="proxyGroupDialogVisible"
        :initial-value="currentProxyGroup"
        :is-adding="editingProxyGroupName === null"
        :proxy-providers="proxyProviders"
        :custom-outbounds="customOutbounds"
        :api="api"
        @close="closeProxyGroupsDialog"
        @refresh="emit('refresh', ['clash-outbounds', 'proxy-groups'])"
        @show-snackbar="(val) => emit('show-snackbar', val)"
        @show-error="(msg) => emit('show-error', msg)"
    ></ProxyGroupsDialog>
  </div>
</template>

<style scoped>
</style>