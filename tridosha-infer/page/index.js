import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { HeartRate } from '@zos/sensor'

Page({
  state: {
    hrSensor: null,
    hrBuffer: [],
    maxSamples: 15,       // Width of our graph
    hrValueWidget: null,
    doshaWidget: null,
    progressWidget: null,
    graphDots: []         // Array to hold our plot line dots
  },

  build() {
    // 1. App Title
    createWidget(widget.TEXT, {
      x: 0, y: 30, w: 390, h: 40,
      color: 0xffffff, text_size: 22,
      align_h: align.CENTER_H,
      text: 'Tridosha Monitor'
    })

    // 2. Real-time HR Value
    this.state.hrValueWidget = createWidget(widget.TEXT, {
      x: 0, y: 70, w: 390, h: 50,
      color: 0xff1a1a, text_size: 40,
      align_h: align.CENTER_H,
      text: '-- BPM'
    })

    // 3. Progress Bar Background (Dark Grey)
    createWidget(widget.FILL_RECT, {
      x: 20, y: 135, w: 350, h: 8,
      color: 0x333333, radius: 4
    })

    // 4. Progress Bar Fill (Starts at 0 width)
    this.state.progressWidget = createWidget(widget.FILL_RECT, {
      x: 20, y: 135, w: 0, h: 8,
      color: 0x00ffcc, radius: 4
    })

    // 5. Initialize Graph Plot "Line" (15 invisible dots waiting for data)
    for (let i = 0; i < this.state.maxSamples; i++) {
      const dot = createWidget(widget.FILL_RECT, {
        x: 20 + (i * 23), // Space them evenly across 350px
        y: 200,           // Default hidden position
        w: 6, h: 6,       // Small square
        color: 0xff0000,  // Red plot line color
        radius: 3         // Makes it a circle
      })
      // Hide them initially
      dot.setProperty(prop.VISIBILITY, false)
      this.state.graphDots.push(dot)
    }

    // 6. Dosha Readout Box
    this.state.doshaWidget = createWidget(widget.TEXT, {
      x: 20, y: 250, w: 350, h: 180,
      color: 0x00ffcc, text_size: 18,
      align_h: align.CENTER_H,
      text_style: text_style.WRAP,
      text: 'Calibrating...\nWaiting for pulse.'
    })

    this.startHeartRateMonitoring()
  },

  startHeartRateMonitoring() {
    this.state.hrSensor = new HeartRate()
    
    const callback = () => {
      const hr = this.state.hrSensor.getCurrent()
      
      if (hr > 0) {
        this.state.hrValueWidget.setProperty(prop.TEXT, `${hr} BPM`)
        this.processDoshaSample(hr)
      } else {
        this.state.hrValueWidget.setProperty(prop.TEXT, `Reading...`)
      }
    }

    this.state.hrSensor.onCurrentChange(callback)
  },

  processDoshaSample(hr) {
    this.state.hrBuffer.push(hr)
    
    if (this.state.hrBuffer.length > this.state.maxSamples) {
      this.state.hrBuffer.shift()
    }

    // Update the visual components
    this.updateProgressBar()
    this.updateGraph()

    // Run Diagnosis once we hit 10 samples
    if (this.state.hrBuffer.length >= 10) {
      const diagnosticText = this.calculateTridoshaInference()
      this.state.doshaWidget.setProperty(prop.TEXT, diagnosticText)
    } else {
      const remaining = 10 - this.state.hrBuffer.length;
      this.state.doshaWidget.setProperty(prop.TEXT, `Acquiring lock...\nNeed ${remaining} more steady beats.`)
    }
  },

  updateProgressBar() {
    // Calculate percentage (maxing out at 10 samples for the calculation lock)
    let fillRatio = this.state.hrBuffer.length / 10
    if (fillRatio > 1) fillRatio = 1 
    
    // Max width is 350px
    const newWidth = Math.floor(350 * fillRatio)
    this.state.progressWidget.setProperty(prop.W, newWidth)
  },

  updateGraph() {
    // Map our HR values to Y coordinates on the screen.
    // Let's assume a normal HR falls between 50 and 120.
    // The graph bounding box is between Y=160 (top) and Y=230 (bottom).
    const graphTop = 160
    const graphHeight = 70
    
    this.state.hrBuffer.forEach((hr, index) => {
      // Normalize the HR to a 0-1 percentage within our 50-120 bounds
      let normalizedHR = (hr - 50) / 70
      if (normalizedHR < 0) normalizedHR = 0
      if (normalizedHR > 1) normalizedHR = 1
      
      // Invert it because Y=0 is the top of the screen
      const yPos = Math.floor(graphTop + (graphHeight - (normalizedHR * graphHeight)))
      
      // Update the dot's position and make it visible
      this.state.graphDots[index].setProperty(prop.Y, yPos)
      this.state.graphDots[index].setProperty(prop.VISIBILITY, true)
    })
  },

  calculateTridoshaInference() {
    const sum = this.state.hrBuffer.reduce((a, b) => a + b, 0)
    const avgHR = sum / this.state.hrBuffer.length

    let diagnosis = ""
    if (avgHR < 65) {
      diagnosis = "Dominant: KAPHA\nPulse: Manduka (Frog)\nType: Slow, steady, soft."
    } else if (avgHR >= 65 && avgHR <= 80) {
      diagnosis = "Dominant: PITTA\nPulse: Mandoeka (Cat)\nType: Strong, rhythmic."
    } else {
      diagnosis = "Dominant: VATA\nPulse: Sarpa (Snake)\nType: Fast, fluctuating."
    }

    return `Pulse Avg: ${Math.round(avgHR)}\n\n${diagnosis}`
  },

  onDestroy() {
    if (this.state.hrSensor) {
      this.state.hrSensor.offCurrentChange()
    }
  }
})