import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'
import { showToast } from '@zos/interaction'

Page({
  state: { historyWidget: null, ojasWidget: null, ojasBarWidget: null },

  build() {
    // Clear any stuck UI locks
    try { localStorage.setItem('ui_status', 'IDLE') } catch(e) {}

    createWidget(widget.TEXT, { x: 0, y: 30, w: 390, h: 40, color: 0x00ffcc, text_size: 24, align_h: align.CENTER_H, text: 'Tridosha Engine' })
    
    createWidget(widget.TEXT, { x: 0, y: 70, w: 390, h: 30, color: 0x94a3b8, text_size: 16, align_h: align.CENTER_H, text: 'Core Vitality (Ojas)' })
    this.state.ojasWidget = createWidget(widget.TEXT, { x: 0, y: 95, w: 390, h: 50, color: 0xffffff, text_size: 42, align_h: align.CENTER_H, text: '--%' })
    
    createWidget(widget.FILL_RECT, { x: 45, y: 150, w: 300, h: 10, color: 0x1e293b, radius: 5 })
    this.state.ojasBarWidget = createWidget(widget.FILL_RECT, { x: 45, y: 150, w: 0, h: 10, color: 0x10b981, radius: 5 })

    const startY = 190
    const gap = 75

    createWidget(widget.FILL_RECT, { x: 45, y: startY + 5, w: 300, h: 60, color: 0x4c1d95, radius: 30 }) 
    createWidget(widget.BUTTON, { x: 45, y: startY, w: 300, h: 60, text: '10s - Rapid Test', text_size: 20, color: 0xffffff, normal_color: 0x8b5cf6, press_color: 0x5b21b6, radius: 30, click_func: () => push({ url: 'page/scan', params: '10' }) })

    createWidget(widget.FILL_RECT, { x: 45, y: startY + gap + 5, w: 300, h: 60, color: 0x1e3a8a, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: startY + gap, w: 300, h: 60, text: '30s - Quick Scan', text_size: 20, color: 0xffffff, normal_color: 0x3b82f6, press_color: 0x1e40af, radius: 30, click_func: () => push({ url: 'page/scan', params: '30' }) })

    createWidget(widget.FILL_RECT, { x: 45, y: startY + (gap*2) + 5, w: 300, h: 60, color: 0x134e4a, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: startY + (gap*2), w: 300, h: 60, text: '45s - Standard', text_size: 20, color: 0xffffff, normal_color: 0x14b8a6, press_color: 0x0f766e, radius: 30, click_func: () => push({ url: 'page/scan', params: '45' }) })

    createWidget(widget.FILL_RECT, { x: 45, y: startY + (gap*3) + 5, w: 300, h: 60, color: 0x064e3b, radius: 30 })
    createWidget(widget.BUTTON, { x: 45, y: startY + (gap*3), w: 300, h: 60, text: '60s - Clinical', text_size: 20, color: 0xffffff, normal_color: 0x10b981, press_color: 0x047857, radius: 30, click_func: () => push({ url: 'page/scan', params: '60' }) })

    createWidget(widget.TEXT, { x: 0, y: 510, w: 390, h: 30, color: 0x64748b, text_size: 16, align_h: align.CENTER_H, text: '▼ Scroll to view Local Log ▼' })
    createWidget(widget.TEXT, { x: 0, y: 570, w: 390, h: 40, color: 0xffffff, text_size: 26, align_h: align.CENTER_H, text: 'Recent Readings' })
    createWidget(widget.FILL_RECT, { x: 145, y: 615, w: 100, h: 3, color: 0x94a3b8, radius: 2 })
    
    createWidget(widget.BUTTON, { 
      x: 35, y: 640, w: 150, h: 40, text: '↻ Refresh', text_size: 16, color: 0xffffff, 
      normal_color: 0x334155, press_color: 0x1e293b, radius: 20, 
      click_func: () => { 
        this.refreshHistory() 
        showToast({ content: "Data Refreshed!" })
      } 
    })

    createWidget(widget.BUTTON, { 
      x: 205, y: 640, w: 150, h: 40, text: '⚠️ Hard Reset', text_size: 16, color: 0xffaaaa, 
      normal_color: 0x7f1d1d, press_color: 0x450a0a, radius: 20, 
      click_func: () => { 
        try {
          for(let i=0; i<5; i++) localStorage.removeItem('t_log_' + i)
        } catch(e) {}
        this.refreshHistory() 
        showToast({ content: "Memory Wiped!" }) 
      } 
    })

    this.state.historyWidget = createWidget(widget.TEXT, { x: 20, y: 710, w: 350, h: 650, color: 0xe2e8f0, text_size: 20, text_style: text_style.WRAP, text: "Loading..." })
    createWidget(widget.FILL_RECT, { x: 0, y: 1400, w: 390, h: 20, color: 0x000000 })

    this.refreshHistory()
  },

  onShow() {
    if (this.state.historyWidget) this.refreshHistory()
  },

  refreshHistory() {
    let historyText = "No records found.\nComplete a reading to save data."
    let formattedLogs = []
    
    for (let i = 0; i < 5; i++) {
      try {
        const val = localStorage.getItem('t_log_' + i)
        if (val && typeof val === 'string' && val.length > 5 && val !== 'undefined') formattedLogs.push(val)
      } catch (e) {}
    }
    
    if (formattedLogs.length > 0) {
      historyText = formattedLogs.join('\n\n────────────────\n\n')
      // For now, statically show the bar active if logs exist
      this.state.ojasWidget.setProperty(prop.TEXT, "85%")
      this.state.ojasBarWidget.setProperty(prop.W, Math.floor(300 * 0.85))
    } else {
      this.state.ojasWidget.setProperty(prop.TEXT, "--%")
      this.state.ojasBarWidget.setProperty(prop.W, 0)
    }

    this.state.historyWidget.setProperty(prop.TEXT, historyText)
  }
})