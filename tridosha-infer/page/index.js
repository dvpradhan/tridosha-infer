import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'
import { showToast } from '@zos/interaction'

Page({
  state: {
    historyWidget: null
  },

  build() {
    createWidget(widget.TEXT, { x: 0, y: 50, w: 390, h: 40, color: 0x00ffcc, text_size: 28, align_h: align.CENTER_H, text: 'Prakriti Engine' })
    createWidget(widget.TEXT, { x: 0, y: 100, w: 390, h: 30, color: 0x94a3b8, text_size: 18, align_h: align.CENTER_H, text: 'Select Calibration Time' })

    createWidget(widget.FILL_RECT, { x: 45, y: 155, w: 300, h: 60, color: 0x4c1d95, radius: 30 }) 
    createWidget(widget.BUTTON, { x: 45, y: 150, w: 300, h: 60, text: '10s - Rapid Test', text_size: 20, color: 0xffffff, normal_color: 0x8b5cf6, press_color: 0x5b21b6, radius: 30, click_func: () => { push({ url: 'page/scan', params: '10' }) } })

    createWidget(widget.FILL_RECT, { x: 45, y: 235, w: 300, h: 60, color: 0x1e3a8a, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: 230, w: 300, h: 60, text: '30s - Quick Scan', text_size: 20, color: 0xffffff, normal_color: 0x3b82f6, press_color: 0x1e40af, radius: 30, click_func: () => { push({ url: 'page/scan', params: '30' }) } })

    createWidget(widget.FILL_RECT, { x: 45, y: 315, w: 300, h: 60, color: 0x134e4a, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: 310, w: 300, h: 60, text: '45s - Standard', text_size: 20, color: 0xffffff, normal_color: 0x14b8a6, press_color: 0x0f766e, radius: 30, click_func: () => { push({ url: 'page/scan', params: '45' }) } })

    createWidget(widget.FILL_RECT, { x: 45, y: 395, w: 300, h: 60, color: 0x064e3b, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: 390, w: 300, h: 60, text: '60s - Clinical', text_size: 20, color: 0xffffff, normal_color: 0x10b981, press_color: 0x047857, radius: 30, click_func: () => { push({ url: 'page/scan', params: '60' }) } })

    createWidget(widget.TEXT, { x: 0, y: 480, w: 390, h: 30, color: 0x64748b, text_size: 16, align_h: align.CENTER_H, text: '▼ Scroll to view Past History ▼' })

    createWidget(widget.TEXT, { x: 0, y: 540, w: 390, h: 40, color: 0xffffff, text_size: 26, align_h: align.CENTER_H, text: 'Recent Readings' })
    createWidget(widget.FILL_RECT, { x: 145, y: 585, w: 100, h: 3, color: 0x94a3b8, radius: 2 })
    
    // Standard Refresh Button
    createWidget(widget.BUTTON, { 
      x: 35, y: 610, w: 150, h: 40, text: '↻ Refresh', text_size: 16, color: 0xffffff, 
      normal_color: 0x334155, press_color: 0x1e293b, radius: 20, 
      click_func: () => { 
        this.refreshHistory() 
        showToast({ content: "Log Refreshed!" })
      } 
    })

    // Nuclear Option: The Cache Wiper
    createWidget(widget.BUTTON, { 
      x: 205, y: 610, w: 150, h: 40, text: '⚠️ Hard Reset', text_size: 16, color: 0xffaaaa, 
      normal_color: 0x7f1d1d, press_color: 0x450a0a, radius: 20, 
      click_func: () => { 
        localStorage.clear() 
        this.refreshHistory() // Updates the text block silently
        showToast({ content: "Memory Wiped!" }) // Fires the correct popup instantly
      } 
    })

    this.state.historyWidget = createWidget(widget.TEXT, { x: 20, y: 680, w: 350, h: 650, color: 0xe2e8f0, text_size: 22, text_style: text_style.WRAP, text: "Loading..." })
    createWidget(widget.FILL_RECT, { x: 0, y: 1350, w: 390, h: 20, color: 0x000000 })

    this.refreshHistory()
  },

  onShow() {
    if (this.state.historyWidget) {
      this.refreshHistory()
    }
  },

  // Notice we removed the popup logic from here to prevent collision!
  refreshHistory() {
    let historyText = "No records found.\nComplete a reading to save data."
    let history = []
    
    for (let i = 0; i < 5; i++) {
      try {
        const val = localStorage.getItem('td_log_' + i)
        if (val) history.push(String(val))
      } catch (e) {}
    }
    
    if (history.length > 0) {
      historyText = history.join('\n\n────────────────\n\n')
    }
    
    this.state.historyWidget.setProperty(prop.TEXT, historyText)
  }
})