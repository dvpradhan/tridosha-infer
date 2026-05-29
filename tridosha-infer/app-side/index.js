import { BaseSideService } from '@zeppos/zml'

AppSideService(
  BaseSideService({
    onInit() {
      console.log("📱 PHONE COMPANION: Booted up and listening...")
    },

    onRequest(req, res) {
      console.log("📱 PHONE COMPANION: Received Bluetooth payload!")
      
      // 1. Check if the message is our Dosha data
      if (req.method === 'SAVE_DOSHA_DATA') {
        const data = req.params
        
        console.log(`◈ New Reading Received!`)
        console.log(`HR: ${data.hr} | HRV: ${data.hrv}`)
        console.log(`Dosha: ${data.dosha}`)
        
        // 2. Here is where we will eventually save this to a phone database
        // or beam it to a cloud server via the phone's internet!
        
        // 3. Send a success receipt back to the watch
        res(null, {
          status: 'success',
          message: 'Data secured on phone.'
        })
      }
    },

    onRun() {
      console.log("📱 PHONE COMPANION: Running in background.")
    },

    onDestroy() {
      console.log("📱 PHONE COMPANION: Shutting down.")
    }
  })
)