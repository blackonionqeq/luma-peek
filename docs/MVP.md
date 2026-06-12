# luma-peek MVP Design

## 定位

极速、轻量的网页图片浏览器。支持 Shadow DOM 隔离模式。

## API

```ts
interface ViewerOptions {
  shadow?: boolean // 是否使用 Shadow DOM 挂载，默认 true
}

interface OpenOptions {
  src: string
  alt?: string
}

interface Viewer {
  open(options: OpenOptions): void
  close(): void
  destroy(): void
  on(event: 'open' | 'close', callback: () => void): void
  off(event: 'open' | 'close', callback: () => void): void
}

function createViewer(options?: ViewerOptions): Viewer
```

## MVP 交互

- 打开：全屏 overlay 展示图片，从点击位置过渡动画展开
- 关闭：点击背景区域 / 按 Esc
- 拖拽平移：pointer 按住拖动
- 缩放：滚轮 / 双指 pinch
- 双击：切换适屏 ↔ 1:1

## 不做（留给后续插件）

- 画廊模式（多图切换）
- 旋转
- 缩略图导航
- 工具栏 UI
- 下载、分享按钮
- 手机端下拉关闭手势

## 架构分层

```
src/
├── core/
│   ├── state.ts        # 状态机（idle / open / animating）
│   ├── transform.ts    # 平移、缩放的数学计算
│   └── events.ts       # 事件总线（on/off/emit）
├── gestures/
│   ├── pointer.ts      # 拖拽、双击检测
│   └── wheel.ts        # 滚轮缩放
├── render/
│   ├── dom.ts          # DOM 创建、样式注入
│   └── animate.ts      # 过渡动画（open/close）
├── mount.ts            # 挂载策略（shadow / vanilla）
└── index.ts            # createViewer 入口
```

## 性能目标

- 打开到首帧 <16ms（不含图片加载）
- 手势响应 0 帧延迟（requestAnimationFrame 内完成 transform 更新）
- 空闲时零事件监听（关闭状态不挂任何 listener）
