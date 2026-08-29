<script setup lang="ts">
import { ref, reactive, onMounted, computed, PropType } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/theme-monokai'
import { validateIPs, isValidUrl, useToast } from '@/components/utils'
import { PluginConfig } from '@/components/types'

// Props
const props = defineProps({
  initialConfig: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  },
  api: {
    type: Object,
    default: () => {}
  }
})

// 自定义事件
const emit = defineEmits(['save', 'close', 'switch'])

const toast = useToast()
const activeTab = ref('subscription')
const editorOptions = {
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  showLineNumbers: true,
  tabSize: 2
}
const configPlaceholder = ref(
  `profile:
  store-selected: true
mode: rule
log-level: silent`
)

// 状态变量
const clashTemplateDialog = ref(false)
const clashTemplateType = ref('YAML')
const clashTemplateContent = ref('')
const form = ref<any>(null)
const isFormValid = ref(true)
const error = ref<string>('')
const saving = ref(false)
const testing = ref(false)
const dashboardComponents = ['Clash Info', 'Traffic Stats']
const showSecrets = ref<Record<number, boolean>>({ 0: false })

// Cron Presets
const cronPresets = [
  { label: '每 6 小时', value: '0 */6 * * *' },
  { label: '每 12 小时', value: '0 */12 * * *' },
  { label: '每日 04:00', value: '0 4 * * *' },
  { label: '每日零点', value: '0 0 * * *' }
]

// 默认配置
const defaultConfig: PluginConfig = {
  enabled: false,
  subscriptions_config: [],
  filter_keywords: ['公益性', '高延迟', '域名', '官网', '重启', '过期时间', '系统代理'],
  clash_dashboards: [{ url: '', secret: '' }],
  movie_pilot_url: '',
  cron_string: '0 */6 * * *',
  timeout: 10,
  retry_times: 3,
  proxy: false,
  notify: false,
  auto_update_subscriptions: true,
  ruleset_prefix: '📂<=',
  acl4ssr_prefix: '🗂️=>',
  group_by_region: false,
  group_by_country: false,
  refresh_delay: 5,
  enable_acl4ssr: false,
  dashboard_components: [],
  clash_template: '',
  hint_geo_dat: false,
  best_cf_ip: [],
  active_dashboard: 0,
  apikey: null,
  identifiers: [],
  cache_ttl: 3600
}

// 响应式配置对象
const config = reactive({ ...defaultConfig })

// 初始化
onMounted(() => {
  if (props.initialConfig) {
    Object.keys(props.initialConfig).forEach((key) => {
      if (key in config) {
        ;(config as any)[key] = props.initialConfig[key]
      }
    })
  }
})

const sub_links = computed(() => {
  if (!config.subscriptions_config) {
    return []
  }
  return config.subscriptions_config.map((item) => item.url)
})

const activeOptionsCount = (item: any) => {
  let count = 0
  if (item.rules) count++
  if (item['rule-providers']) count++
  if (item['proxy-groups']) count++
  if (item['proxy-providers']) count++
  return count
}

const getUrlHostname = (urlStr: string) => {
  if (!urlStr) return '未配置订阅 URL'
  try {
    const parsed = new URL(urlStr)
    return parsed.hostname
  } catch {
    return urlStr.length > 30 ? urlStr.substring(0, 30) + '...' : urlStr
  }
}

const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  config.apikey = key
}

// 测试连接
async function testConnection() {
  testing.value = true
  error.value = ''

  try {
    if (sub_links.value.length === 0) {
      toast.error('请先配置至少一个订阅链接')
      return
    }

    const testParams = {
      clash_apis: config.clash_dashboards,
      sub_links: sub_links.value
    }

    const result = await props.api.post('/plugin/ClashRuleProvider/connectivity', testParams)

    if (result.success) {
      toast.success('连接测试成功！Clash 面板和订阅链接连接正常，配置验证通过')
    } else {
      toast.error(result.message || '连接测试失败，请检查配置')
    }
  } catch (err: unknown) {
    if (err instanceof Error) toast.error(err.message || '连接测试失败')
  } finally {
    testing.value = false
  }
}

// 保存配置
async function saveConfig() {
  for (let i = 0; i < config.subscriptions_config.length; i++) {
    const sub = config.subscriptions_config[i]
    if (!sub.url || !isValidUrl(sub.url)) {
      error.value = `订阅配置 ${i + 1} 中的 URL 无效或为空`
      toast.error(error.value)
      return
    }
  }

  if (!isFormValid.value) {
    error.value = '请修正表单中的错误'
    toast.error(error.value)
    return
  }

  saving.value = true
  error.value = ''

  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    emit('save', { ...config })
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message || '保存配置失败'
      toast.error(error.value)
    }
  } finally {
    saving.value = false
  }
}

const toggleSecret = (index: number) => {
  showSecrets.value[index] = !showSecrets.value[index]
}

