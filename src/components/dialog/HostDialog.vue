<script setup lang="ts">
import {ref, PropType, toRaw} from 'vue'
import {validateIPs} from '@/components/utils'
import type {HostData} from "@/components/types"
import {defaultHost} from "@/components/constants";

const props = defineProps({
  initialValue: {
    type: Object as PropType<HostData>,
    default: () => ({...defaultHost})
  },
  isAdding: {
    type: Boolean,
    default: true
  },
  bestCloudflareIPs: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  api: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'refresh', 'show-snackbar', 'show-error'])

// State
const hostForm = ref<any>(null)
const saveHostLoading = ref(false)
const newHost = ref<HostData>(props.isAdding ? {...defaultHost} : structuredClone(toRaw(props.initialValue)))
async function saveHost() {
  const {valid} = await hostForm.value.validate();
  if (!valid) return;
  try {
    saveHostLoading.value = true
    newHost.value.domain = newHost.value.domain.trim();
    const targetDomain = props.isAdding ? newHost.value.domain : props.initialValue.domain;

    const result = await props.api.post('/plugin/ClashRuleProvider/hosts', {
      domain: targetDomain,
      host: newHost.value
    });
    
    if (!result.success) {
      emit('show-error', '保存 Host 失败: ' + (result.message || '未知错误'));
      emit('show-snackbar', {
        show: true,
        message: '保存 Host 失败',
        color: 'error'
      });
      return
    }
    emit('close');
    emit('refresh'); 
    emit('show-snackbar', {
      show: true,
      message: props.isAdding ? 'Host 添加成功' : 'Host 更新成功',
      color: 'success'
    });
  } catch (err: any) {
    emit('show-error', '保存 Host 失败: ' + (err.message || '未知错误'));
    emit('show-snackbar', {
      show: true,
      message: '保存 Host 失败',
      color: 'error'
    });
  } finally {
    saveHostLoading.value = false
  }
}
</script>

<template>
  <v-dialog max-width="40rem">
    <v-form ref="hostForm" @submit.prevent="saveHost">
      <v-card>
        <v-card-title>{{ isAdding ? '添加 Host' : '编辑 Host' }}</v-card-title>
        <v-card-text>
          <v-text-field
              v-model="newHost.domain"
              label="域名"
              required
              :rules="[v => !!v || '域名不能为空']"
              class="mb-4"
          >
          </v-text-field>
          <v-combobox
              v-if="!newHost.using_cloudflare"
              v-model="newHost.value"
              multiple
              chips
              closable-chips
              clearable
              label="IP"
              required
              :rules="[validateIPs]"
              class="mb-4"
              hint="一个或多个 IP 地址"
          >
            <template #chip="{ props, item }">
              <v-chip
                  v-bind="props"
                  closable
                  size="small"
              >
                {{ item.value }}
              </v-chip>
            </template>
          </v-combobox>
          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                  v-model="newHost.using_cloudflare"
                  label="使用 Cloudflare CDN"
                  inset
                  hint="设置为 CF 优选 IPs"
                  persistent-hint
              ></v-switch>
            </v-col>
          </v-row>
        </v-card-text>
        <v-alert
            v-if="bestCloudflareIPs.length === 0 && newHost.using_cloudflare"
            type="warning"
            text="请在「高级选项」配置 Cloudflare CDN 优选 IPs"
            variant="outlined"
            class="mb-2"
        >
        </v-alert>
        <v-alert
            type="info"
            variant="tonal"
        >
          支持<a href="https://wiki.metacubex.one/handbook/syntax/#_8" target="_blank">域名通配符</a>
        </v-alert>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="emit('close')">取消</v-btn>
          <v-btn
              color="primary"
              type="submit"
              :loading="saveHostLoading"
          >保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
</style>
