// -------- Global variable -------------//
let drawerSnapshot = null;
//--------------------------------------//

// ----------- Destination and Date Search Bar ------ //

document.addEventListener('DOMContentLoaded', () => {

    const checkIn = document.getElementById('checkin');
    const checkOut = document.getElementById('checkout');

    checkIn.addEventListener('change', ()=>{
        checkOut.min = checkIn.value + 1;
    });

});
// ---------------------------------------------------//

// --------------- HTMX Loading --------------------------//
document.addEventListener('htmx:load', function () {
    initHotelFilters();
});
//--------------------------------------------------//

/* ------------------------ ----------------  
                Amenity Drawer
    -------------------------------------*/

// Open | Close Amenity Filter
document.addEventListener('DOMContentLoaded', () => {
    const AmenityDrawerOpenBtn = document.getElementById("open-amenity-filter");
    const AmenityDrawerCloseBtn = document.getElementById('close-filter');
    const AmenityDrawerCancelBtn = document.getElementById('cancel-filter');
    const resetBtn = document.getElementById('amenity-reset-filter');
    const overlay = document.getElementById('filter-overlay');

    AmenityDrawerOpenBtn.onclick = openAmenityDrawer;
    AmenityDrawerCloseBtn.onclick = () => closeFilterDrawer(true);
    AmenityDrawerCancelBtn.onclick = () => closeFilterDrawer(true);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.dataset.closeAmenity !== undefined){

            closeFilterDrawer(true);
        }
    });

    // Reset Amenity Drawer
    resetBtn.addEventListener("click", ()=>{

        overlay.querySelectorAll('input[type = "checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

    });

});
/* ------------------------ ----------------  
                General Drawer
    -------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {

    const generalDrawer = document.getElementById('filter-drawer');
    const amenityDrawer = document.getElementById('amenity-filter-drawer');

    const openBtn = document.getElementById('open-filter');
    const closeBtn = document.getElementById('close-filter');
    const overlay = document.getElementById('filter-overlay');
    const cancelBtn = document.querySelector('.cancel-filter');
    const ApplyBtn = document.querySelector('.apply-filter');

    openBtn.addEventListener('click', () => {
        openFilterDrawer();
    });

    closeBtn.addEventListener('click', () => {
        closeFilterDrawer(true);
    });

    cancelBtn.addEventListener('click', () => {
        closeFilterDrawer(true);
    });

    overlay.addEventListener('click', (event) => {

        if (event.target === overlay) {
            closeFilterDrawer(true);
        }
    });

    ApplyBtn.addEventListener('click', () => {
        drawerSnapshot = null;
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Min / Max Price filter
let minSlider, maxSlider, minTooltip, maxTooltip, track;
document.addEventListener('DOMContentLoaded', () => {
    minSlider = document.getElementById('min-slider');
    maxSlider = document.getElementById('max-slider');
    minTooltip = document.getElementById('min-tooltip');
    maxTooltip = document.getElementById('max-tooltip');
    track = document.getElementById('track');

    const stepDots = document.querySelectorAll('.step-dot');
    const gap = 20;

    function handleInput(e) {
        let minVal = parseInt(minSlider.value);
        let maxVal = parseInt(maxSlider.value);

        if (maxVal - minVal < gap) {
            if (e.target.id === "min-slider") {
                minSlider.value = maxVal - gap;
            } else {
                maxSlider.value = minVal + gap;
            }
        }
        renderUI();
    }

    stepDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const val = parseInt(dot.dataset.value);
            const distMin = Math.abs(val - minSlider.value);
            const distMax = Math.abs(val - maxSlider.value);

            if (distMin < distMax) {
                minSlider.value = val;
            } else {
                maxSlider.value = val;
            }
            renderUI();
        });
    });

    minSlider.oninput = handleInput;
    maxSlider.oninput = handleInput;

    renderUI();
});

// Filter Drawer Reset 
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('hotel-list-form');
    const resetBtn = document.getElementById("reset-filter");
    const FilterBarResetBtn = document.getElementById("filterbar-reset-filter");

    resetBtn.addEventListener("click", (e)=>{
        resetDrawerInputs();
        drawerSnapshot = null;
    });

    FilterBarResetBtn.onclick = () => {
        resetDrawerInputs();
        drawerSnapshot = null;
    }
});

// Regular Funcntionality
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll(".amenity-btn").forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.amenity);
            if (!input) return;
    
            input.checked = !input.checked;
    
            syncAmenityButton(btn);
            syncAmenityUI(btn.dataset.amenity);

            mask = btn.querySelector('span');

            if (mask) {
                mask.classList.toggle("active");
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', initAmenityButtons);
document.addEventListener('htmx:load', initAmenityButtons);

// -------------- End ---------------------// 

// Selected button
document.addEventListener('DOMContentLoaded', () =>{

    buttons = document.querySelectorAll('.selection-btn');

    buttons.forEach(button => {
        button.select = function(){
            button.classList.toggle('selected');
        };
    }); 
});


// ------------- Hotel Map section -----------------------//
let map;
let markers = {};
let markerCluster = {};
let shouldFitMap = false;
let markersByHotelId = {};
let selectedHotelId = null; 
let hoverTimeout = null;
let lockHotelId = null;

function initMap(){

    if (map) return;

    // 1. Initialize the map and pick a city (e.g., London: 51.5, -0.09)
    map = L.map('hotel-map').setView([39.5, -98.35], 4);

    // 2. Add the actual map images (tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 100,
        iconCreateFunction: cluster => {
            return L.divIcon({
                html: `<div class="cluster">${cluster.getChildCount()}</div>`,
                className: 'hotel-cluster',
                iconSize: [44, 44]
            });
        }
    });

    map.addLayer(markerCluster);

    updateMapFromDOM();
}

function updateMapFromDOM(){

    if (!map) return;

    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};

    markerCluster.clearLayers();
    markersByHotelId = {};

    const cards = document.querySelectorAll(".hotel-list-hotel-card");

    hotels = Array.from(cards).map(card => ({

        id: card.dataset.hotelId,
        lat: parseFloat(card.dataset.lat),
        lon: parseFloat(card.dataset.lon),
        name: card.dataset.name,
        address: card.dataset.address,
        price: parseFloat(card.dataset.price),
    }));

    addHotelMarkers(hotels);

    if (shouldFitMap){
        fitMapToMarkers();
        shouldFitMap = false;
    }


    map.on('click', () => {
        if (!selectedHotelId) return;
        unlockMarker();
    
        // closeMarkerInfo();
        resetMarkerState(selectedHotelId);
        selectedHotelId = null;
    });
    
}

function showMarkerInfo(hotel) {
    L.popup({offset:[0,-30]})
      .setLatLng([hotel.lat, hotel.lon])
      .setContent(`
        <strong>${hotel.name}</strong><br>
        <small>${hotel.address}</small>
      `)
      .openOn(map);
}

function closeMarkerInfo() {
    map.closePopup();
}

function resetMarkerState(hotelId) {
    const marker = markersByHotelId[hotelId];
    if (!marker) return;

    marker.setIcon(defaultIcon);
    unhighlightHotelCard(hotelId);
}

function getHotelCard(card){

    hotel = {
        id: card.dataset.hotelId,
        lat: parseFloat(card.dataset.lat),
        lon: parseFloat(card.dataset.lon),
        name: card.dataset.name,
        address: card.dataset.address,
        price: parseFloat(card.dataset.price),
    }

    return hotel
    
}

function highlightHotelCard(hotelId) {
    document.querySelectorAll('.hotel-list-hotel-card').forEach(card => {
        card.classList.remove('active');
    });

    const card = document.querySelector(
        `.hotel-list-hotel-card[data-hotel-id="${hotelId}"]`
    );

    if (!card) return;

    card.classList.add('active');
}

function ScrollIntoView(hotelId){

    const card = document.querySelector(
        `.hotel-list-hotel-card[data-hotel-id="${hotelId}"]`
    );

    card.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function unhighlightHotelCard(hotelId) {

    const card = document.querySelector(
        `.hotel-list-hotel-card[data-hotel-id="${hotelId}"]`
    );
    if (!card) return;

    card.classList.remove('active');
}

function addHotelMarkers(hotels) {
    markerCluster.clearLayers();

    hotels.forEach(hotel => {
        const marker = L.marker([hotel.lat, hotel.lon], {icon: createHotelMarkers(hotel)});

        marker.hotelId = hotel.id;

        marker.on('click', (e) => {

            L.DomEvent.stopPropagation(e);
            clearTimeout(hoverTimeout);

            if (selectedHotelId && selectedHotelId !== hotel.id){
                resetMarkerState(selectedHotelId);
            }
            selectedHotelId = hotel.id;

            marker.setIcon(activeIcon);
            lockMarker(hotel);
        });

        marker.on('mouseover', () => {
            if (selectedHotelId === hotel.id) return;
            if (lockHotelId) return;

            clearTimeout(hoverTimeout);
            showMarkerInfo(hotel);
            marker.setIcon(activeIcon);
            highlightHotelCard(hotel.id);
        });
        
        marker.on('mouseout', () => {
            hoverTimeout = setTimeout(() => {

                if (lockHotelId) return;

                if (selectedHotelId !== hotel.id){
                    closeMarkerInfo();
                    marker.setIcon(defaultIcon);
                    unhighlightHotelCard(hotel.id);
                }
            }, 50);
        });

        markersByHotelId[hotel.id] = marker;
        markerCluster.addLayer(marker);
    });
}

function fitMapToMarkers() {
    const bounds = markerCluster.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
    }
}

function lockMarker(hotel){
    lockHotelId = hotel.id;

    showMarkerInfo(hotel);
    highlightHotelCard(hotel.id);
    ScrollIntoView(hotel.id);
}

function unlockMarker(){
    if (!lockHotelId) return;

    unhighlightHotelCard(lockHotelId);
    closeMarkerInfo();

    lockHotelId = null;
}

function createHotelMarkers(hotel, active = false){
    defaultIcon = L.divIcon({
        className: "hotel-marker",
        html: `<div class = "marker-pin ${active ? 'active' : ''}"> $${hotel.price} </div>`,
        iconSize: [36,36],
        iconAnchor: [18,36]
    });
    
    activeIcon = L.divIcon({
        className: "hotel-marker hotel-marker--active",
        html: `<div class = "marker-pin ${active ? 'active' : ''}"> $${hotel.price} </div>`,
        iconSize: [40,40],
        iconAnchor: [20,40]
    });

    return defaultIcon;
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

document.addEventListener('click', (e) => {

    const card = e.target.closest('.hotel-list-hotel-card');

    if (!card) return;

    const hotelId = card.dataset.hotelId;

    if (lockHotelId && lockHotelId !== hotelId){
        console.log("unlock", lockHotelId);
        resetMarkerState(lockHotelId);
        unlockMarker();
    }
    
    selectedHotelId = hotelId;
    const marker = markersByHotelId[hotelId];
    const hotel = getHotelCard(card);
    lockMarker(hotel);
    marker.setIcon(activeIcon);
});

document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.hotel-list-hotel-card');

    if (lockHotelId) return;

    if (!card) return;

    const hotelId = card.dataset.hotelId;
    const marker = markersByHotelId[hotelId];
    if (!marker) return;

    marker.setIcon(activeIcon);
    marker.setZIndexOffset(1000);
    showMarkerInfo(getHotelCard(card));
    map.panTo(marker.getLatLng(), { animate: true, duration: 0.25 });
});

document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.hotel-list-hotel-card');

    if (lockHotelId) return;

    if (!card) return;

    const hotelId = card.dataset.hotelId;
    const marker = markersByHotelId[hotelId];

    if (!marker) return;

    marker.setIcon(defaultIcon);
    marker.setZIndexOffset(0);
    closeMarkerInfo();
});

document.body.addEventListener('htmx:afterSwap', () => {
    document
        .querySelectorAll('hotel-list-hotel-card')
        .forEach(card => card.classList.remove('.active'));
});

// ------------- End-----------------------//

// ----- General Drawer Function -------//
function renderUI() {
    const minVal = parseInt(minSlider.value);
    const maxVal = parseInt(maxSlider.value);

    const minPercent = (minVal / minSlider.max) * 100;
    const maxPercent = (maxVal / maxSlider.max) * 100;

    // Tooltip positions
    minTooltip.style.left = minPercent + "%";
    minTooltip.innerText = "$" + minVal;
    maxTooltip.style.left = maxPercent + "%";
    maxTooltip.innerText = "$" + maxVal;

    // Track color (Lavender #D6B4FC)
    track.style.background = `linear-gradient(to right, #E2E8F0 ${minPercent}%, #3a3a3a ${minPercent}%, #3a3a3a ${maxPercent}%, #E2E8F0 ${maxPercent}%)`;
}

function openFilterDrawer() {
    const generalDrawer = document.getElementById('filter-drawer');
    const amenityDrawer = document.getElementById('amenity-filter-drawer');
    const overlay = document.getElementById("filter-overlay");

    form = document.getElementById('hotel-filter-form');

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    generalDrawer.classList.add('active');
    amenityDrawer.classList.remove('active');
    drawerSnapshot = new FormData(form);
}

function closeFilterDrawer(discard = true){
    const form = document.getElementById('hotel-filter-form');
    const generalDrawer = document.getElementById('filter-drawer');
    const amenityDrawer = document.getElementById('amenity-filter-drawer');
    const overlay = document.getElementById("filter-overlay");

    if (discard && drawerSnapshot) {

        // Clear everything first
        for (const el of form.elements) {
            if (!el.name) continue;

            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false;
            } else if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
            } else {
                el.value = '';
            }
        }

        // Restore snapshot
        for (const [name, value] of drawerSnapshot.entries()) {
            const fields = form.querySelectorAll(`[name="${name}"]`);

            fields.forEach(field => {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    if (field.value === value) {
                        field.checked = true;
                    }
                } else {
                    field.value = value;
                }
            });
        }

        initAmenityButtons();
    }

    // 🔑 Sync UI after restore
    renderUI();            // price only
    syncAllAmenityUI();    // amenity buttons
    initAmenityButtons(); // defensive re-sync

    generalDrawer.classList.remove('active');
    amenityDrawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function resetDrawerInputs (){
    const minSlider = document.getElementById("min-slider");
    const maxSlider = document.getElementById("max-slider");
    const drawer = document.getElementById("filter-drawer");

    // price
    minSlider.value = minSlider.min;
    maxSlider.value = maxSlider.max;
    renderUI();

    // rating
    drawer.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    drawer.querySelector('input[name="rating"][value=""]').checked = true;

    // amenities
    document.querySelectorAll('input[name="amenities"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    document.querySelectorAll('.amenity-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        const mask = btn.querySelector("span");

        if (mask){
            mask.classList.remove("active");
        }
    });

    // 🔑 re-sync buttons
    syncAllAmenityUI();
}

function normalizeFormParams(form) {
    const inputs = form.querySelectorAll("input, select");
  
    inputs.forEach(input => {
      if (
        input.name &&
        (input.value === "" || input.value === null)
      ) {
        input.disabled = true;
      }
    });
  
    // Re-enable after request
    form.addEventListener("htmx:afterRequest", () => {
      inputs.forEach(i => i.disabled = false);
    }, { once: true });
}

function initHotelFilters() {
    const openFilterBtn = document.getElementById('open-filter');
    const closeFilterBtn = document.getElementById('close-filter');
    const cancleFilterBtn = document.getElementById('cancel-filter');
    const resetBtn = document.getElementById('reset-filter');

    if (openFilterBtn) {
        openFilterBtn.onclick = () => openFilterDrawer();
    }

    if (closeFilterBtn) {
        closeFilterBtn.onclick = () => closeFilterDrawer(true);
    }

    if (cancleFilterBtn) {
        cancleFilterBtn.onclick = () => closeFilterDrawer(true);
    }

    if (resetBtn) {
        resetBtn.onclick = resetDrawerInputs;
    }
}

function syncAmenityButton(btn){

    const input = document.getElementById(btn.dataset.amenity);
    if (!input) return;

    btn.classList.toggle('active', input.checked);
    btn.setAttribute('aria-pressed', input.checked);
}

// Sync the same amenity across different drawer
function syncAmenityUI(amenityId){
    const input = document.getElementById(amenityId);
    if (!input) return

    document.querySelectorAll(`.amenity-btn[data-amenity = "${amenityId}"]`).forEach(btn => {
        btn.classList.toggle('active', input.checked);
        btn.setAttribute('aria-pressed', input.checked);
    });
}

function syncAllAmenityUI() {
    document.querySelectorAll('input[name="amenities"]').forEach(input => {
        syncAmenityUI(input.id);
    });
}

function initAmenityButtons() {
    document.querySelectorAll('.amenity-btn').forEach(btn => {
      syncAmenityButton(btn);
    });
}

function openAmenityDrawer() {
    const generalDrawer = document.getElementById('filter-drawer');
    const amenityDrawer = document.getElementById('amenity-filter-drawer');
    const overlay = document.getElementById("filter-overlay");
    // document.getElementById('amenity-filter-drawer').appendChild(document.getElementById('amenity-inputs'));
    overlay.classList.add('active');
    amenityDrawer.classList.add('active');
    generalDrawer.classList.remove('active');
}

function closeAmenityDrawer() {
    document.getElementById('filter-drawer').appendChild(document.getElementById('amenity-inputs'));
}
//--------------------------------//