const addClashConfig = () => {
  const newIndex = config.clash_dashboards.length
  config.clash_dashboards.push({ url: '', secret: '' })
  showSecrets.value[newIndex] = false
}

const removeClashConfig = (index: number) => {
  config.clash_dashboards.splice(index, 1)
  delete showSecrets.value[index]

  if (config.active_dashboard === index) {
    config.active_dashboard = config.clash_dashboards.length > 0 ? 0 : null
  }
}

const addSubscriptionConfig = () => {
  config.subscriptions_config.push({
    url: '',
    rules: false,
    proxies: true,
    'proxy-groups': false,
    'rule-providers': false,
    'proxy-providers': false,
    user_agent: null
  })
}

const removeSubscriptionConfig = (index: number) => {
  config.subscriptions_config.splice(index, 1)
}

function openClashTemplateDialog() {
  clashTemplateContent.value = config.clash_template
  clashTemplateDialog.value = true
}

function saveClashTemplate() {
  config.clash_template = clashTemplateContent.value
  clashTemplateDialog.value = false
}

function resetForm() {
  Object.assign(config, JSON.parse(JSON.stringify(defaultConfig)))

  if (form.value) {
    form.value.resetValidation()
  }
}
</script>

<template>
  <div class="plugin-config-wrapper">
    <v-card class="modern-config-card border rounded-lg overflow-hidden" elevation="0">
      <!-- 现代化 Header Section (扁平无光效) -->
      <div
        class="config-hero-header pa-4 pa-md-5 d-flex flex-wrap align-center justify-space-between gap-4"
      >
        <div class="d-flex align-center gap-3">
          <div class="hero-icon-avatar rounded-lg d-flex align-center justify-center">
            <v-icon size="24" color="primary">mdi-tune-variant</v-icon>
          </div>
          <div>
            <div class="d-flex align-center gap-2">
              <h2 class="text-h6 font-weight-bold text-high-emphasis">Clash Rule Provider</h2>
              <v-chip
                :color="config.enabled ? 'success' : 'grey'"
                size="small"
                variant="tonal"
                class="font-weight-medium ml-2"
              >
                <v-icon start size="14">
                  {{ config.enabled ? 'mdi-check-circle' : 'mdi-pause-circle' }}
                </v-icon>
                {{ config.enabled ? '已启用' : '未启用' }}
              </v-chip>
            </div>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
              随时为 Clash 添加一些额外的规则
            </p>
          </div>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            class="rounded-lg text-none"
            @click="emit('switch')"
          >
            <v-icon start>mdi-view-dashboard-edit</v-icon>
            切换至规则
          </v-btn>
          <v-btn
            icon
            variant="text"
            color="grey-darken-1"
            density="comfortable"
            @click="emit('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider />

      <!-- 主界面区域 -->
      <v-card-text class="pa-4 pa-md-6">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-6 rounded-lg border-error"
          @click:close="error = ''"
        >
          <template #prepend>
            <v-icon color="error">mdi-alert-circle</v-icon>
          </template>
          <span class="font-weight-medium">{{ error }}</span>
        </v-alert>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveConfig">
          <!-- 1. 核心总开关微卡片 Grid (4 Master Switches Cards) -->
          <div class="mb-6">
            <div
              class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-3 d-flex align-center"
            >
              <v-icon size="16" class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
              核心功能开关
            </div>
            <v-row dense>
              <!-- 开关 1: 启用插件 -->
              <v-col cols="12" sm="6" md="3">
                <div
                  class="switch-card switch-card--primary rounded-lg pa-3 pa-md-4 d-flex align-center justify-space-between transition-all cursor-pointer select-none"
                  :class="{ 'switch-card--active': config.enabled }"
                  @click="config.enabled = !config.enabled"
                >
                  <div class="d-flex align-center gap-3">
                    <div class="card-icon-avatar rounded-circle d-flex align-center justify-center">
                      <v-icon :color="config.enabled ? 'primary' : 'grey-darken-1'"
                        >mdi-power</v-icon
                      >
                    </div>
                    <div>
                      <div class="font-weight-bold text-body-2">启用插件</div>
                      <div class="text-caption text-medium-emphasis">运行插件服务</div>
                    </div>
                  </div>
                  <v-switch
                    v-model="config.enabled"
                    color="primary"
                    hide-details
                    inset
                    density="compact"
                    @click.stop
                  />
                </div>
              </v-col>

              <!-- 开关 2: 系统代理 -->
              <v-col cols="12" sm="6" md="3">
                <div
                  class="switch-card switch-card--info rounded-lg pa-3 pa-md-4 d-flex align-center justify-space-between transition-all cursor-pointer select-none"
                  :class="{ 'switch-card--active': config.proxy }"
                  @click="config.proxy = !config.proxy"
                >
                  <div class="d-flex align-center gap-3">
                    <div class="card-icon-avatar rounded-circle d-flex align-center justify-center">
                      <v-icon :color="config.proxy ? 'info' : 'grey-darken-1'"
                        >mdi-lan-connect</v-icon
                      >
                    </div>
                    <div>
                      <div class="font-weight-bold text-body-2">启用代理</div>
                      <div class="text-caption text-medium-emphasis">网络请求代理</div>
                    </div>
                  </div>
                  <v-switch
                    v-model="config.proxy"
                    color="info"
                    hide-details
                    inset
                    density="compact"
                    @click.stop
                  />
                </div>
              </v-col>

              <!-- 开关 3: 运行通知 -->
              <v-col cols="12" sm="6" md="3">
                <div
                  class="switch-card switch-card--warning rounded-lg pa-3 pa-md-4 d-flex align-center justify-space-between transition-all cursor-pointer select-none"
                  :class="{ 'switch-card--active': config.notify }"
                  @click="config.notify = !config.notify"
                >
                  <div class="d-flex align-center gap-3">
                    <div class="card-icon-avatar rounded-circle d-flex align-center justify-center">
                      <v-icon :color="config.notify ? 'warning' : 'grey-darken-1'"
                        >mdi-bell-outline</v-icon
                      >
                    </div>
                    <div>
                      <div class="font-weight-bold text-body-2">运行通知</div>
                      <div class="text-caption text-medium-emphasis">发送消息推送</div>
                    </div>
                  </div>
                  <v-switch
                    v-model="config.notify"
                    color="warning"
                    hide-details
                    inset
                    density="compact"
                    @click.stop
                  />
                </div>
              </v-col>

              <!-- 开关 4: 自动更新订阅 -->
              <v-col cols="12" sm="6" md="3">
                <div
                  class="switch-card switch-card--success rounded-lg pa-3 pa-md-4 d-flex align-center justify-space-between transition-all cursor-pointer select-none"
                  :class="{ 'switch-card--active': config.auto_update_subscriptions }"
                  @click="config.auto_update_subscriptions = !config.auto_update_subscriptions"
                >
                  <div class="d-flex align-center gap-3">
                    <div class="card-icon-avatar rounded-circle d-flex align-center justify-center">
                      <v-icon
                        :color="config.auto_update_subscriptions ? 'success' : 'grey-darken-1'"
                      >
                        mdi-sync
                      </v-icon>
                    </div>
                    <div>
                      <div class="font-weight-bold text-body-2">自动更新</div>
                      <div class="text-caption text-medium-emphasis">定时同步订阅</div>
                    </div>
                  </div>
                  <v-switch
                    v-model="config.auto_update_subscriptions"
                    color="success"
                    hide-details
                    inset
                    density="compact"
                    @click.stop
                  />
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- 2. 基础服务对接 (MoviePilot & API Service) -->
          <v-card variant="flat" class="section-card border rounded-lg pa-4 mb-6 bg-surface">
            <div
              class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-3 d-flex align-center"
            >
              <v-icon size="16" class="mr-2" color="primary">mdi-server-network</v-icon>
              基础配置
            </div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="config.movie_pilot_url"
                  label="MoviePilot URL"
                  variant="outlined"
                  density="comfortable"
                  placeholder="http://localhost:3001"
                  hint="MoviePilot 服务访问地址"
                  persistent-hint
                  class="custom-input"
                  :rules="[
                    (v) => !!v || 'MoviePilot URL 不能为空',
                    (v) => isValidUrl(v) || '请输入有效的 URL 地址'
                  ]"
                >
                  <template #prepend-inner>
                    <v-icon color="primary" size="20">mdi-movie-open</v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="config.apikey"
                  label="API Key"
                  variant="outlined"
                  density="comfortable"
                  placeholder="留空使用系统 API Key"
                  hint="服务鉴权凭证"
                  persistent-hint
                  class="custom-input"
                >
                  <template #prepend-inner>
                    <v-icon color="warning" size="20">mdi-key-variant</v-icon>
                  </template>
                  <template #append-inner>
                    <v-tooltip location="top" text="自动生成随机 Key">
                      <template #activator="{ props: slotProps }">
                        <v-btn
                          v-bind="slotProps"
                          icon="mdi-autorenew"
                          size="x-small"
                          variant="text"
                          color="primary"
                          class="rotate-on-hover"
                          @click="generateApiKey"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="config.dashboard_components"
                  :items="dashboardComponents"
                  label="仪表盘组件"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  closable-chips
                  hint="选中的组件将在仪表盘中展示"
                  persistent-hint
                  class="custom-input"
                >
                  <template #prepend-inner>
                    <v-icon color="info" size="20">mdi-view-dashboard-outline</v-icon>
                  </template>
                  <template #chip="{ props: slotProps, item }">
                    <v-chip
                      v-bind="slotProps"
                      size="small"
                      color="info"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ item.value }}
                    </v-chip>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-card>

          <!-- 3. 现代化胶囊分段 Tabs 导航 -->
          <div class="tabs-container mb-4">
            <v-tabs
              v-model="activeTab"
              color="primary"
              align-tabs="start"
              class="custom-modern-tabs"
            >
              <v-tab value="subscription" class="rounded-lg text-none px-4 py-2 font-weight-bold">
                <v-icon start size="18">mdi-link-variant</v-icon>
                订阅配置
                <v-badge
                  v-if="config.subscriptions_config?.length"
                  :content="config.subscriptions_config.length"
                  color="primary"
                  inline
                  class="ml-2"
                />
              </v-tab>
              <v-tab value="clash" class="rounded-lg text-none px-4 py-2 font-weight-bold">
                <v-icon start size="18">mdi-application-brackets-outline</v-icon>
                Clash API 配置
                <v-badge
                  v-if="config.clash_dashboards?.length"
                  :content="config.clash_dashboards.length"
                  color="info"
                  inline
                  class="ml-2"
                />
              </v-tab>
              <v-tab value="execution" class="rounded-lg text-none px-4 py-2 font-weight-bold">
                <v-icon start size="18">mdi-clock-time-four-outline</v-icon>
                执行与定时
              </v-tab>
              <v-tab value="settings" class="rounded-lg text-none px-4 py-2 font-weight-bold">
                <v-icon start size="18">mdi-tune</v-icon>
                高级与规则集
              </v-tab>
            </v-tabs>
          </div>

          <!-- 4. 标签页切换 Window 内容 -->
          <v-window v-model="activeTab" class="tab-window-content">
            <!-- ===== Tab 1: 订阅配置 ===== -->
            <v-window-item value="subscription">
              <v-card variant="flat" class="pa-4 border rounded-lg bg-surface">
                <!-- 全局节点分组设置 -->
                <div class="mb-4">
                  <div class="text-subtitle-2 font-weight-bold mb-2">节点分组与过滤设置</div>
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <div
                        class="feature-toggle-item d-flex align-center justify-space-between border rounded-lg pa-3 cursor-pointer select-none transition-all"
                        @click="config.group_by_country = !config.group_by_country"
                      >
                        <div class="d-flex align-center gap-2">
                          <v-icon color="primary" size="20">mdi-flag-outline</v-icon>
                          <div>
                            <div class="text-body-2 font-weight-medium">按国家/地区分组节点</div>
                            <div class="text-caption text-medium-emphasis">
                              根据节点名称自动归类国家代理组
                            </div>
                          </div>
                        </div>
                        <v-switch
                          v-model="config.group_by_country"
                          color="primary"
                          hide-details
                          inset
                          density="compact"
                          @click.stop
                        />
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div
                        class="feature-toggle-item d-flex align-center justify-space-between border rounded-lg pa-3 cursor-pointer select-none transition-all"
                        @click="config.group_by_region = !config.group_by_region"
                      >
                        <div class="d-flex align-center gap-2">
                          <v-icon color="primary" size="20">mdi-earth</v-icon>
                          <div>
                            <div class="text-body-2 font-weight-medium">按大洲/区域分组节点</div>
                            <div class="text-caption text-medium-emphasis">
                              根据节点名称自动归类大洲代理组
                            </div>
                          </div>
                        </div>
                        <v-switch
                          v-model="config.group_by_region"
                          color="primary"
                          hide-details
                          inset
                          density="compact"
                          @click.stop
                        />
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <v-combobox
                  v-model="config.filter_keywords"
                  label="节点过滤关键词"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  closable-chips
                  clearable
                  hint="按 Enter 添加无需导入的节点过滤关键字"
                  persistent-hint
                  class="mb-6"
                >
                  <template #prepend-inner>
                    <v-icon color="info" size="20">mdi-filter-variant</v-icon>
                  </template>
                  <template #chip="{ props: slotProps, item }">
                    <v-chip
                      v-bind="slotProps"
                      closable
                      size="small"
                      color="info"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ item.value }}
                    </v-chip>
                  </template>
                </v-combobox>

                <v-divider class="my-4" />

                <!-- 订阅链接列表 Header -->
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="text-subtitle-1 font-weight-bold d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-link-box-variant-outline</v-icon>
                    订阅链接配置列表
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="rounded-lg"
                      @click="addSubscriptionConfig"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      添加订阅
                    </v-btn>
                    <v-btn
                      size="small"
                      color="secondary"
                      variant="outlined"
                      class="rounded-lg"
                      @click="openClashTemplateDialog"
                    >
                      <v-icon start>mdi-file-code-outline</v-icon>
                      配置模板
                    </v-btn>
                  </div>
                </div>

                <!-- 空订阅提示 -->
                <div
                  v-if="!config.subscriptions_config || config.subscriptions_config.length === 0"
                  class="empty-box rounded-lg pa-8 text-center border-dashed"
                >
                  <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-link-off</v-icon>
                  <div class="text-body-1 font-weight-medium text-medium-emphasis">
                    暂未配置任何订阅链接
                  </div>
                  <div class="text-caption text-disabled mb-4">
                    点击上方“添加订阅”按钮以配置 Clash 规则订阅
                  </div>
                  <v-btn size="small" color="primary" variant="flat" @click="addSubscriptionConfig">
                    <v-icon start>mdi-plus</v-icon>
                    立即添加
                  </v-btn>
                </div>

                <!-- 订阅折叠卡片列表 -->
                <v-expansion-panels v-else multiple class="sub-panels">
                  <v-expansion-panel
                    v-for="(item, index) in config.subscriptions_config"
                    :key="index"
                    class="border rounded-lg mb-3 overflow-hidden"
                    elevation="0"
                  >
                    <v-expansion-panel-title class="py-3 px-4">
                      <div class="d-flex align-center gap-3 w-100">
                        <v-chip
                          color="primary"
                          size="small"
                          variant="tonal"
                          class="font-weight-bold"
                        >
                          #{{ index + 1 }}
                        </v-chip>
                        <div
                          class="text-subtitle-2 font-weight-bold text-truncate"
                          style="max-width: 320px"
                        >
                          {{ getUrlHostname(item.url) }}
                        </div>
                        <v-chip
                          v-if="item.user_agent"
                          size="x-small"
                          color="info"
                          variant="tonal"
                          class="ml-2"
                        >
                          UA: {{ item.user_agent }}
                        </v-chip>
                        <v-chip
                          v-if="activeOptionsCount(item) > 0"
                          size="x-small"
                          color="success"
                          variant="tonal"
                          class="ml-2"
                        >
                          已勾选 {{ activeOptionsCount(item) }} 项保留
                        </v-chip>
                        <v-spacer />
                        <v-btn
                          icon="mdi-delete-outline"
                          size="small"
                          color="error"
                          variant="text"
                          class="mr-2"
                          @click.stop="removeSubscriptionConfig(index)"
                        />
                      </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text class="pa-4">
                      <v-text-field
                        v-model="item.url"
                        label="订阅 URL 链接"
                        variant="outlined"
                        density="comfortable"
                        placeholder="https://example.com/clash/config.yaml"
                        class="mb-4"
                        :rules="[
                          (v) => !!v || '订阅链接不能为空',
                          (v) => isValidUrl(v) || '请输入有效的 URL 地址'
                        ]"
                      >
                        <template #prepend-inner>
                          <v-icon color="primary" size="20">mdi-link</v-icon>
                        </template>
                      </v-text-field>

                      <v-text-field
                        v-model="item.user_agent"
                        label="User-Agent (可选)"
                        variant="outlined"
                        density="comfortable"
                        placeholder="例如: ClashMeta / ClashforWindows / Mozilla/5.0..."
                        hint="自定义请求订阅链接时使用的 User-Agent"
                        persistent-hint
                        clearable
                        class="mb-4"
                      >
                        <template #prepend-inner>
                          <v-icon color="primary" size="20">mdi-incognito</v-icon>
                        </template>
                      </v-text-field>

                      <div class="text-caption text-medium-emphasis font-weight-bold mb-2">
                        保留选项设置
                      </div>
                      <v-row dense>
                        <v-col cols="12" sm="6" md="3">
                          <div
                            class="option-toggle-box rounded-lg pa-2 border d-flex align-center justify-space-between cursor-pointer select-none"
                            @click="item.rules = !item.rules"
                          >
                            <span class="text-caption font-weight-medium">保留规则</span>
                            <v-switch
                              v-model="item.rules"
                              color="primary"
                              hide-details
                              density="compact"
                              @click.stop
                            />
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                          <div
                            class="option-toggle-box rounded-lg pa-2 border d-flex align-center justify-space-between cursor-pointer select-none"
                            @click="item['rule-providers'] = !item['rule-providers']"
                          >
                            <span class="text-caption font-weight-medium">保留规则集合</span>
                            <v-switch
                              v-model="item['rule-providers']"
                              color="primary"
                              hide-details
                              density="compact"
                              @click.stop
                            />
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                          <div
                            class="option-toggle-box rounded-lg pa-2 border d-flex align-center justify-space-between cursor-pointer select-none"
                            @click="item['proxy-groups'] = !item['proxy-groups']"
                          >
                            <span class="text-caption font-weight-medium">保留代理组</span>
                            <v-switch
                              v-model="item['proxy-groups']"
                              color="primary"
                              hide-details
                              density="compact"
                              @click.stop
                            />
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                          <div
                            class="option-toggle-box rounded-lg pa-2 border d-flex align-center justify-space-between cursor-pointer select-none"
                            @click="item['proxy-providers'] = !item['proxy-providers']"
                          >
                            <span class="text-caption font-weight-medium">保留代理集合</span>
                            <v-switch
                              v-model="item['proxy-providers']"
                              color="primary"
                              hide-details
                              density="compact"
                              @click.stop
                            />
                          </div>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card>
            </v-window-item>

            <!-- ===== Tab 2: Clash API 配置 ===== -->
            <v-window-item value="clash">
              <v-card variant="flat" class="pa-4 border rounded-lg bg-surface">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="comfortable"
                  class="mb-4 rounded-lg"
                  icon="mdi-information-outline"
                >
                  <div class="text-caption font-weight-medium">
                    Clash API 用于通知 Clash 更新规则集；选中的活动面板将作为小组件展示。
                  </div>
                </v-alert>

                <v-radio-group v-model="config.active_dashboard" hide-details class="w-100">
                  <div
                    v-for="(item, index) in config.clash_dashboards"
                    :key="index"
                    class="api-endpoint-card border rounded-lg pa-3 pa-md-4 mb-3 transition-all"
                    :class="{ 'api-endpoint-card--active': config.active_dashboard === index }"
                  >
                    <v-row dense align="center">
                      <v-col
                        cols="12"
                        sm="1"
                        class="d-flex align-center justify-start justify-sm-center"
                      >
                        <v-radio :value="index" color="primary" hide-details />
                        <span class="text-caption font-weight-bold ml-1 d-sm-none"
                          >设为活动面板</span
                        >
                      </v-col>
                      <v-col cols="12" sm="5">
                        <v-text-field
                          v-model="item.url"
                          label="API 访问 URL"
                          variant="outlined"
                          density="comfortable"
                          placeholder="http://localhost:9090"
                          hide-details="auto"
                          :rules="[(v) => !v || isValidUrl(v) || '请输入有效的 URL']"
                        >
                          <template #prepend-inner>
                            <v-icon color="primary" size="20">mdi-web</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="5">
                        <v-text-field
                          v-model="item.secret"
                          label="API 密钥 (Secret)"
                          variant="outlined"
                          density="comfortable"
                          placeholder="your-clash-secret"
                          hide-details="auto"
                          :type="showSecrets[index] ? 'text' : 'password'"
                          :append-inner-icon="
                            showSecrets[index] ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                          "
                          @click:append-inner="toggleSecret(index)"
                        >
                          <template #prepend-inner>
                            <v-icon color="warning" size="20">mdi-shield-key-outline</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="1" class="d-flex align-center justify-end">
                        <v-btn
                          icon="mdi-delete-outline"
                          color="error"
                          variant="text"
                          size="small"
                          @click="removeClashConfig(index)"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </v-radio-group>

                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="rounded-lg mt-2"
                  @click="addClashConfig"
                >
                  <v-icon start>mdi-plus</v-icon>
                  添加 Clash API 地址
                </v-btn>
              </v-card>
            </v-window-item>

            <!-- ===== Tab 3: 执行与定时 ===== -->
            <v-window-item value="execution">
              <v-card variant="flat" class="pa-4 border rounded-lg bg-surface">
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="config.cron_string"
                      label="执行周期 (Cron 表达式)"
                      variant="outlined"
                      density="comfortable"
                      placeholder="0 */6 * * *"
                      hint="标准 Cron 表达式格式 (分 时 日 月 周)"
                      persistent-hint
                      class="mb-3"
                    >
                      <template #prepend-inner>
                        <v-icon color="info" size="20">mdi-clock-outline</v-icon>
                      </template>
                    </v-text-field>

                    <!-- Cron 预设快捷方式 -->
                    <div class="d-flex align-center gap-1 flex-wrap mb-4">
                      <span class="text-caption text-medium-emphasis mr-1">快捷预设:</span>
                      <v-chip
                        v-for="preset in cronPresets"
                        :key="preset.value"
                        size="x-small"
                        color="info"
                        variant="tonal"
                        class="cursor-pointer font-weight-medium"
                        @click="config.cron_string = preset.value"
                      >
                        {{ preset.label }}
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="config.timeout"
                      label="请求超时时间"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      min="1"
                      max="300"
                      suffix="秒"
                      hint="网络请求及订阅下载的超时时长"
                      persistent-hint
                      class="mb-4"
                      :rules="[(v) => v > 0 || '超时时间必须大于 0']"
                    >
                      <template #prepend-inner>
                        <v-icon color="warning" size="20">mdi-timer-sand</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="config.retry_times"
                      label="失败重试次数"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      min="0"
                      max="10"
                      hint="请求失败时的自动重试次数"
                      persistent-hint
                      :rules="[(v) => v >= 0 || '重试次数不能为负数']"
                    >
                      <template #prepend-inner>
                        <v-icon color="info" size="20">mdi-refresh</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="config.refresh_delay"
                      label="刷新延迟"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      min="1"
                      max="30"
                      suffix="秒"
                      hint="通知 Clash 刷新规则集的延迟秒数"
                      persistent-hint
                      :rules="[(v) => v >= 0 || '刷新延迟不能为负数']"
                    >
                      <template #prepend-inner>
                        <v-icon color="primary" size="20">mdi-clock-fast</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </v-window-item>

            <!-- ===== Tab 4: 高级与规则集 ===== -->
            <v-window-item value="settings">
              <v-card variant="flat" class="pa-4 border rounded-lg bg-surface">
                <v-row dense class="mb-4">
                  <v-col cols="12" md="6">
                    <div
                      class="feature-toggle-item d-flex align-center justify-space-between border rounded-lg pa-3 cursor-pointer select-none transition-all"
                      @click="config.hint_geo_dat = !config.hint_geo_dat"
                    >
                      <div class="d-flex align-center gap-2">
                        <v-icon color="primary" size="20">mdi-database-search-outline</v-icon>
                        <div>
                          <div class="text-body-2 font-weight-medium">Geo 规则补全</div>
                          <div class="text-caption text-medium-emphasis">
                            自动获取 GeoIP / GeoSite 官方库补全
                          </div>
                        </div>
                      </div>
                      <v-switch
                        v-model="config.hint_geo_dat"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                        @click.stop
                      />
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div
                      class="feature-toggle-item d-flex align-center justify-space-between border rounded-lg pa-3 cursor-pointer select-none transition-all"
                      @click="config.enable_acl4ssr = !config.enable_acl4ssr"
                    >
                      <div class="d-flex align-center gap-2">
                        <v-icon color="primary" size="20">mdi-shield-crown-outline</v-icon>
                        <div>
                          <div class="text-body-2 font-weight-medium">ACL4SSR 规则集</div>
                          <div class="text-caption text-medium-emphasis">
                            启用 ACL4SSR 规则集扩展支持
                          </div>
                        </div>
                      </div>
                      <v-switch
                        v-model="config.enable_acl4ssr"
                        color="primary"
                        hide-details
                        inset
                        density="compact"
                        @click.stop
                      />
                    </div>
                  </v-col>
                </v-row>

                <v-row dense class="mb-2">
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="config.ruleset_prefix"
                      label="规则集前缀"
                      variant="outlined"
                      density="comfortable"
                      placeholder="📂<="
                      hint="生成规则集名称的前缀标识"
                      persistent-hint
                    >
                      <template #prepend-inner>
                        <v-icon color="info" size="20">mdi-format-title</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="config.acl4ssr_prefix"
                      label="ACL4SSR 前缀"
                      variant="outlined"
                      density="comfortable"
                      placeholder="🗂️=>"
                      hint="ACL4SSR 规则集的前缀标识"
                      persistent-hint
                    >
                      <template #prepend-inner>
                        <v-icon color="primary" size="20">mdi-tag-outline</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="config.cache_ttl"
                      label="缓存 TTL"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      min="600"
                      suffix="秒"
                      hint="缓存超时时长"
                      persistent-hint
                    >
                      <template #prepend-inner>
                        <v-icon color="warning" size="20">mdi-cached</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>

                <v-row dense>
                  <v-col cols="12" class="mb-3">
                    <v-combobox
                      v-model="config.best_cf_ip"
                      label="Cloudflare CDN 优选 IPs"
                      variant="outlined"
                      density="comfortable"
                      multiple
                      chips
                      closable-chips
                      clearable
                      hint="用于 Hosts 中关联的 Cloudflare CDN 优化 IP"
                      persistent-hint
                      :rules="[validateIPs]"
                    >
                      <template #prepend-inner>
                        <v-icon color="warning" size="20">mdi-cloud-check-outline</v-icon>
                      </template>
                      <template #chip="{ props: slotProps, item }">
                        <v-chip
                          v-bind="slotProps"
                          closable
                          size="small"
                          color="warning"
                          variant="tonal"
                        >
                          {{ item.value }}
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-col>

                  <v-col cols="12">
                    <v-combobox
                      v-model="config.identifiers"
                      label="预设设备标识 (Identifiers)"
                      variant="outlined"
                      density="comfortable"
                      multiple
                      chips
                      closable-chips
                      clearable
                      hint="获取配置时的额外 identifier 查询参数"
                      persistent-hint
                    >
                      <template #prepend-inner>
                        <v-icon color="info" size="20">mdi-cellphone-link</v-icon>
                      </template>
                      <template #chip="{ props: slotProps, item }">
                        <v-chip
                          v-bind="slotProps"
                          closable
                          size="small"
                          color="info"
                          variant="tonal"
                        >
                          {{ item.value }}
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-col>
                </v-row>
              </v-card>
            </v-window-item>
          </v-window>
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- 底部辅助说明 & 操作 Toolbar -->
      <div class="pa-4 bg-surface d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="d-flex align-center text-caption text-medium-emphasis">
          <v-icon color="info" size="18" class="mr-1">mdi-help-circle-outline</v-icon>
          配置文档参考:
          <a
            href="https://github.com/wumode/MoviePilot-Plugins/tree/main/plugins.v2/clashruleprovider/README.md"
            target="_blank"
            class="text-primary font-weight-bold text-decoration-none ml-1"
          >
            GitHub README
            <v-icon size="12">mdi-open-in-new</v-icon>
          </a>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            size="small"
            class="rounded-lg text-none"
            @click="resetForm"
          >
            <v-icon start>mdi-refresh</v-icon>
            重置
          </v-btn>
          <v-btn
            color="info"
            variant="tonal"
            size="small"
            class="rounded-lg text-none"
            :loading="testing"
            @click="testConnection"
          >
            <v-icon start>mdi-lan-check</v-icon>
            测试连接
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            class="rounded-lg text-none font-weight-bold px-4"
            :disabled="!isFormValid"
            :loading="saving"
            @click="saveConfig"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            保存配置
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Clash 配置模板 Dialog 弹窗 -->
    <v-dialog v-model="clashTemplateDialog" max-width="680">
      <v-card class="rounded-lg border overflow-hidden" elevation="0">
        <v-card-title class="pa-4 bg-surface d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-file-code-outline</v-icon>
            <span class="font-weight-bold text-h6">Clash 配置模板编辑</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="clashTemplateDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-select
            v-model="clashTemplateType"
            :items="['YAML']"
            label="配置格式"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <div class="ace-editor-wrapper border rounded-lg overflow-hidden mb-3">
            <VAceEditor
              v-model:value="clashTemplateContent"
              lang="yaml"
              theme="monokai"
              :options="editorOptions"
              :placeholder="configPlaceholder"
              style="height: 24rem; width: 100%"
            />
          </div>
          <v-alert type="info" variant="tonal" density="compact" class="rounded-lg mb-0">
            <template #prepend>
              <v-icon size="18">mdi-information-outline</v-icon>
            </template>
            <span class="text-caption">规则与出站代理会自动附加在配置模板之上</span>
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 bg-surface">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            class="rounded-lg"
            @click="clashTemplateDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="rounded-lg font-weight-bold"
            @click="saveClashTemplate"
          >
            保存模板
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.plugin-config-wrapper {
  margin: 0 auto;
  max-width: 1200px;
}

