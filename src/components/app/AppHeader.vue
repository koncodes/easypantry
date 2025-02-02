<script>
export default {
    name: "AppHeader",
    methods: {
        reloadPage() {
            if (this.$route.path === '/') {
                window.location.reload();
            } else {
                this.$router.push('/');
            }
        }
    }
}
</script>

<template>
    <header class="overlay">
        <router-link to="/" class="nav-home nav-link"  @click.prevent="reloadPage">
            <h1>
                <div class="headerSVGcon">
                    <svg class="headerSVG" viewBox="-0.0002 2.3708 100.0005 95.2584">
                        <path d="M 51.14 82.683 L 63.841 97.112 C 64.721 98.111 66.37 97.576 66.494 96.25 L 68.288 77.112 C 68.373 76.2 69.24 75.571 70.133 75.771 L 88.889 79.979 C 90.189 80.27 91.207 78.868 90.529 77.722 L 80.731 61.184 C 80.264 60.397 80.595 59.378 81.436 59.015 L 99.083 51.395 C 100.306 50.867 100.306 49.133 99.083 48.605 L 81.436 40.985 C 80.595 40.622 80.264 39.604 80.731 38.816 L 90.529 22.278 C 91.207 21.132 90.189 19.73 88.889 20.021 L 70.133 24.229 C 69.24 24.43 68.373 23.8 68.288 22.889 L 66.494 3.75 C 66.37 2.424 64.721 1.889 63.841 2.888 L 51.14 17.317 C 50.535 18.004 49.465 18.004 48.86 17.317 L 36.159 2.888 C 35.279 1.889 33.63 2.424 33.506 3.75 L 31.712 22.889 C 31.626 23.8 30.76 24.43 29.867 24.229 L 11.111 20.021 C 9.811 19.73 8.793 21.132 9.471 22.278 L 19.269 38.816 C 19.736 39.604 19.405 40.622 18.564 40.985 L 0.917 48.605 C -0.306 49.133 -0.306 50.867 0.917 51.395 L 18.564 59.015 C 19.405 59.378 19.736 60.397 19.269 61.184 L 9.471 77.722 C 8.793 78.868 9.811 80.27 11.111 79.979 L 29.867 75.771 C 30.76 75.571 31.626 76.2 31.712 77.112 L 33.506 96.25 C 33.63 97.576 35.279 98.111 36.159 97.112 L 48.86 82.683 C 49.465 81.996 50.535 81.996 51.14 82.683"/>
                    </svg>
                    <svg class="sidebar-svg headerSVG2" viewBox="0 0 54.21 54.21">
                        <path id="sidebar-path" fill="none" stroke-width="0" stroke="transparent" d="M 27.11,0 A 27.11,27.11 0 1,1 27.11,54.22 A 27.11,27.11 0 1,1 27.11,0" />
                        <text id="sidebar-text">
                            <textPath id="sidebar-textpath" href="#sidebar-path">your easy pantry</textPath>
                        </text>
                    </svg>
                </div>
                <span>
                    ay<span class="h1p"></span>antr<span class="h1y">y</span>
                </span>
                <div>Cooking Made Simple</div>
            </h1>
        </router-link>
    </header>
</template>

<style scoped>
    
</style>