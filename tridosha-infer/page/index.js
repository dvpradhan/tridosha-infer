import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'
import { Step, Sleep } from '@zos/sensor'

Page({
  state: {
    ojasWidget: null, 
    ojasBarWidget: null,
    stepWidget: null, 
    sleepWidget: null
  },

  build() {
    try { localStorage.setItem('ui_status', 'IDLE') } catch(e) {}

    createWidget(widget.TEXT, { x: 0, y: 65, w: 390, h: 40, color: 0x00ffcc, text_size: 24, align_h: align.CENTER_H, text: 'ArogyaPulse' })
    
    createWidget(widget.TEXT, { x: 0, y: 105, w: 390, h: 30, color: 0x94a3b8, text_size: 16, align_h: align.CENTER_H, text: 'Core Vitality (Ojas)' })
    this.state.ojasWidget = createWidget(widget.TEXT, { x: 0, y: 130, w: 390, h: 50, color: 0xffffff, text_size: 42, align_h: align.CENTER_H, text: '--%' })
    
    createWidget(widget.FILL_RECT, { x: 45, y: 185, w: 300, h: 10, color: 0x1e293b, radius: 5 })
    this.state.ojasBarWidget = createWidget(widget.FILL_RECT, { x: 45, y: 185, w: 0, h: 10, color: 0x10b981, radius: 5 })

    this.state.sleepWidget = createWidget(widget.TEXT, { x: 45, y: 210, w: 140, h: 30, color: 0x8b5cf6, text_size: 14, text: '🌙 Sleep: --' })
    this.state.stepWidget = createWidget(widget.TEXT, { x: 205, y: 210, w: 140, h: 30, color: 0x38bdf8, text_size: 14, align_h: align.RIGHT, text: '👣 Steps: --' })

    const startY = 255 
    const gap = 75

    createWidget(widget.FILL_RECT, { x: 45, y: startY + 5, w: 300, h: 60, color: 0x4c1d95, radius: 30 }) 
    createWidget(widget.BUTTON, { x: 45, y: startY, w: 300, h: 60, text: '5s - Rapid Test', text_size: 20, color: 0xffffff, normal_color: 0x8b5cf6, press_color: 0x5b21b6, radius: 30, click_func: () => push({ url: 'page/scan', params: '5' }) })

    createWidget(widget.FILL_RECT, { x: 45, y: startY + gap + 5, w: 300, h: 60, color: 0x1e3a8a, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: startY + gap, w: 300, h: 60, text: '30s - Quick Scan', text_size: 20, color: 0xffffff, normal_color: 0x3b82f6, press_color: 0x1e40af, radius: 30, click_func: () => push({ url: 'page/scan', params: '30' }) })

    createWidget(widget.FILL_RECT, { x: 45, y: startY + (gap*2) + 5, w: 300, h: 60, color: 0x134e4a, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: startY + (gap*2), w: 300, h: 60, text: '45s - Standard', text_size: 20, color: 0xffffff, normal_color: 0x14b8a6, press_color: 0x0f766e, radius: 30, click_func: () => push({ url: 'page/scan', params: '45' }) })

    createWidget(widget.FILL_RECT, { x: 45, y: startY + (gap*3) + 5, w: 300, h: 60, color: 0x064e3b, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: startY + (gap*3), w: 300, h: 60, text: '60s - Clinical', text_size: 20, color: 0xffffff, normal_color: 0x10b981, press_color: 0x047857, radius: 30, click_func: () => push({ url: 'page/scan', params: '60' }) })

    this.updateVitals()
  },

  onShow() {
    this.updateVitals()
  },

  updateVitals() {
    let currentSteps = 0
    let sleepScore = 0
    
    try { const stepSensor = new Step(); currentSteps = stepSensor.getCurrent() || 0; this.state.stepWidget.setProperty(prop.TEXT, `👣 Steps: ${currentSteps}`) } catch(e) { }
    try { const sleepSensor = new Sleep(); const sleepInfo = sleepSensor.getInfo(); sleepScore = sleepInfo ? (sleepInfo.score || 75) : 75; this.state.sleepWidget.setProperty(prop.TEXT, `🌙 Sleep: ${sleepScore}/100`) } catch(e) { }

    let ojasBase = (sleepScore * 0.6) + (Math.min(currentSteps / 8000, 1) * 100 * 0.4)
    this.state.ojasWidget.setProperty(prop.TEXT, `${Math.floor(ojasBase)}%`)
    this.state.ojasBarWidget.setProperty(prop.W, Math.floor(300 * (ojasBase / 100)))

    let barColor = 0x10b981 
    if (ojasBase < 70) barColor = 0xf59e0b 
    if (ojasBase < 30) barColor = 0xef4444 
    this.state.ojasBarWidget.setProperty(prop.COLOR, barColor)
  }
})