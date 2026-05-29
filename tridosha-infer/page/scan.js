import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { HeartRate } from '@zos/sensor'
import { localStorage } from '@zos/storage'
import { showToast } from '@zos/interaction'

Page({
  state: {
    hrSensor: null, hrBuffer: [], requiredSamples: 60, maxGraphSlices: 35, hasSaved: false,
    hrValueWidget: null, hrvValueWidget: null, progressWidget: null, doshaMainWidget: null,
    doshaDetailWidget: null, symptomWidget: null, todoWidget: null, avoidWidget: null, graphSlices: [],
    raktaWidget: null, majjaWidget: null, rasaWidget: null,
    raktaBar: null, majjaBar: null, rasaBar: null
  },

  onInit(params) {
    this.state.requiredSamples = parseInt(params) || 60
  },

  build() {
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: 390, h: 65, color: 0x0f172a }) 
    createWidget(widget.TEXT, { x: 0, y: 15, w: 390, h: 40, color: 0x00ffcc, text_size: 26, align_h: align.CENTER_H, text: 'Scanning...' })

    createWidget(widget.FILL_RECT, { x: 20, y: 80, w: 165, h: 100, color: 0x1e293b, radius: 16 })
    createWidget(widget.TEXT, { x: 20, y: 90, w: 165, h: 30, color: 0x94a3b8, text_size: 18, align_h: align.CENTER_H, text: 'PULSE' })
    this.state.hrValueWidget = createWidget(widget.TEXT, { x: 20, y: 120, w: 165, h: 50, color: 0xff3366, text_size: 42, align_h: align.CENTER_H, text: '--' })

    createWidget(widget.FILL_RECT, { x: 205, y: 80, w: 165, h: 100, color: 0x1e293b, radius: 16 })
    createWidget(widget.TEXT, { x: 205, y: 90, w: 165, h: 30, color: 0x94a3b8, text_size: 18, align_h: align.CENTER_H, text: 'HRV' })
    this.state.hrvValueWidget = createWidget(widget.TEXT, { x: 205, y: 120, w: 165, h: 50, color: 0x38bdf8, text_size: 42, align_h: align.CENTER_H, text: '--' })

    for (let i = 0; i < this.state.maxGraphSlices; i++) {
      const slice = createWidget(widget.FILL_RECT, { x: 20 + (i * 10), y: 280, w: 10, h: 0, color: 0xff3366 })
      this.state.graphSlices.push(slice)
    }

    createWidget(widget.FILL_RECT, { x: 20, y: 295, w: 350, h: 6, color: 0x333333, radius: 3 })
    this.state.progressWidget = createWidget(widget.FILL_RECT, { x: 20, y: 295, w: 0, h: 6, color: 0x00ffcc, radius: 3 })

    this.state.doshaMainWidget = createWidget(widget.TEXT, { x: 20, y: 315, w: 350, h: 100, color: 0x00ffcc, text_size: 26, align_h: align.CENTER_H, text_style: text_style.WRAP, text: 'Relax your wrist.\nReading baseline...' })
    createWidget(widget.TEXT, { x: 0, y: 405, w: 390, h: 40, color: 0x64748b, text_size: 18, align_h: align.CENTER_H, text: '▼ Swipe Down ▼' })

    createWidget(widget.TEXT, { x: 0, y: 460, w: 390, h: 40, color: 0xffffff, text_size: 28, align_h: align.CENTER_H, text: 'Understanding HRV' })
    createWidget(widget.FILL_RECT, { x: 145, y: 505, w: 100, h: 3, color: 0x38bdf8, radius: 2 })
    createWidget(widget.FILL_RECT, { x: 20, y: 525, w: 350, h: 250, color: 0x1e293b, radius: 12 }) 
    createWidget(widget.TEXT, { x: 30, y: 540, w: 330, h: 230, color: 0x94a3b8, text_size: 18, text_style: text_style.WRAP, text: 'HRV tracks cardiovascular adaptability (1-10 Scale):\n\n• High (7-10): Deeply relaxed, parasympathetic state.\n• Optimal (4-6): Balanced, resilient, ready to perform.\n• Low (1-3): Physical stress, fatigue, or sympathetic (fight/flight) dominance.' })

    createWidget(widget.TEXT, { x: 0, y: 800, w: 390, h: 40, color: 0xffffff, text_size: 28, align_h: align.CENTER_H, text: 'Clinical Analysis' })
    createWidget(widget.FILL_RECT, { x: 145, y: 845, w: 100, h: 3, color: 0x00ffcc, radius: 2 })
    this.state.doshaDetailWidget = createWidget(widget.TEXT, { x: 25, y: 880, w: 340, h: 320, color: 0xe2e8f0, text_size: 22, align_h: align.CENTER_H, text_style: text_style.WRAP, text: `Waiting for ${this.state.requiredSamples}-second pulse data...` })

    createWidget(widget.TEXT, { x: 0, y: 1230, w: 390, h: 40, color: 0xffffff, text_size: 28, align_h: align.CENTER_H, text: 'Tissue Health (Dhatus)' })
    createWidget(widget.FILL_RECT, { x: 145, y: 1275, w: 100, h: 3, color: 0x8b5cf6, radius: 2 })
    
    createWidget(widget.TEXT, { x: 25, y: 1310, w: 340, h: 30, color: 0x94a3b8, text_size: 20, text: 'Rakta (Cardio/Blood)' })
    createWidget(widget.FILL_RECT, { x: 25, y: 1345, w: 340, h: 12, color: 0x334155, radius: 6 })
    this.state.raktaBar = createWidget(widget.FILL_RECT, { x: 25, y: 1345, w: 0, h: 12, color: 0xff3366, radius: 6 })
    this.state.raktaWidget = createWidget(widget.TEXT, { x: 25, y: 1365, w: 340, h: 30, color: 0xe2e8f0, text_size: 16, text: 'Calculating...' })

    createWidget(widget.TEXT, { x: 25, y: 1410, w: 340, h: 30, color: 0x94a3b8, text_size: 20, text: 'Majja (Nervous System)' })
    createWidget(widget.FILL_RECT, { x: 25, y: 1445, w: 340, h: 12, color: 0x334155, radius: 6 })
    this.state.majjaBar = createWidget(widget.FILL_RECT, { x: 25, y: 1445, w: 0, h: 12, color: 0x38bdf8, radius: 6 })
    this.state.majjaWidget = createWidget(widget.TEXT, { x: 25, y: 1465, w: 340, h: 30, color: 0xe2e8f0, text_size: 16, text: 'Calculating...' })

    createWidget(widget.TEXT, { x: 25, y: 1510, w: 340, h: 30, color: 0x94a3b8, text_size: 20, text: 'Rasa (Plasma/Lymph)' })
    createWidget(widget.FILL_RECT, { x: 25, y: 1545, w: 340, h: 12, color: 0x334155, radius: 6 })
    this.state.rasaBar = createWidget(widget.FILL_RECT, { x: 25, y: 1545, w: 0, h: 12, color: 0x00ffcc, radius: 6 })
    this.state.rasaWidget = createWidget(widget.TEXT, { x: 25, y: 1565, w: 340, h: 30, color: 0xe2e8f0, text_size: 16, text: 'Calculating...' })

    createWidget(widget.TEXT, { x: 0, y: 1640, w: 390, h: 40, color: 0xffffff, text_size: 28, align_h: align.CENTER_H, text: 'Current Symptoms' })
    createWidget(widget.FILL_RECT, { x: 145, y: 1685, w: 100, h: 3, color: 0x38bdf8, radius: 2 })
    createWidget(widget.FILL_RECT, { x: 15, y: 1710, w: 360, h: 340, color: 0x1e3a8a, radius: 12 }) 
    this.state.symptomWidget = createWidget(widget.TEXT, { x: 25, y: 1725, w: 340, h: 310, color: 0xbfdbfe, text_size: 20, text_style: text_style.WRAP, text: 'Symptom breakdown will appear after scan.' })

    createWidget(widget.TEXT, { x: 0, y: 2090, w: 390, h: 40, color: 0xffffff, text_size: 28, align_h: align.CENTER_H, text: 'Prescribed Routine' })
    createWidget(widget.FILL_RECT, { x: 15, y: 2150, w: 360, h: 320, color: 0x064e3b, radius: 12 }) 
    this.state.todoWidget = createWidget(widget.TEXT, { x: 25, y: 2165, w: 340, h: 290, color: 0xa7f3d0, text_size: 20, text_style: text_style.WRAP, text: '✅ TO-DO:\nWill appear after reading.' })
    
    createWidget(widget.FILL_RECT, { x: 15, y: 2490, w: 360, h: 320, color: 0x7f1d1d, radius: 12 }) 
    this.state.avoidWidget = createWidget(widget.TEXT, { x: 25, y: 2505, w: 340, h: 290, color: 0xfecaca, text_size: 20, text_style: text_style.WRAP, text: '❌ AVOID:\nWill appear after reading.' })

    createWidget(widget.FILL_RECT, { x: 0, y: 2850, w: 390, h: 20, color: 0x000000 })

    this.startHeartRateMonitoring()
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
    const graphBottom = 280

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
      
      this.state.hrvValueWidget.setProperty(prop.TEXT, `${analysis.hrv}`)
      this.state.doshaMainWidget.setProperty(prop.TEXT, analysis.title)
      this.state.doshaDetailWidget.setProperty(prop.TEXT, analysis.detail)
      
      this.state.raktaBar.setProperty(prop.W, Math.floor(340 * (analysis.raktaScore / 100)))
      this.state.raktaWidget.setProperty(prop.TEXT, `${analysis.raktaScore}% Vitality`)
      
      this.state.majjaBar.setProperty(prop.W, Math.floor(340 * (analysis.majjaScore / 100)))
      this.state.majjaWidget.setProperty(prop.TEXT, `${analysis.majjaScore}% Resilience`)
      
      this.state.rasaBar.setProperty(prop.W, Math.floor(340 * (analysis.rasaScore / 100)))
      this.state.rasaWidget.setProperty(prop.TEXT, `${analysis.rasaScore}% Hydration/Flow`)

      this.state.symptomWidget.setProperty(prop.TEXT, analysis.symptoms)
      this.state.todoWidget.setProperty(prop.TEXT, `✅ RECOMMENDED:\n\n${analysis.todos}`)
      this.state.avoidWidget.setProperty(prop.TEXT, `❌ PLEASE AVOID:\n\n${analysis.avoids}`)
      
      this.saveToHistory(analysis)
    }
  },

  saveToHistory(analysis) {
    try {
      const now = new Date()
      const d = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
      const m = (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
      const h = now.getHours() < 10 ? '0' + now.getHours() : now.getHours()
      const min = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
      
      const cleanTitle = String(analysis.title).replace(/\n/g, ' ').replace(/\|/g, '').replace(/\s+/g, ' ').trim()
      const uiString = `[ ${d}/${m} - ${h}:${min} ]\n◈ ${cleanTitle}\nPulse: ${Math.round(analysis.avgHR)} | HRV: ${analysis.hrv}`

      let history = []
      for (let i = 0; i < 5; i++) {
        try {
          const val = localStorage.getItem('t_log_' + i)
          if (val && typeof val === 'string' && val.length > 5) history.push(val)
        } catch(e) {}
      }

      history.unshift(uiString)
      if (history.length > 5) history.pop()

      for (let i = 0; i < history.length; i++) {
        try { localStorage.setItem('t_log_' + i, history[i]) } catch(e) {}
      }
      showToast({ content: "Data Saved!" })
    } catch (e) {}
  },

  calculateTridosha() {
    const sum = this.state.hrBuffer.reduce((a, b) => a + b, 0)
    const avgHR = sum / this.state.hrBuffer.length

    let sumSquares = 0
    let validDiffs = 0
    for (let i = 1; i < this.state.hrBuffer.length; i++) {
      const diff = this.state.hrBuffer[i] - this.state.hrBuffer[i-1]
      if (Math.abs(diff) < 25) { 
        sumSquares += (diff * diff)
        validDiffs++
      }
    }
    const hrv = validDiffs > 0 ? Math.round(Math.sqrt(sumSquares / validDiffs)) : 0

    const raktaScore = Math.floor(Math.max(0, 100 - Math.abs(avgHR - 68) * 1.5))
    const majjaScore = Math.floor(Math.min(100, (hrv / 5) * 100))
    const rasaScore = Math.floor(Math.min(100, (raktaScore * 0.7) + (majjaScore * 0.3)))

    let base = avgHR < 65 ? "Kapha" : (avgHR <= 80 ? "Pitta" : "Vata")
    let sec = hrv < 3 ? "Vata" : (hrv <= 6 ? "Pitta" : "Kapha")

    const sympDict = {
      "Vata": "* DIGESTION: Highly irregular. Prone to severe bloating, gas, and sudden crashes in appetite.\n\n* SLEEP: Extremely light. You likely wake up frequently in the middle of the night.\n\n* PHYSICAL: Noticeably cold hands and feet. Dry or rough skin, and joints that crack.",
      "Pitta": "* DIGESTION: Strong metabolic fire. Sharp hunger; may suffer from acid reflux if meals are delayed.\n\n* SLEEP: Generally uninterrupted, but you may wake up feeling hot or sweating.\n\n* PHYSICAL: Skin feels warm. Prone to inflammation, rashes, or early graying of hair.",
      "Kapha": "* DIGESTION: Very slow and heavy. You can skip meals but tend to feel sluggish after eating.\n\n* SLEEP: Deep, heavy, and difficult to wake from. You often feel groggy in the morning.\n\n* PHYSICAL: Smooth skin. Strong, stable joints and a propensity to easily gain physical mass.",
      "Mixed": "* DIGESTION: Fluctuates based on stress levels. Alternates between strong fire and sluggishness.\n\n* SLEEP: Variable patterns. You may fall asleep easily but wake up feeling ungrounded.\n\n* PHYSICAL: A highly adaptable body system that shows signs of stress only when pushed."
    }

    const advice = {
      "Vata": { t: "1. Prioritize warm, heavy root vegetables.\n2. Enforce a rigid bedtime.\n3. Practice slow yoga.\n4. Warm sesame oil massage.\n5. Sip warm water continuously.", a: "1. Ice cold beverages or raw salads.\n2. Erratic schedules.\n3. High-intensity cardio.\n4. Heavy caffeine.\n5. Fasting for prolonged periods." },
      "Pitta": { t: "1. Favor cooling foods like cucumber.\n2. 10 mins daily meditation.\n3. Cooling exercises like swimming.\n4. Walk barefoot in nature.\n5. Keep bedroom cool.", a: "1. Spicy, overly sour, or fried foods.\n2. Direct midday sunlight.\n3. Overworking into burnout.\n4. Alcohol or fermented drinks.\n5. Heated debates." },
      "Kapha": { t: "1. Use warming spices (ginger/pepper).\n2. Vigorous, sweat-inducing cardio.\n3. Wake up before sunrise.\n4. Eat light, warm, dry foods.\n5. Seek stimulating environments.", a: "1. Taking daytime naps.\n2. Heavy dairy and cold sweets.\n3. A sedentary routine.\n4. Heavy meals after 6 PM.\n5. Clinging to emotional attachments." },
      "Mixed": { t: "1. Balanced, seasonal whole foods.\n2. Alternate workouts & rest.\n3. Consistent morning routine.\n4. Room-temp herbal teas.\n5. Listen to energy limits.", a: "1. Extreme fad diets.\n2. Ignoring exhaustion to work.\n3. Excessive sugar/caffeine.\n4. Constantly shifting schedule.\n5. Suppressing hunger/sleep." }
    }

    let returnObj = { avgHR, hrv, raktaScore, majjaScore, rasaScore, title: "", detail: "", symptoms: "", todos: "", avoids: "" }

    if (avgHR >= 70 && avgHR <= 75 && hrv >= 3 && hrv <= 4) {
      returnObj.title = "Sama-Dosha\n(Tridoshic)"
      returnObj.detail = "State of 'Sama-Dosha'—a rare and perfect equilibrium. Air, Fire, and Earth are balanced."
      returnObj.symptoms = sympDict["Mixed"]
      returnObj.todos = advice["Mixed"].t
      returnObj.avoids = advice["Mixed"].a
      return returnObj
    }

    const details = {
      "Vata": "Eka-Dosha: Pure Vata.\n\nDominated by Air and Ether. Fast, variable pulse.\n\nEmotionally creative. Biologically, nervous system is over-sensitized. Burning energy erratically.",
      "Pitta": "Eka-Dosha: Pure Pitta.\n\nGoverned by Fire and Water. Pulse is strong, rhythmic.\n\nImmense drive and metabolic fire. Prone to burnout and irritability if overheated.",
      "Kapha": "Eka-Dosha: Pure Kapha.\n\nRuled by Earth and Water. Pulse is slow, deep, stable.\n\nImmense physical endurance. Needs stimulation to avoid lethargy."
    }

    const profiles = {
      "Vata-Pitta": "Dvandvaja: Vata-Pitta.\n\nRunning hot and fast. Erratic Vata base fueled by intense Pitta drive. Wired and tired.",
      "Pitta-Vata": "Dvandvaja: Pitta-Vata.\n\nFocused Pitta baseline but fractured energy due to Vata. Scattered focus. Ground yourself.",
      "Vata-Kapha": "Dvandvaja: Vata-Kapha.\n\nHeavy Kapha base masked by erratic Vata beats. Tired but wired energy.",
      "Kapha-Vata": "Dvandvaja: Kapha-Vata.\n\nGrounded base interrupted by erratic Vata bursts. Misfiring nervous system.",
      "Pitta-Kapha": "Dvandvaja: Pitta-Kapha.\n\nAn absolute powerhouse. Intense Pitta drive anchored by Kapha endurance.",
      "Kapha-Pitta": "Dvandvaja: Kapha-Pitta.\n\nCalm Kapha baseline driven by strong Pitta beats under load. Be careful not to burn out reserves."
    }

    if (base === sec) {
      returnObj.title = `Eka-Dosha:\nPure ${base}`
      returnObj.detail = details[base]
      returnObj.symptoms = sympDict[base]
      returnObj.todos = advice[base].t
      returnObj.avoids = advice[base].a
    } else {
      const combo = `${base}-${sec}`
      const dominant = base === "Vata" || sec === "Vata" ? "Vata" : "Pitta"
      const adviceKey = advice[combo] ? combo : "Mixed"
      
      returnObj.title = `Dvandvaja:\n${combo}`
      returnObj.detail = profiles[combo]
      returnObj.symptoms = sympDict[dominant]
      returnObj.todos = advice[adviceKey].t
      returnObj.avoids = advice[adviceKey].a
    }
    
    return returnObj
  },

  onDestroy() {
    if (this.state.hrSensor) {
      this.state.hrSensor.offCurrentChange()
    }
  }
})