/* 扁平化 Header */
.config-hero-header {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.hero-icon-avatar {
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: none;
}

/* 扁平化开关卡片 */
.switch-card {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: 8px;
  box-shadow: none !important;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.switch-card:hover {
  border-color: rgba(var(--v-border-color), 0.25);
  background: rgba(var(--v-theme-on-surface), 0.04);
  transform: none;
}

/* 各类型开关激活态色调：纯净扁平无渐变、无发光阴影 */
.switch-card--active {
  border-color: rgba(var(--v-theme-primary), 0.35) !important;
  background: rgba(var(--v-theme-primary), 0.08) !important;
  box-shadow: none !important;
}

.switch-card--info.switch-card--active {
  border-color: rgba(var(--v-theme-info), 0.35) !important;
  background: rgba(var(--v-theme-info), 0.08) !important;
  box-shadow: none !important;
}

.switch-card--warning.switch-card--active {
  border-color: rgba(var(--v-theme-warning), 0.35) !important;
  background: rgba(var(--v-theme-warning), 0.08) !important;
  box-shadow: none !important;
}

.switch-card--success.switch-card--active {
  border-color: rgba(var(--v-theme-success), 0.35) !important;
  background: rgba(var(--v-theme-success), 0.08) !important;
  box-shadow: none !important;
}

.card-icon-avatar {
  width: 34px;
  height: 34px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  transition: background-color 0.2s ease;
}

.switch-card--active .card-icon-avatar {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

/* 其它可交互条目扁平样式 */
.feature-toggle-item {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: 8px;
}

.feature-toggle-item:hover {
  border-color: rgba(var(--v-border-color), 0.25);
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.option-toggle-box {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.option-toggle-box:hover {
  border-color: rgba(var(--v-border-color), 0.25);
  background: rgba(var(--v-theme-on-surface), 0.04);
}

/* API Dashboard 卡片 */
.api-endpoint-card {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: 8px;
}

.api-endpoint-card:hover {
  border-color: rgba(var(--v-border-color), 0.25);
}

.api-endpoint-card--active {
  border-color: rgba(var(--v-theme-primary), 0.35) !important;
  background: rgba(var(--v-theme-primary), 0.06) !important;
}

/* Tabs 扁平风格 */
.custom-modern-tabs {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.rotate-on-hover:hover {
  transform: rotate(180deg);
  transition: transform 0.4s ease;
}

.transition-all {
  transition: all 0.2s ease;
}

.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), 0.2);
}

.sub-panels :deep(.v-expansion-panel-title__overlay) {
  opacity: 0.02;
}

.ace-editor-wrapper {
  box-shadow: none;
}
</style>
