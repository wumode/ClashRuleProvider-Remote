<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/theme-monokai'
import ProxiesDesktop from './proxies/ProxiesDesktop.vue'
import ProxiesMobile from './proxies/ProxiesMobile.vue'
import ProxiesDialog from '@/components/dialog/ProxiesDialog.vue'
import { defaultMetadata, defaultProxy } from '@/components/constants'
import { useToast } from '@/components/utils'
import { Metadata, ProxyData } from '@/components/types'

const props = defineProps<{
  proxies: ProxyData[]
  api: any
}>()

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void
  (e: 'show-error', msg: string): void
  (e: 'show-yaml', obj: any): void
  (e: 'copy-to-clipboard', text: string): void
  (e: 'edit-visibility', meta: Metadata, endpoint: string, region: string): void
}>()

const { smAndDown } = useDisplay()
const toast = useToast()

const editorOptions = {
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  showLineNumbers: true,
  tabSize: 2
}

const proxiesPlaceholder = ref(
  `proxies:
  - name: "ss node"
    type: "ss"`
)
const importProxiesTypes = ['YAML', 'LINK']

// Search & Pagination
const searchProxies = ref('')
const pageProxies = ref(1)
const itemsPerPageProxies = ref(10)
const loading = ref(false)

const filteredExtraProxies = computed(() => {
  if (!searchProxies.value) return props.proxies
  const keyword = searchProxies.value.toLowerCase()
  return props.proxies.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(keyword))
  )
})

const paginatedExtraProxies = computed(() => {
  const start = (pageProxies.value - 1) * itemsPerPageProxies.value
  const end = start + itemsPerPageProxies.value
  return filteredExtraProxies.value.slice(start, end)
})

const pageCountProxies = computed(() => {
  if (itemsPerPageProxies.value === -1) {
    return 1
  }
  return Math.ceil(props.proxies.length / itemsPerPageProxies.value)
})

const importExtraProxiesPlaceholderText = computed(() => {
  return importProxies.value.type === 'YAML' ? 'proxies: []' : 'vless://xxxx'
})

// Import Dialog State
const importExtraProxiesDialog = ref(false)
const importProxiesLoading = ref(false)
const importProxies = ref({
  type: 'YAML',
  payload: ''
})

function openImportProxiesDialog() {
  importProxies.value = {
    type: 'YAML',
    payload: ''
  }
  importExtraProxiesDialog.value = true
}

async function importExtraProxies() {
  try {
    importProxiesLoading.value = true
    const requestData = {
      vehicle: importProxies.value.type,
      payload: importProxies.value.payload
    }
    const result = await props.api.put('/plugin/ClashRuleProvider/proxies', requestData)
    if (!result.success) {
      emit('show-error', '节点导入失败: ' + (result.message || '未知错误'))
      toast.error('节点导入失败')
      return
    }
    importExtraProxiesDialog.value = false
    emit('refresh', ['proxies', 'clash-outbounds'])
    toast.success('节点导入成功')
  } catch (err: unknown) {
    if (err instanceof Error) emit('show-error', '节点导入失败: ' + (err.message || '未知错误'))
    toast.error('节点导入失败')
  } finally {
    importProxiesLoading.value = false
  }
}

// Edit Dialog State
const proxiesDialogVisible = ref(false)
const editingProxy = ref<ProxyData>({
  meta: { ...defaultMetadata },
  data: { ...defaultProxy },
  name: defaultProxy.name
})

function openProxiesDialog(proxyData: ProxyData) {
  editingProxy.value = proxyData
  proxiesDialogVisible.value = true
}

function closeProxyDialog() {
  proxiesDialogVisible.value = false
}

