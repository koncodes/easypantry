<script>
import { Html5Qrcode } from "html5-qrcode";
import { computed } from 'vue';
import User from "@/models/User.js";


export default {
  name: "Connect",
  components: {},
  // props: {
  //   authUser: {
  //     type: User, 
  //     required: false}
  // },
  inject: ["logout", "login"],
  data() {
    return {
      html5QrCode: null,
      isScanning: false,
      cameras: [],
      selectedCameraId: null,
    };
  },
  methods: {
    async fetchCameras() {
      try {
        this.cameras = await Html5Qrcode.getCameras();
        console.log("Available Cameras:", this.cameras);
        
        if (this.cameras.length > 0) {
          this.selectedCameraId = this.cameras[0].id; // Default to the first camera
        } else {
          console.error("No cameras found.");
          alert("No cameras available for scanning.");
        }
      } catch (err) {
        console.error("Error fetching cameras:", err);
        alert("Unable to access cameras: " + err);
      }
    },
    startQrScanner() {
      if (!this.selectedCameraId) {
        alert("No camera selected.");
        return;
      }
      this.isScanning = true;

      this.html5QrCode = new Html5Qrcode(/* element id */ "reader", /* verbose= */ true);

      this.html5QrCode
        .start(
          this.selectedCameraId, // Use the selected camera
          {
            fps: 10,    // Optional, frame per seconds for qr code scanning
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            console.log("QR Code scanned:", decodedText);

            await new Promise((resolve) => {
              this.$emit('close', resolve); // Passing resolve to parent
            });

            const currentProtocol = window.location.protocol;
            const currentHost = window.location.host;

            try {
              const decodedURL = new URL(decodedText);

              if (
                decodedURL.protocol === currentProtocol &&
                decodedURL.host === currentHost
              ) {
                window.location.href = decodedText;
              } else {
                alert("Scanned QR code does not match the current site.");
              }
            } catch (error) {
              console.error("Invalid QR Code format:", error);
              alert("Invalid QR Code URL.");
            }

            this.stopQrScanner(); // Stop scanning after successful decode
          },
          (errorMessage) => {
            console.error("Scanning error:", errorMessage);
          }
        )
        .catch((err) => {
          console.error("Unable to start QR scanner:", err);
        });
    },
    stopQrScanner() {
      if (this.html5QrCode) {
        this.html5QrCode.stop().then(() => {
          this.html5QrCode.clear();
          this.html5QrCode = null;
          this.isScanning = false;
        });
      }
    },
  },
  async mounted() {
    await this.fetchCameras(); // Fetch available cameras on component mount
  },
};

</script>

<template>
  <div class="">
      <label for="camera-select" class="mb-1">Select Camera:</label>
      <div v-if="cameras.length > 0" class="d-flex flex-column gap-2 mb-2">
        <select
          class="form-control"
          id="camera-select"
          v-model="selectedCameraId"
          :disabled="isScanning"
        >
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.label || `Camera ${camera.id}` }}
          </option>
        </select>
        <button v-if="!isScanning" @click="startQrScanner" class="btn">Scan QR Code</button>
        <button v-if="isScanning" @click="stopQrScanner" class="btn">Stop Scanning</button>
      </div>

      <div id="reader"></div>
    </div>
</template>


<style scoped lang="scss">

#reader {
  display: block;
  width: 100%;
  min-height: 320px;
  height: 100%;
  margin: auto;
  border: 1px solid var(--color-gray-dark);
  border-radius: 5px;
  background-color: #f9f9f9;
  overflow: hidden; 
}
</style>
