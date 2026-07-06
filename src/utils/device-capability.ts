/**
 * 设备性能等级检测系统
 *
 * 在客户端检测设备性能等级，将后续所有优化基于此分级决策
 * 分级策略：
 *   - HIGH:   内存 >= 4GB, CPU 核心 >= 4, 非低端设备 → 全功能体验
 *   - MEDIUM: 常规手机/平板 → 简化动画 + 渐进加载
 *   - LOW:    低端设备、弱网、省电模式 → 极简模式
 */

export type DeviceTier = 'high' | 'medium' | 'low';

export interface DeviceCapability {
  tier: DeviceTier;
  reducedMotion: boolean;
  lowMemory: boolean;
  slowNetwork: boolean;
  lowCpu: boolean;
  saveData: boolean;
}

const LOW_CPU_THRESHOLD = 4;
const LOW_MEMORY_THRESHOLD = 2; // GB

function detectDeviceCapability(): DeviceCapability {
  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      reducedMotion: false,
      lowMemory: false,
      slowNetwork: false,
      lowCpu: false,
      saveData: false,
    };
  }

  const nav = navigator as any;
  const mql = window.matchMedia;

  const reducedMotion = mql('(prefers-reduced-motion: reduce)').matches;
  const saveData = nav.connection?.saveData === true;
  const lowMemory =
    nav.deviceMemory != null && nav.deviceMemory < LOW_MEMORY_THRESHOLD;
  const lowCpu =
    nav.hardwareConcurrency != null &&
    nav.hardwareConcurrency < LOW_CPU_THRESHOLD;
  const slowNetwork = nav.connection?.effectiveType
    ? ['slow-2g', '2g', '3g'].includes(nav.connection.effectiveType)
    : false;

  // 触摸设备 + 小屏幕通常意味着移动设备（低端概率高）
  const isSmallTouch =
    'ontouchstart' in window && window.innerWidth < 768;

  let tier: DeviceTier;

  if (reducedMotion || saveData || lowMemory) {
    tier = 'low';
  } else if (lowCpu || slowNetwork || isSmallTouch) {
    tier = 'medium';
  } else {
    tier = 'high';
  }

  return { tier, reducedMotion, lowMemory, slowNetwork, lowCpu, saveData };
}

let cachedCapability: DeviceCapability | null = null;

export function getDeviceCapability(): DeviceCapability {
  if (!cachedCapability) {
    cachedCapability = detectDeviceCapability();
  }
  return cachedCapability;
}

/** 低端设备（low）或中端设备（medium）都返回 true */
export function isLowPerfDevice(): boolean {
  return getDeviceCapability().tier !== 'high';
}

/** 仅低端设备返回 true */
export function isLowTier(): boolean {
  return getDeviceCapability().tier === 'low';
}

/** 仅中端设备返回 true */
export function isMediumTier(): boolean {
  return getDeviceCapability().tier === 'medium';
}

/** 获取 CSS 类名字符串以注入到 HTML 根元素 */
export function getDeviceTierCssClass(): string {
  return `device-tier-${getDeviceCapability().tier}`;
}
