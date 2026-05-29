import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { HeartRate, Stress, BloodOxygen, Step, Sleep } from '@zos/sensor'
import { localStorage } from '@zos/storage'
import { showToast } from '@zos/interaction'

Page({
  state: {
    hrSensor: null, hrBuffer: [], requiredSamples: 60, maxGraphSlices: 35, hasSaved: false,
    hrValueWidget: null, hrvValueWidget: null, progressWidget: null, 
    graphSlices: [], scanWidgets: [], headerWidgetsData: [], pages: [[], [], [], []],
    currentPage: 0,
    
    // Result Widgets
    badgeBg: null, badgeText: null, subtitleText: null, tabTitle: null,
    telemetryText: null, raktaBar: null, raktaWidget: null, majjaBar: null, 
    majjaWidget: null, rasaBar: null, rasaWidget: null,
    
    // Segmented Symptom Widgets
    sympGutWidget: null, sympAppWidget: null, sympMoodWidget: null, sympSleepWidget: null, sympEnergyWidget: null,
    
    // Segmented To-Do Widgets
    todoFoodWidget: null, todoWaterWidget: null, todoYogaWidget: null, todoRituWidget: null,
    
    // Segmented Avoid Widgets
    avoidFoodWidget: null, avoidRoutineWidget: null
  },

  onInit(params) {
    this.state.requiredSamples = parseInt(params) || 60
  },

  build() {
    const addScan = (w) => this.state.scanWidgets.push(w)
    const addHeader = (w, relX) => this.state.headerWidgetsData.push({ w, relX })
    const addPage = (pageIdx, w, relX) => this.state.pages[pageIdx].push({ w, relX })

    // ==========================================
    // 1. THE SCANNING UI (65px Safe Zone Enforced)
    // ==========================================
    // Background block extends to Y:0 to frame the system clock nicely
    addScan(createWidget(widget.FILL_RECT, { x: 0, y: 0, w: 390, h: 115, color: 0x0f172a }))
    addScan(createWidget(widget.TEXT, { x: 0, y: 65, w: 390, h: 40, color: 0x00ffcc, text_size: 26, align_h: align.CENTER_H, text: 'Scanning...' }))

    addScan(createWidget(widget.FILL_RECT, { x: 20, y: 135, w: 165, h: 100, color: 0x1e293b, radius: 16 }))
    addScan(createWidget(widget.TEXT, { x: 20, y: 145, w: 165, h: 30, color: 0x94a3b8, text_size: 18, align_h: align.CENTER_H, text: 'PULSE' }))
    this.state.hrValueWidget = createWidget(widget.TEXT, { x: 20, y: 175, w: 165, h: 50, color: 0xff3366, text_size: 42, align_h: align.CENTER_H, text: '--' })
    addScan(this.state.hrValueWidget)

    addScan(createWidget(widget.FILL_RECT, { x: 205, y: 135, w: 165, h: 100, color: 0x1e293b, radius: 16 }))
    addScan(createWidget(widget.TEXT, { x: 205, y: 145, w: 165, h: 30, color: 0x94a3b8, text_size: 18, align_h: align.CENTER_H, text: 'HRV' }))
    this.state.hrvValueWidget = createWidget(widget.TEXT, { x: 205, y: 175, w: 165, h: 50, color: 0x38bdf8, text_size: 42, align_h: align.CENTER_H, text: '--' })
    addScan(this.state.hrvValueWidget)

    const graphBottom = 335
    for (let i = 0; i < this.state.maxGraphSlices; i++) {
      const slice = createWidget(widget.FILL_RECT, { x: 20 + (i * 10), y: graphBottom, w: 10, h: 0, color: 0xff3366 })
      this.state.graphSlices.push(slice)
      addScan(slice)
    }

    addScan(createWidget(widget.FILL_RECT, { x: 20, y: 350, w: 350, h: 6, color: 0x333333, radius: 3 }))
    this.state.progressWidget = createWidget(widget.FILL_RECT, { x: 20, y: 350, w: 0, h: 6, color: 0x00ffcc, radius: 3 })
    addScan(this.state.progressWidget)

    addScan(createWidget(widget.TEXT, { x: 20, y: 375, w: 350, h: 100, color: 0x00ffcc, text_size: 26, align_h: align.CENTER_H, text_style: text_style.WRAP, text: 'Relax your wrist.\nReading baseline...' }))
    
    // ==========================================
    // 2. THE RESULT HEADER
    // ==========================================
    this.state.badgeBg = createWidget(widget.FILL_RECT, { x: 1000, y: 65, w: 350, h: 60, radius: 30, color: 0xeab308 })
    this.state.badgeText = createWidget(widget.TEXT, { x: 1000, y: 65, w: 350, h: 60, text_size: 30, color: 0xffffff, align_h: align.CENTER_H, align_v: align.CENTER_V, text: 'DOSHA' })
    this.state.subtitleText = createWidget(widget.TEXT, { x: 1000, y: 135, w: 350, h: 80, text_size: 20, color: 0x94a3b8, align_h: align.CENTER_H, text_style: text_style.WRAP, text: 'Synthesis...' })
    
    const topPrev = createWidget(widget.BUTTON, { x: 1000, y: 225, w: 60, h: 40, text: '◀', text_size: 24, color: 0xffffff, normal_color: 0x334155, press_color: 0x1e293b, radius: 8, click_func: () => { if(this.state.currentPage > 0) this.goToPage(this.state.currentPage - 1) } })
    this.state.tabTitle = createWidget(widget.TEXT, { x: 1000, y: 225, w: 230, h: 40, text_size: 20, color: 0x38bdf8, align_h: align.CENTER_H, align_v: align.CENTER_V, text: '1/4 • Dhatus' })
    const topNext = createWidget(widget.BUTTON, { x: 1000, y: 225, w: 60, h: 40, text: '▶', text_size: 24, color: 0xffffff, normal_color: 0x334155, press_color: 0x1e293b, radius: 8, click_func: () => { if(this.state.currentPage < 3) this.goToPage(this.state.currentPage + 1) } })

    addHeader(this.state.badgeBg, 20); addHeader(this.state.badgeText, 20); addHeader(this.state.subtitleText, 20)
    addHeader(topPrev, 20); addHeader(this.state.tabTitle, 80); addHeader(topNext, 310)

    // ==========================================
    // PAGE 0: TELEMETRY & DHATUS
    // ==========================================
    this.state.telemetryText = createWidget(widget.TEXT, { x: 1000, y: 300, w: 340, h: 250, text_size: 24, color: 0xe2e8f0, text_style: text_style.WRAP, text: 'Raw Data...' })
    addPage(0, this.state.telemetryText, 25)

    addPage(0, createWidget(widget.TEXT, { x: 1000, y: 560, w: 340, h: 40, text_size: 26, color: 0xffffff, text: 'Tissue Health (Dhatus)' }), 25)
    
    addPage(0, createWidget(widget.TEXT, { x: 1000, y: 610, w: 340, h: 30, text_size: 22, color: 0x94a3b8, text: 'Rakta (Cardio/Blood)' }), 25)
    addPage(0, createWidget(widget.FILL_RECT, { x: 1000, y: 645, w: 340, h: 14, color: 0x334155, radius: 7 }), 25)
    this.state.raktaBar = createWidget(widget.FILL_RECT, { x: 1000, y: 645, w: 0, h: 14, color: 0xff3366, radius: 7 })
    this.state.raktaWidget = createWidget(widget.TEXT, { x: 1000, y: 665, w: 340, h: 30, text_size: 20, color: 0xe2e8f0, text: '...' })
    addPage(0, this.state.raktaBar, 25); addPage(0, this.state.raktaWidget, 25)

    addPage(0, createWidget(widget.TEXT, { x: 1000, y: 710, w: 340, h: 30, text_size: 22, color: 0x94a3b8, text: 'Majja (Nervous System)' }), 25)
    addPage(0, createWidget(widget.FILL_RECT, { x: 1000, y: 745, w: 340, h: 14, color: 0x334155, radius: 7 }), 25)
    this.state.majjaBar = createWidget(widget.FILL_RECT, { x: 1000, y: 745, w: 0, h: 14, color: 0x38bdf8, radius: 7 })
    this.state.majjaWidget = createWidget(widget.TEXT, { x: 1000, y: 765, w: 340, h: 30, text_size: 20, color: 0xe2e8f0, text: '...' })
    addPage(0, this.state.majjaBar, 25); addPage(0, this.state.majjaWidget, 25)

    addPage(0, createWidget(widget.TEXT, { x: 1000, y: 810, w: 340, h: 30, text_size: 22, color: 0x94a3b8, text: 'Rasa (Plasma/Lymph)' }), 25)
    addPage(0, createWidget(widget.FILL_RECT, { x: 1000, y: 845, w: 340, h: 14, color: 0x334155, radius: 7 }), 25)
    this.state.rasaBar = createWidget(widget.FILL_RECT, { x: 1000, y: 845, w: 0, h: 14, color: 0x00ffcc, radius: 7 })
    this.state.rasaWidget = createWidget(widget.TEXT, { x: 1000, y: 865, w: 340, h: 30, text_size: 20, color: 0xe2e8f0, text: '...' })
    addPage(0, this.state.rasaBar, 25); addPage(0, this.state.rasaWidget, 25)

    addPage(0, createWidget(widget.TEXT, { x: 1000, y: 960, w: 390, h: 40, text_size: 18, color: 0x64748b, align_h: align.CENTER_H, text: '▲ Scroll up to change page ▲' }), 0)

    // ==========================================
    // PAGE 1: EXPANDED SYMPTOMS
    // ==========================================
    addPage(1, createWidget(widget.TEXT, { x: 1000, y: 300, w: 390, h: 40, text_size: 26, color: 0xffffff, text: 'Diagnostic Profile' }), 25)
    
    // Gut Wrapper
    addPage(1, createWidget(widget.FILL_RECT, { x: 1000, y: 350, w: 360, h: 260, color: 0x1e3a8a, radius: 12 }), 15)
    this.state.sympGutWidget = createWidget(widget.TEXT, { x: 1000, y: 370, w: 320, h: 220, text_size: 24, color: 0xbfdbfe, text_style: text_style.WRAP, text: '...' })
    addPage(1, this.state.sympGutWidget, 35)

    // Appearance Wrapper
    addPage(1, createWidget(widget.FILL_RECT, { x: 1000, y: 630, w: 360, h: 260, color: 0x172554, radius: 12 }), 15)
    this.state.sympAppWidget = createWidget(widget.TEXT, { x: 1000, y: 650, w: 320, h: 220, text_size: 24, color: 0x93c5fd, text_style: text_style.WRAP, text: '...' })
    addPage(1, this.state.sympAppWidget, 35)

    // Mood Wrapper
    addPage(1, createWidget(widget.FILL_RECT, { x: 1000, y: 910, w: 360, h: 240, color: 0x1e3a8a, radius: 12 }), 15)
    this.state.sympMoodWidget = createWidget(widget.TEXT, { x: 1000, y: 930, w: 320, h: 200, text_size: 24, color: 0xbfdbfe, text_style: text_style.WRAP, text: '...' })
    addPage(1, this.state.sympMoodWidget, 35)

    // Sleep Wrapper
    addPage(1, createWidget(widget.FILL_RECT, { x: 1000, y: 1170, w: 360, h: 240, color: 0x172554, radius: 12 }), 15)
    this.state.sympSleepWidget = createWidget(widget.TEXT, { x: 1000, y: 1190, w: 320, h: 200, text_size: 24, color: 0x93c5fd, text_style: text_style.WRAP, text: '...' })
    addPage(1, this.state.sympSleepWidget, 35)

    // Energy Wrapper
    addPage(1, createWidget(widget.FILL_RECT, { x: 1000, y: 1430, w: 360, h: 240, color: 0x1e3a8a, radius: 12 }), 15)
    this.state.sympEnergyWidget = createWidget(widget.TEXT, { x: 1000, y: 1450, w: 320, h: 200, text_size: 24, color: 0xbfdbfe, text_style: text_style.WRAP, text: '...' })
    addPage(1, this.state.sympEnergyWidget, 35)

    addPage(1, createWidget(widget.TEXT, { x: 1000, y: 1710, w: 390, h: 40, text_size: 18, color: 0x64748b, align_h: align.CENTER_H, text: '▲ Scroll up to change page ▲' }), 0)

    // ==========================================
    // PAGE 2: TO-DO & RITUCHARYA
    // ==========================================
    addPage(2, createWidget(widget.TEXT, { x: 1000, y: 300, w: 390, h: 40, text_size: 26, color: 0x34d399, text: '✅ PRESCRIBED DO\'S' }), 25)
    
    // Food Wrapper
    addPage(2, createWidget(widget.FILL_RECT, { x: 1000, y: 350, w: 360, h: 700, color: 0x022c22, radius: 12 }), 15)
    this.state.todoFoodWidget = createWidget(widget.TEXT, { x: 1000, y: 370, w: 320, h: 660, text_size: 24, color: 0xa7f3d0, text_style: text_style.WRAP, text: '...' })
    addPage(2, this.state.todoFoodWidget, 35)

    // Hydration Wrapper
    addPage(2, createWidget(widget.FILL_RECT, { x: 1000, y: 1070, w: 360, h: 320, color: 0x064e3b, radius: 12 }), 15)
    this.state.todoWaterWidget = createWidget(widget.TEXT, { x: 1000, y: 1090, w: 320, h: 280, text_size: 24, color: 0x6ee7b7, text_style: text_style.WRAP, text: '...' })
    addPage(2, this.state.todoWaterWidget, 35)

    // Yoga Wrapper
    addPage(2, createWidget(widget.FILL_RECT, { x: 1000, y: 1410, w: 360, h: 550, color: 0x047857, radius: 12 }), 15)
    this.state.todoYogaWidget = createWidget(widget.TEXT, { x: 1000, y: 1430, w: 320, h: 510, text_size: 24, color: 0xa7f3d0, text_style: text_style.WRAP, text: '...' })
    addPage(2, this.state.todoYogaWidget, 35)

    // Ritucharya (Seasonal) Wrapper
    addPage(2, createWidget(widget.FILL_RECT, { x: 1000, y: 1980, w: 360, h: 700, color: 0x0f766e, radius: 12 }), 15)
    this.state.todoRituWidget = createWidget(widget.TEXT, { x: 1000, y: 2000, w: 320, h: 660, text_size: 24, color: 0xccfbf1, text_style: text_style.WRAP, text: '...' })
    addPage(2, this.state.todoRituWidget, 35)

    addPage(2, createWidget(widget.TEXT, { x: 1000, y: 2730, w: 390, h: 40, text_size: 18, color: 0x64748b, align_h: align.CENTER_H, text: '▲ Scroll up to change page ▲' }), 0)

    // ==========================================
    // PAGE 3: AVOID
    // ==========================================
    addPage(3, createWidget(widget.TEXT, { x: 1000, y: 300, w: 390, h: 40, text_size: 26, color: 0xf87171, text: '❌ STRICTLY AVOID' }), 25)
    
    // Avoid Food Wrapper
    addPage(3, createWidget(widget.FILL_RECT, { x: 1000, y: 350, w: 360, h: 550, color: 0x450a0a, radius: 12 }), 15)
    this.state.avoidFoodWidget = createWidget(widget.TEXT, { x: 1000, y: 370, w: 320, h: 510, text_size: 24, color: 0xfecaca, text_style: text_style.WRAP, text: '...' })
    addPage(3, this.state.avoidFoodWidget, 35)

    // Avoid Routine Wrapper
    addPage(3, createWidget(widget.FILL_RECT, { x: 1000, y: 920, w: 360, h: 450, color: 0x7f1d1d, radius: 12 }), 15)
    this.state.avoidRoutineWidget = createWidget(widget.TEXT, { x: 1000, y: 940, w: 320, h: 410, text_size: 24, color: 0xfca5a5, text_style: text_style.WRAP, text: '...' })
    addPage(3, this.state.avoidRoutineWidget, 35)

    addPage(3, createWidget(widget.TEXT, { x: 1000, y: 1410, w: 390, h: 40, text_size: 18, color: 0x64748b, align_h: align.CENTER_H, text: '▲ Scroll up to change page ▲' }), 0)

    // Absolute Maximum Scroll Bound
    createWidget(widget.FILL_RECT, { x: 0, y: 2860, w: 390, h: 50, color: 0x000000 })

    this.startHeartRateMonitoring()
  },

  goToPage(idx) {
    this.state.currentPage = idx
    const offset = idx * -390
    
    this.state.pages.forEach((page, pIdx) => {
      const pageBaseX = (pIdx * 390) + offset
      page.forEach(item => item.w.setProperty(prop.X, pageBaseX + item.relX))
    })

    const titles = ['1/4 • Dhatus', '2/4 • Symptoms', '3/4 • To-Do', '4/4 • Avoid']
    this.state.tabTitle.setProperty(prop.TEXT, titles[idx])
  },

  startHeartRateMonitoring() {
    this.state.hrSensor = new HeartRate()
    const callback = () => {
      const hr = this.state.hrSensor.getCurrent()
      if (hr > 0) this.processDoshaSample(hr)
      else this.state.hrValueWidget.setProperty(prop.TEXT, `...`)
    }
    this.state.hrSensor.onCurrentChange(callback)
  },

  processDoshaSample(hr) {
    this.state.hrBuffer.push(hr)
    if (this.state.hrBuffer.length > this.state.requiredSamples) this.state.hrBuffer.shift()
    this.updateUI()
  },

  updateUI() {
    const currentHR = this.state.hrBuffer[this.state.hrBuffer.length - 1]
    this.state.hrValueWidget.setProperty(prop.TEXT, `${currentHR}`)

    let fillRatio = this.state.hrBuffer.length / this.state.requiredSamples
    if (fillRatio > 1) fillRatio = 1 
    this.state.progressWidget.setProperty(prop.W, Math.floor(350 * fillRatio))

    const graphData = this.state.hrBuffer.slice(-this.state.maxGraphSlices)
    const graphBottom = 335

    graphData.forEach((hr, index) => {
      let normalizedHR = (hr - 50) / 70 
      if (normalizedHR < 0) normalizedHR = 0.05
      if (normalizedHR > 1) normalizedHR = 1
      const sliceHeight = Math.floor(65 * normalizedHR)
      this.state.graphSlices[index].setProperty(prop.Y, graphBottom - sliceHeight)
      this.state.graphSlices[index].setProperty(prop.H, sliceHeight)
    })

    if (this.state.hrBuffer.length >= this.state.requiredSamples && !this.state.hasSaved) {
      this.state.hasSaved = true 
      const analysis = this.calculateTridosha()
      
      this.state.badgeText.setProperty(prop.TEXT, analysis.badgeText)
      this.state.badgeBg.setProperty(prop.COLOR, analysis.badgeColor)
      this.state.subtitleText.setProperty(prop.TEXT, analysis.subtitle)
      
      this.state.telemetryText.setProperty(prop.TEXT, analysis.rawTelemetry)
      
      this.state.sympGutWidget.setProperty(prop.TEXT, analysis.s_gut)
      this.state.sympAppWidget.setProperty(prop.TEXT, analysis.s_app)
      this.state.sympMoodWidget.setProperty(prop.TEXT, analysis.s_mood)
      this.state.sympSleepWidget.setProperty(prop.TEXT, analysis.s_sleep)
      this.state.sympEnergyWidget.setProperty(prop.TEXT, analysis.s_energy)
      
      this.state.todoFoodWidget.setProperty(prop.TEXT, analysis.t_food)
      this.state.todoWaterWidget.setProperty(prop.TEXT, analysis.t_water)
      this.state.todoYogaWidget.setProperty(prop.TEXT, analysis.t_yoga)
      this.state.todoRituWidget.setProperty(prop.TEXT, analysis.t_ritu)
      
      this.state.avoidFoodWidget.setProperty(prop.TEXT, analysis.a_food)
      this.state.avoidRoutineWidget.setProperty(prop.TEXT, analysis.a_routine)
      
      this.state.raktaWidget.setProperty(prop.TEXT, `${analysis.raktaScore}% Vitality`)
      this.state.majjaWidget.setProperty(prop.TEXT, `${analysis.majjaScore}% Resilience`)
      this.state.rasaWidget.setProperty(prop.TEXT, `${analysis.rasaScore}% Hydration`)

      this.state.scanWidgets.forEach(w => w.setProperty(prop.X, -1000))
      this.state.headerWidgetsData.forEach(item => item.w.setProperty(prop.X, item.relX))
      
      this.goToPage(0)

      const targetRakta = Math.floor(340 * (analysis.raktaScore / 100))
      const targetMajja = Math.floor(340 * (analysis.majjaScore / 100))
      const targetRasa = Math.floor(340 * (analysis.rasaScore / 100))
      let currentRakta = 0, currentMajja = 0, currentRasa = 0
      
      const animTimer = setInterval(() => {
        let isAnimating = false
        if (currentRakta < targetRakta) { currentRakta = Math.min(currentRakta + 20, targetRakta); this.state.raktaBar.setProperty(prop.W, currentRakta); isAnimating = true }
        if (currentMajja < targetMajja) { currentMajja = Math.min(currentMajja + 20, targetMajja); this.state.majjaBar.setProperty(prop.W, currentMajja); isAnimating = true }
        if (currentRasa < targetRasa) { currentRasa = Math.min(currentRasa + 20, targetRasa); this.state.rasaBar.setProperty(prop.W, currentRasa); isAnimating = true }
        if (!isAnimating) clearInterval(animTimer)
      }, 50)

      setTimeout(() => { this.saveToHistory(analysis) }, 1000)
    }
  },

  saveToHistory(analysis) {
    try {
      const now = new Date()
      const min = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
      const timeStr = `${now.getDate()}/${now.getMonth() + 1} - ${now.getHours()}:${min}`
      
      const logEntry = { time: timeStr, title: analysis.badgeText, hr: Math.round(analysis.avgHR), hrv: analysis.hrv }
      let history = []
      try { const saved = localStorage.getItem('dosha_logs'); if (saved) history = JSON.parse(saved) } catch(e) {}
      if (!Array.isArray(history)) history = []

      history.unshift(logEntry)
      if (history.length > 5) history = history.slice(0, 5)
      localStorage.setItem('dosha_logs', JSON.stringify(history))
    } catch (e) { }
  },

  calculateTridosha() {
    const sum = this.state.hrBuffer.reduce((a, b) => a + b, 0)
    const avgHR = sum / this.state.hrBuffer.length

    let stress = 50, spo2 = 98, steps = 0, sleep = 75
    try { const st = new Stress().getCurrent(); if (st) stress = typeof st === 'object' ? (st.value || 50) : st } catch(e) {}
    try { const ox = new BloodOxygen().getCurrent(); if (ox) spo2 = typeof ox === 'object' ? (ox.value || 98) : ox } catch(e) {}
    try { steps = new Step().getCurrent() || 0 } catch(e) {}
    try { sleep = new Sleep().getInfo()?.score || 75 } catch(e) {}

    const hrv = Math.max(1, Math.min(10, 10 - Math.round(stress / 10)))
    const raktaScore = Math.floor((spo2 * 0.6) + (Math.max(0, 100 - Math.abs(avgHR - 70)) * 0.4))
    const majjaScore = Math.floor(((100 - stress) * 0.6) + (sleep * 0.4))
    const rasaScore = Math.floor((Math.min(steps / 8000, 1) * 100 * 0.4) + (raktaScore * 0.6))

    let vataScore = (stress * 1.5) + ((100 - sleep) * 1.0) + (Math.abs(avgHR - 75) * 0.5)
    let pittaScore = (avgHR > 70 ? (avgHR - 70) * 2.0 : 0) + (spo2 > 96 ? 30 : 0) + (stress * 0.5)
    let kaphaScore = (avgHR < 65 ? (65 - avgHR) * 2.5 : 0) + ((8000 - Math.min(steps, 8000)) / 8000 * 60) + (sleep > 85 ? 20 : 0)

    const doshaArray = [
      { name: "Vata", score: vataScore },
      { name: "Pitta", score: pittaScore },
      { name: "Kapha", score: kaphaScore }
    ].sort((a, b) => b.score - a.score)

    let base = doshaArray[0].name
    let sec = doshaArray[1].name
    let key = ((doshaArray[0].score - doshaArray[1].score) > 40) ? base : `${base}-${sec}`

    const rawTelemetry = 
      `RAW TELEMETRY:\n` +
      `• Pulse: ${Math.round(avgHR)} BPM\n` +
      `• SpO2: ${Math.round(spo2)}%\n` +
      `• Stress: ${Math.round(stress)}/100\n` +
      `• Sleep: ${Math.round(sleep)}/100\n` +
      `• Steps: ${Math.round(steps)}`

    const sympDict = {
      "Vata": {
        gut: "🌪️ GUT:\nHard, dry stools (constipation). Severe bloating, gas, and highly erratic appetite.",
        app: "🦴 APPEARANCE:\nBrittle/frizzy hair. Skin is exceptionally dry. Cracked lips. Cold hands & feet.",
        mood: "🧠 MIND:\nOverthinking, high anxiety, easily overwhelmed. Scattered, racing thoughts.",
        sleep: "🌙 SLEEP:\nVery light, easily disturbed. Often waking between 2 AM - 4 AM.",
        energy: "⚡ ENERGY:\n'Wired but tired'. Joint cracking and general physical stiffness."
      },
      "Pitta": {
        gut: "🔥 GUT:\nAcid reflux, heartburn. Loose, frequent, or urgent bowel movements.",
        app: "👁️ APPEARANCE:\nPremature thinning or graying hair. Skin is flushed, prone to acne, or excessive sweating.",
        mood: "🧠 MIND:\nHighly irritable, sharp, overly competitive. Easily frustrated.",
        sleep: "🌙 SLEEP:\nFalls asleep easily but wakes up feeling hot or actively sweating.",
        energy: "⚡ ENERGY:\nHigh intensity but burns out quickly. Sharp hunger pangs. Inflamed joints."
      },
      "Kapha": {
        gut: "🪨 GUT:\nExtremely slow motility. Heavy, sticky stools. Feeling full hours after eating.",
        app: "💧 APPEARANCE:\nThick, lustrous hair but oily scalp. Skin is smooth but prone to water retention.",
        mood: "🧠 MIND:\nBrain fog, unmotivated, deeply attached or stubborn.",
        sleep: "🌙 SLEEP:\nDeep, heavy, extremely difficult to wake up from. Excessive sleeping.",
        energy: "⚡ ENERGY:\nSevere morning lethargy. Weight gain comes easily, loss is stubborn."
      },
      "Vata-Pitta": {
        gut: "🌪️/🔥 GUT:\nAlternates between acid reflux and severe bloating.",
        app: "🦴/👁️ APPEARANCE:\nDry skin but prone to localized heat rashes.",
        mood: "🧠 MIND:\nAnxious but highly critical of self and others.",
        sleep: "🌙 SLEEP:\nInsomnia driven purely by a racing, overheated mind.",
        energy: "⚡ ENERGY:\nBurnout zone. Pushing yourself too hard while your nervous system is frayed."
      },
      "Pitta-Vata": {
        gut: "🔥/🌪️ GUT:\nSharp hunger that quickly turns to gas if delayed. Acidic indigestion.",
        app: "👁️/🦴 APPEARANCE:\nEarly graying paired with a dry, flaky scalp.",
        mood: "🧠 MIND:\nIntense focus that quickly fractures into anxiety.",
        sleep: "🌙 SLEEP:\nWaking up in the middle of the night feeling hot and restless.",
        energy: "⚡ ENERGY:\nYou have the drive to work, but your energy easily scatters."
      },
      "Vata-Kapha": {
        gut: "🌪️/🪨 GUT:\nSluggish digestion with trapped gas. Irregular stools.",
        app: "🦴/💧 APPEARANCE:\nSkin feels clammy and cold.",
        mood: "🧠 MIND:\nFeeling physically heavy but mentally racing. 'Tired and Wired'.",
        sleep: "🌙 SLEEP:\nDifficulty falling asleep, followed by grogginess upon waking.",
        energy: "⚡ ENERGY:\nLethargic, yet completely unable to relax."
      },
      "Kapha-Vata": {
        gut: "🪨/🌪️ GUT:\nSlow motility resulting in painful bloating. Food sits like a rock.",
        app: "💧/🦴 APPEARANCE:\nProne to water retention, especially under the eyes.",
        mood: "🧠 MIND:\nConstant low-grade anxiety mixed with stubbornness.",
        sleep: "🌙 SLEEP:\nSleeps long hours but wakes up feeling ungrounded.",
        energy: "⚡ ENERGY:\nGrounded physical state but misfiring nervous system."
      },
      "Pitta-Kapha": {
        gut: "🔥/🪨 GUT:\nVery strong digestion. Can eat heavy foods without issue.",
        app: "👁️/💧 APPEARANCE:\nExcellent skin elasticity but prone to heavy sweating.",
        mood: "🧠 MIND:\nHighly confident, grounded, and intensely focused.",
        sleep: "🌙 SLEEP:\nDeep, restorative sleep.",
        energy: "⚡ ENERGY:\nAn absolute powerhouse. High metabolic fire anchored by massive physical endurance."
      },
      "Kapha-Pitta": {
        gut: "🪨/🔥 GUT:\nConsistent digestion unless overfed. Prone to heartburn if eating late.",
        app: "💧/👁️ APPEARANCE:\nStrong, thick hair. Oily T-zone.",
        mood: "🧠 MIND:\nCalm baseline, capable of executing complex tasks without stress.",
        sleep: "🌙 SLEEP:\nSleeps well, slightly heavy in the morning.",
        energy: "⚡ ENERGY:\nImmense stamina, but must actively push to avoid slipping into lethargy."
      },
      "Mixed": {
        gut: "⚖️ GUT:\nRegular bowel movements. No bloating or acidity.",
        app: "⚖️ APPEARANCE:\nBalanced—neither overly dry nor oily.",
        mood: "⚖️ MIND:\nCalm, focused, and highly adaptable to stress.",
        sleep: "⚖️ SLEEP:\nPerfect equilibrium. Wakes up refreshed.",
        energy: "⚖️ ENERGY:\nSustains consistent, steady energy throughout the entire day."
      }
    }

    const advice = {
      "Vata": { 
        t_food: "🌾 GRAINS: Cooked oats, basmati rice, quinoa. Serve warm with generous ghee.\n\n🥦 VEGGIES: Root veg (sweet potatoes, carrots). Must be well-cooked & spiced.\n\n🍎 FRUITS: Sweet, heavy fruits (bananas, avocados, soaked dates).\n\n🥛 DAIRY: 1 cup warm milk with nutmeg 30 mins before bed. Fresh paneer.", 
        t_water: "💧 HYDRATION: Sip warm/hot water exclusively all day.\n\n⏳ TIMING: Eat 3 meals at strict, exact intervals. Heavy lunch, light dinner by 7 PM.",
        t_yoga: "🏃 EXERCISE: Mild only. Yin yoga, walking, or Tai Chi.\n\n🧘 ASANA: Paschimottanasana (Seated Forward Bend) & Balasana (Child's Pose).\n\n🌬️ PRANAYAMA: Nadi Shodhana (Alternate Nostril) 5 mins before bed.",
        a_food: "🌾 GRAINS: Dry crackers, rice cakes, rye, corn.\n\n🥦 VEGGIES: Absolutely no raw salads. Avoid raw broccoli and raw onions.\n\n🍎 FRUITS: Dried fruits (unless soaked), watermelon.\n\n🥛 DAIRY: Cold milk straight from the fridge, ice cream.",
        a_routine: "⏳ LIFESTYLE: Fasting or skipping meals is forbidden. Do not eat while walking/working.\n\n🏃 EXERCISE: No HIIT, heavy weightlifting, or long-distance running.\n\n☕ STIMULANTS: Zero caffeine after 12 PM."
      },
      "Pitta": { 
        t_food: "🌾 GRAINS: Barley, oats, basmati rice, wheat. Serve room temperature.\n\n🥦 VEGGIES: Sweet/bitter greens, cucumber, asparagus, zucchini.\n\n🍎 FRUITS: Melons, sweet grapes, pomegranates, sweet apples.\n\n🥛 DAIRY: Unsalted butter, ghee, and fresh milk are highly beneficial.", 
        t_water: "💧 HYDRATION: Drink plenty of room-temperature or cool water (coconut water).\n\n⏳ TIMING: Eat immediately when hungry. Never skip lunch.",
        t_yoga: "🏃 EXERCISE: Moderate workouts only in the early morning or evening.\n\n🧘 ASANA: Ardha Matsyendrasana (Spinal Twist) to wring out liver heat.\n\n🌬️ PRANAYAMA: Sheetali (Cooling Breath through rolled tongue).",
        a_food: "🌾 GRAINS: Buckwheat, corn, rye (too heating).\n\n🥦 VEGGIES: Nightshades (tomatoes, eggplant). Strictly avoid raw onions, garlic, and chilies.\n\n🍎 FRUITS: Sour citrus (lemons/grapefruit), sour berries.\n\n🥛 DAIRY: Sour yogurt, kefir, aged hard cheeses.",
        a_routine: "⏳ LIFESTYLE: Delayed meals causing 'hanger'. Overworking into burnout.\n\n🏃 EXERCISE: Do not workout in the midday sun. Avoid highly competitive games today.\n\n☕ STIMULANTS: No alcohol or black coffee."
      },
      "Kapha": { 
        t_food: "🌾 GRAINS: Barley, buckwheat, millet, rye (light and dry grains).\n\n🥦 VEGGIES: Pungent/bitter veg (broccoli, cauliflower, bitter gourd, celery).\n\n🍎 FRUITS: Astringent/light fruits (apples, pears, berries).\n\n🥛 DAIRY: Diluted warm spiced buttermilk (Takra) only.", 
        t_water: "💧 HYDRATION: Sip hot ginger water all day.\n\n⏳ TIMING: Fast overnight for 12-14 hours. 2 meals a day (10 AM & 5 PM) is ideal.",
        t_yoga: "🏃 EXERCISE: Intense, heavy, sweat-inducing cardio. Push yourself hard.\n\n🧘 ASANA: Vigorous Surya Namaskar (Sun Salutations) & Ustrasana (Camel Pose).\n\n🌬️ PRANAYAMA: Bhastrika (Bellows Breath) to generate internal heat.",
        a_food: "🌾 GRAINS: Heavy wheat, sticky white rice, refined pasta/breads.\n\n🥦 VEGGIES: Heavy root vegetables, sweet potatoes, excess avocado.\n\n🍎 FRUITS: Bananas, melons, dates, heavy sweet fruits.\n\n🥛 DAIRY: Strictly avoid all cheese, cold milk, yogurt, and heavy creams.",
        a_routine: "⏳ LIFESTYLE: Daytime napping is strictly forbidden. Avoid sedentary sitting immediately after meals.\n\n⏳ TIMING: Snacking between meals. Do not eat any heavy meals after 6:00 PM."
      },
      "Mixed": { 
        t_food: "🌾 GRAINS: Balanced mix of rice, oats, wheat.\n\n🥦 VEGGIES: Seasonal, local veggies.\n\n🍎 FRUITS: Fresh seasonal fruits.\n\n🥛 DAIRY: Moderate ghee and warm milk.", 
        t_water: "💧 HYDRATION: Room temp water based on natural thirst.\n\n⏳ TIMING: Maintain regular, consistent meal times.",
        t_yoga: "🏃 EXERCISE: Maintain your normal workout routine.\n\n🧘 ASANA: Balanced Hatha flow.\n\n🌬️ PRANAYAMA: Anulom Vilom to maintain perfect equilibrium.",
        a_food: "🌾 GRAINS: Over-processed or stale grains.\n\n🥦 VEGGIES: Heavily preserved or canned veggies.\n\n🍎 FRUITS: Sugary fruit juices.\n\n🥛 DAIRY: Excessive cold dairy.",
        a_routine: "⏳ LIFESTYLE: Extreme fad diets or sudden changes in your daily schedule.\n\n🏃 EXERCISE: Don't push into exhaustion just because you feel good."
      }
    }
    
    const month = new Date().getMonth()
    let rituStr = ""
    if (month === 0 || month === 1) { rituStr = "☀️ RITU: Shishira (Late Winter)\n\n• FOCUS: Kapha accumulation.\n\n• DIET: Body needs rich, warm nourishment. Eat sweet, sour, and salty foods. Keep digestive fire strong.\n\n• LIFESTYLE: Avoid cold drinks and heavy wind exposure. Keep head and ears covered." }
    else if (month === 2 || month === 3) { rituStr = "🌸 RITU: Vasanta (Spring)\n\n• FOCUS: Kapha aggravation.\n\n• DIET: Favor bitter, astringent, and pungent foods to clear mucus. Avoid heavy, oily, sweet, or sour foods.\n\n• LIFESTYLE: Vigorous exercise is crucial now to melt accumulated winter Kapha. Dry massage is highly beneficial." }
    else if (month === 4 || month === 5) { rituStr = "🔥 RITU: Grishma (Summer)\n\n• FOCUS: Vata accumulation, Pitta aggravation.\n\n• DIET: Eat sweet, light, cold, liquid-heavy foods (melons, cucumbers, coconut water). Avoid spicy, pungent, and sour foods.\n\n• LIFESTYLE: Rest in cool places. Avoid strenuous midday exercise. A brief daytime nap is permitted." }
    else if (month === 6 || month === 7) { rituStr = "🌧️ RITU: Varsha (Monsoon)\n\n• FOCUS: Vata aggravation.\n\n• DIET: Digestion is weakest now. Eat warm, light, easily digestible food. Favor sour, salty, and a little oil to pacify Vata.\n\n• LIFESTYLE: Avoid sleeping during the day. Do not walk barefoot in damp soil." }
    else if (month === 8 || month === 9) { rituStr = "🍂 RITU: Sharad (Autumn)\n\n• FOCUS: Pitta aggravation.\n\n• DIET: Favor sweet, bitter, and cold foods to clear excess summer heat from the blood. Ghee is excellent now.\n\n• LIFESTYLE: Avoid excessive sun exposure. Spend time under the moonlight (Moon Bathing)." }
    else { rituStr = "❄️ RITU: Hemanta (Early Winter)\n\n• FOCUS: Vata pacification.\n\n• DIET: Digestion is naturally strongest now. Eat heavy, sweet, sour, salty, and nourishing foods.\n\n• LIFESTYLE: Warm oil massage (Abhyanga) is highly recommended. Stay indoors during extreme cold." }

    const getAdvice = (key) => advice[key] || advice[base] || advice["Mixed"]

    let returnObj = { 
      avgHR, hrv, raktaScore, majjaScore, rasaScore, rawTelemetry, badgeText: "", subtitle: "", badgeColor: 0x000, 
      s_gut: "", s_app: "", s_mood: "", s_sleep: "", s_energy: "", 
      t_food: "", t_water: "", t_yoga: "", t_ritu: rituStr, a_food: "", a_routine: "" 
    }

    if (Math.abs(doshaArray[0].score - doshaArray[1].score) < 10 && Math.abs(doshaArray[1].score - doshaArray[2].score) < 10) {
      returnObj.badgeText = "TRIDOSHIC"
      returnObj.subtitle = "Sama-Dosha: Perfect equilibrium. Stress, SpO2, and HR are neutralizing each other."
      returnObj.badgeColor = 0xeab308
      
      const mixSymp = sympDict["Mixed"]
      returnObj.s_gut = mixSymp.gut; returnObj.s_app = mixSymp.app; returnObj.s_mood = mixSymp.mood; returnObj.s_sleep = mixSymp.sleep; returnObj.s_energy = mixSymp.energy;
      
      const adv = getAdvice("Mixed")
      returnObj.t_food = adv.t_food; returnObj.t_water = adv.t_water; returnObj.t_yoga = adv.t_yoga;
      returnObj.a_food = adv.a_food; returnObj.a_routine = adv.a_routine;
      return returnObj
    }

    const profiles = {
      "Vata-Pitta": `Dvandvaja: Vata-Pitta.\nHigh systemic stress fueling intense Pitta metabolism. Nervous system is frayed but metabolic fire is hot.`,
      "Pitta-Vata": `Dvandvaja: Pitta-Vata.\nStrong cardiovascular drive fractured by high autonomic stress. Drive is high, but energy is scattered.`,
      "Vata-Kapha": `Dvandvaja: Vata-Kapha.\nLow movement masked by high nervous system stress. Feeling physically heavy but mentally racing.`,
      "Kapha-Vata": `Dvandvaja: Kapha-Vata.\nA grounded, sluggish physical state interrupted by nervous system misfires. Need gentle, sustained movement.`,
      "Pitta-Kapha": `Dvandvaja: Pitta-Kapha.\nAn absolute powerhouse. Intense metabolic drive anchored by solid physical endurance. Primed for peak performance.`,
      "Kapha-Pitta": `Dvandvaja: Kapha-Pitta.\nCalm Kapha baseline driven by strong metabolic potential. Immense stamina, but must actively push to avoid lethargy.`
    }

    const ekaDetails = {
      "Vata": `Eka-Dosha: Pure Vata.\nSystemic stress dominates. Autonomic nervous system is over-sensitized. Erratic telemetry driven by lack of deep rest.`,
      "Pitta": `Eka-Dosha: Pure Pitta.\nMetabolic fire peaking. Cardiovascular system running at high intensity with excellent oxygenation. Prone to immediate burnout.`,
      "Kapha": `Eka-Dosha: Pure Kapha.\nPhysical lethargy completely dominating. Cardiovascular drive is very low. Systemic movement (Rasa flow) has stagnated.`
    }

    if (key.includes('Vata')) returnObj.badgeColor = 0x6366f1
    if (key.includes('Pitta')) returnObj.badgeColor = 0xef4444
    if (key.includes('Kapha')) returnObj.badgeColor = 0x10b981
    if (key === 'Vata-Pitta' || key === 'Pitta-Vata') returnObj.badgeColor = 0xd946ef
    if (key === 'Pitta-Kapha' || key === 'Kapha-Pitta') returnObj.badgeColor = 0xf59e0b
    if (key === 'Vata-Kapha' || key === 'Kapha-Vata') returnObj.badgeColor = 0x06b6d4

    if (key === base) {
      returnObj.badgeText = `PURE ${base.toUpperCase()}`
      returnObj.subtitle = ekaDetails[base]
    } else {
      returnObj.badgeText = key.toUpperCase()
      returnObj.subtitle = profiles[key]
    }
    
    const finalSymp = sympDict[key] || sympDict[base]
    returnObj.s_gut = finalSymp.gut
    returnObj.s_app = finalSymp.app
    returnObj.s_mood = finalSymp.mood
    returnObj.s_sleep = finalSymp.sleep
    returnObj.s_energy = finalSymp.energy
    
    const finalAdv = getAdvice(key)
    returnObj.t_food = finalAdv.t_food
    returnObj.t_water = finalAdv.t_water
    returnObj.t_yoga = finalAdv.t_yoga
    returnObj.a_food = finalAdv.a_food
    returnObj.a_routine = finalAdv.a_routine
    
    return returnObj
  },

  onDestroy() {
    if (this.state.hrSensor) {
      this.state.hrSensor.offCurrentChange()
    }
  }
})