async function deleteProxy(name: string) {
  loading.value = true
  try {
    await props.api.delete(`/plugin/ClashRuleProvider/proxies/${encodeURIComponent(name)}`)
    emit('refresh', ['proxies', 'clash-outbounds'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除规则失败')
    }
  } finally {
    loading.value = false
  }
}

async function deletePatch(name: string) {
  loading.value = true
  try {
    const n = encodeURIComponent(name)
    await props.api.delete(`/plugin/ClashRuleProvider/proxies/${n}/patch`)
    emit('refresh', ['proxies', 'clash-outbounds'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除补丁失败')
    }
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(name: string, disabled: boolean) {
  loading.value = true
  try {
    const proxy = props.proxies.find((p) => p.data.name === name)
    if (!proxy) {
      emit('show-error', 'Proxy not found')
      return
    }
    const n = encodeURIComponent(name)
    // Send full metadata with updated disabled status
    const newMeta = { ...proxy.meta, disabled: disabled }
    await props.api.patch(`/plugin/ClashRuleProvider/proxies/${n}/meta`, newMeta)
    emit('refresh', ['proxies', 'clash-outbounds'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '更新代理状态失败')
    }
  } finally {
    loading.value = false
  }
}

function editVisibility(name: string) {
  const proxy = props.proxies.find((p) => p.data.name === name)
  if (!proxy) {
    emit('show-error', 'Proxy not found')
    return
  }
  const n = encodeURIComponent(name)
  emit('edit-visibility', proxy.meta, `/plugin/ClashRuleProvider/proxies/${n}/meta`, 'proxies')
}
</script>

<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <!-- 移动端视图 -->
    <ProxiesMobile
      v-if="smAndDown"
      :paginated-proxies="paginatedExtraProxies"
      :search="searchProxies"
      :page="pageProxies"
      :page-count="pageCountProxies"
      :loading="loading"
      @update:search="(v) => (searchProxies = v)"
      @update:page="(v) => (pageProxies = v)"
      @open-import-dialog="openImportProxiesDialog"
      @edit-proxy="openProxiesDialog"
      @delete-proxy="deleteProxy"
      @delete-patch="deletePatch"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
      @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
      @show-yaml="(o) => emit('show-yaml', o)"
    />

    <!-- 桌面端视图 -->
    <ProxiesDesktop
      v-else
      :proxies="proxies"
      :search="searchProxies"
      :page="pageProxies"
      :items-per-page="itemsPerPageProxies"
      :page-count="pageCountProxies"
      :loading="loading"
      @update:search="(v) => (searchProxies = v)"
      @update:page="(v) => (pageProxies = v)"
      @update:items-per-page="(v) => (itemsPerPageProxies = v)"
      @open-import-dialog="openImportProxiesDialog"
      @edit-proxy="openProxiesDialog"
      @delete-proxy="deleteProxy"
      @delete-patch="deletePatch"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
      @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
      @show-yaml="(o) => emit('show-yaml', o)"
    />

    <v-divider></v-divider>

    <!-- Import Proxies Dialog -->
    <v-dialog v-model="importExtraProxiesDialog" max-width="40rem">
      <v-card>
        <v-card-title>导入节点</v-card-title>
        <v-card-text style="max-height: 900px; overflow-y: auto">
          <v-select
            v-model="importProxies.type"
            :items="importProxiesTypes"
            label="内容格式"
            required
            class="mb-4"
          ></v-select>
          <VAceEditor
            v-if="importProxies.type === 'YAML'"
            v-model:value="importProxies.payload"
            lang="yaml"
            theme="monokai"
            :options="editorOptions"
            :placeholder="proxiesPlaceholder"
            style="height: 30rem; width: 100%; margin-bottom: 16px"
          />
          <v-textarea
            v-else
            v-model="importProxies.payload"
            label="内容"
            required
            :placeholder="importExtraProxiesPlaceholderText"
            class="mb-4"
            rows="4"
            auto-grow
          ></v-textarea>
          <v-alert v-if="importProxies.type === 'YAML'" type="info" dense variant="tonal">
            请输入 Clash 规则中的 <strong>proxies</strong> 字段，例如：<br />
            <pre style="white-space: pre-wrap; font-family: monospace; margin: 0">
<code>proxies:
  - name: "ss node"
    type: "ss"</code></pre>
          </v-alert>
          <v-alert v-if="importProxies.type === 'LINK'" type="info" dense variant="tonal">
            请输入 V2RayN 格式的分享链接，例如：<br />
            <code>vmess://xxxx</code><br />
            <code>ss://xxxx</code>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="importExtraProxiesDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="importProxiesLoading" @click="importExtraProxies">
            导入
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ProxiesDialog
      v-if="proxiesDialogVisible"
      v-model="proxiesDialogVisible"
      :proxy-data="editingProxy"
      :api="api"
      @refresh="emit('refresh', ['proxies'])"
      @close="closeProxyDialog"
      @show-error="(msg) => emit('show-error', msg)"
    ></ProxiesDialog>
  </div>
</template>

<style scoped></style>
