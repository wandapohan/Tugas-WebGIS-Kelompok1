// main.js
document.addEventListener("DOMContentLoaded", function() {
    const loader = document.getElementById("loader");
    const content = document.getElementById("content");
    const image = document.querySelector(".loading-image");

    // Simulasi waktu loading
    setTimeout(() => {
        image.classList.add("fade-out");
        setTimeout(() => {
            loader.style.display = "none";
            content.style.display = "block";

            // Paksa marquee untuk memulai ulang animasi
            const marquee = document.querySelector("marquee");
            marquee.stop(); // Hentikan marquee
            marquee.start(); // Mulai ulang marquee

            // Initialize map after content is visible
            initializeMap();
        }, 500); // Match with CSS transition duration
    }, 2000); // Loading duration
});

function initializeMap() {
    // Initialize map with responsive view
    const map = L.map('map', {
        zoomControl: false,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true
    }).setView([-7.7660415500489, 110.3775572423276], 13);

    // Add zoom control
    L.control.zoom({
        position: 'topleft'
    }).addTo(map);

    // Base maps definition
    const baseMaps = {
        "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),
        "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
        }),
        "Dark Mode": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        })
    };

    // Add default base map
    baseMaps["Street Map"].addTo(map);

    // Add layer control
    const layerControl = L.control.layers(baseMaps, null, {
        position: 'topright',
        collapsed: true,
        autoZIndex: true
    }).addTo(map);

    // Handle mobile view
    function handleMobileView() {
        if (window.innerWidth <= 768) {
            map.touchZoom.enable();
            map.doubleClickZoom.disable();
            layerControl.collapse();
        } else {
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
        }
    }

    handleMobileView();
    window.addEventListener('resize', handleMobileView);

    // Distance measurement functionality
    let _firstLatLng = null,
        _secondLatLng = null,
        _polyline = null,
        markerA = null,
        markerB = null;

    map.on('click', function(e) {    
        const lat = e.latlng.lat.toFixed(4);
        const lng = e.latlng.lng.toFixed(4);
        const formattedLatLng = `(${lat}, ${lng})`;
        
        if (!_firstLatLng) {
            _firstLatLng = e.latlng;
            markerA = L.marker(_firstLatLng)
                .addTo(map)
                .bindPopup(`Point A<br/>${formattedLatLng}`)
                .openPopup();
        } else if(!_secondLatLng) {
            _secondLatLng = e.latlng;
            markerB = L.marker(_secondLatLng)
                .addTo(map)
                .bindPopup(`Point B<br/>${formattedLatLng}`)
                .openPopup();
            
            _polyline = L.polyline([_firstLatLng, _secondLatLng], {
                color: '#3498db',
                weight: 4,
                dashArray: '5, 5'
            }).addTo(map);
            
            let _length = map.distance(_firstLatLng, _secondLatLng);
            document.getElementById('length').textContent = _length.toFixed(2);
        } else {
            if(_polyline) map.removeLayer(_polyline);
            _firstLatLng = e.latlng;
            map.removeLayer(markerA);
            map.removeLayer(markerB);
            _secondLatLng = null;
            
            markerA = L.marker(_firstLatLng)
                .addTo(map)
                .bindPopup(`Point A<br/>${formattedLatLng}`)
                .openPopup();
        }
    });
}