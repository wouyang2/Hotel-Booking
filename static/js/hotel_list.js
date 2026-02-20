// -------- Global variable -------------//
let drawerSnapshot = null;
//--------------------------------------//

// ----------- Destination and Date Search Bar ------ //

// Calender Setup 
function initDatePickers() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const checkinDisplay = document.getElementById('checkin-display');
    const checkoutDisplay = document.getElementById('checkout-display');

    if (!checkinInput || !checkoutInput) return;

    // Helper to format date for display (e.g., Feb 19)
    const formatDate = (dateObj) => {
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    flatpickr("#checkin", {
        mode: "range",          // Enables selecting a start and end date
        minDate: "today",
        dateFormat: "Y-m-d",
        showMonths: 2,          // Optional: Shows two months side-by-side (very premium feel)
        
        onChange: function(selectedDates, dateStr, instance) {
            // 1. Handle the Start Date (Check-in)
            if (selectedDates[0]) {
                const start = instance.formatDate(selectedDates[0], "Y-m-d");
                checkinInput.value = start;
                checkinDisplay.textContent = formatDate(selectedDates[0]);
            }

            // 2. Handle the End Date (Check-out)
            if (selectedDates[1]) {
                const end = instance.formatDate(selectedDates[1], "Y-m-d");
                checkoutInput.value = end;
                checkoutDisplay.textContent = formatDate(selectedDates[1]);
                
                // Optional: Close the calendar automatically after selecting the second date
                instance.close();
            } else {
                // Clear checkout if only one date is picked (or re-selecting)
                checkoutInput.value = "";
                checkoutDisplay.textContent = "Check-out";
            }
        }
    });

    // Make the checkout box also trigger the same calendar
    document.getElementById('checkout-click-zone').addEventListener('click', () => {
        checkinInput._flatpickr.open();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateFilterCountUI();
    initDatePickers();
});

document.addEventListener('htmx:afterSwap', initDatePickers);
// ---------------------------------------------------//

// --------------- HTMX Loading --------------------------//
document.addEventListener('htmx:load', function () {
    initHotelFilters();
    initDatePickers();
});

/* ------------------------ ----------------  
                 Drawers
    -------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {

    const overlay = document.getElementById('filter-overlay');

    // General Drawer
    const openBtn = document.getElementById('open-filter');

    openBtn.addEventListener('click', () => {
        openFilterDrawer('filter-drawer');
    });

    // Closing drawer
    document.addEventListener('click',(e) => {
        const btn = e.target.closest('[data-action = "close"]');
        if (!btn) return;

        closeFilterDrawer(true);
    });

    overlay.addEventListener('click', (event) => {

        if (event.target === overlay) {
            closeFilterDrawer(true);
        }
    });

    // Apply Filter
    document.getElementById('hotel-filter-form').addEventListener('htmx:afterRequest', () => {

        const form = document.getElementById('hotel-filter-form');
        drawerSnapshot = new FormData(form);
        updateFilterCountUI();
        closeFilterDrawer(false);
    });

    // Reset Filter
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action = "reset"]');
        if (!btn) return;

        const drawer = (btn.id === 'filterbar-reset-filter') 
            ? document.getElementById('filter-drawer')
            : btn.closest('.filter-drawer');

        if (!drawer) return;
        resetDrawerInputs(drawer.id);
    });

    // Amenity Drawer
    const AmenityOpenBtn = document.getElementById('open-amenity-filter');

    AmenityOpenBtn.onclick = () => openFilterDrawer('amenity-filter-drawer');

    updateFilterCountUI();
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
    updateFilterCountUI();
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
        });
    });

    updateFilterCountUI();
});

document.addEventListener('DOMContentLoaded', () => {
    initAmenityButtons();
    updateFilterCountUI();
});
document.addEventListener('htmx:load', initAmenityButtons);

// -------------- End ---------------------// 

// Selected button
document.addEventListener('DOMContentLoaded', () =>{

    buttons = document.querySelectorAll('.selection-btn');

    buttons.forEach(button => {
        button.select = function(){
            button.classList.toggle('active');
        };
    }); 
    updateFilterCountUI();
});

// Filter Count
function countAppliedFilters() {
    const form = document.getElementById('hotel-filter-form');
    const formData = new FormData(form);

    let count = 0;

    /* Rating */
    if (formData.get('rating')) {
        count += 1;
    }

    /* Price */
    const min = formData.get('min_price');
    const max = formData.get('max_price');

    if (
        (min && min !== '0') ||
        (max && max !== '500')
    ) {
        count += 1;
    }

    /* Amenities (each counts) */
    const amenities = formData.getAll('amenities');
    count += amenities.length;

    return count;
}

function updateFilterCountUI() {
    const badge = document.getElementById('filter-count');
    const count = countAppliedFilters();

    if (count > 0) {
        badge.textContent = "(" + count + ")";
        badge.classList.add('active');
    } else {
        badge.className = '';
    }
}

// Filter Selection
document.addEventListener('click', function(e) {
    const closeBtn = e.target.closest('.selected-close');
    if (!closeBtn) return;

    const keyToRemove = closeBtn.getAttribute('data-amenity');
    console.log(keyToRemove);

    const form = document.getElementById('hotel-filter-form');

    const checkbox = form.querySelector(`input[name="amenities"][value="${keyToRemove}"]`);

    console.log(checkbox);

    if (checkbox) checkbox.checked = false;

    form.requestSubmit();
});

// ------------- Calender Drawer ------------------------ //
let currentHotelPrice = 0;

document.addEventListener('DOMContentLoaded', function(e) {
    const dateOverlay = document.getElementById('date-drawer-overlay');
    const dateDrawer = document.getElementById('date-picker-drawer');
    const rangeText = document.getElementById('drawer-date-range-text');

    function openDateDrawer() {
        const container = document.getElementById("inline-calendar-container");
        
        // Always destroy the old one to prevent "ghost" calendars
        if (window.drawerPicker) {
            window.drawerPicker.destroy();
        }

        // Initialize AFTER the drawer is visible
        window.drawerPicker = flatpickr(container, {
            inline: true,
            mode: "range",
            minDate: "today",
            showMonths: 2,
            static: true, // Helps with positioning in scrolling drawers
            onChange: function(selectedDates, dateStr, instance) {
                const rangeText = document.getElementById('drawer-date-range-text');
                if (selectedDates.length === 2) {
                    const start = instance.formatDate(selectedDates[0], "M j");
                    const end = instance.formatDate(selectedDates[1], "M j");
                    rangeText.textContent = `${start} — ${end}`;
                }
            }
        });
    }

    // 2. Open Logic
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.date-selection-btn'); 
        if (btn) {
            currentHotelPrice = parseFloat(btn.getAttribute('data-price')) || 0;
            const overlay = document.getElementById('date-drawer-overlay');
            const drawer = document.getElementById('date-picker-drawer');
            
            overlay.classList.add('active');
            drawer.classList.add('active');
            
            // THE FIX: Wait 50ms for the CSS animation to start/display to change
            setTimeout(() => {
                openDateDrawer();
            }, 50);
        }
    });

    // 3. Close Logic
    const closeElements = document.querySelectorAll('[data-action="close-date"]');
    closeElements.forEach(el => {
        el.addEventListener('click', () => {
            dateOverlay.classList.remove('active');
            dateDrawer.classList.remove('active');
        });
    });

    // 4. Apply Dates Logic
    document.getElementById('apply-drawer-dates').addEventListener('click', () => {
        const selected = drawerPicker.selectedDates;
        if (selected.length === 2) {
            // Push these dates to your main search bar inputs
            const mainCheckin = document.getElementById('checkin');
            const mainCheckout = document.getElementById('checkout');
            
            // Format for the backend (YYYY-MM-DD)
            mainCheckin.value = drawerPicker.formatDate(selected[0], "Y-m-d");
            mainCheckout.value = drawerPicker.formatDate(selected[1], "Y-m-d");

            // Trigger the display update in the search bar if needed
            // ... trigger your existing update logic ...
            
            dateOverlay.classList.remove('active');
            dateDrawer.classList.remove('active');
        }
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

function showMarkerInfo(hotelId) {
    const marker = markersByHotelId[hotelId];
    if (!marker) return;

    if (marker.__parent) {

        // Marker is inside a cluster
        markerCluster.zoomToShowLayer(marker, () => {
            animateToMarker(marker);
        });
    } else {
        // Marker is visible (not clustered)
        animateToMarker(marker);
    }
}

function openPopup(marker) {
    const hotel = marker.hotelData;

    L.popup({offset:[0,-30]})
        .setLatLng(marker.getLatLng())
        .setContent(`
            <strong>${hotel.name}</strong><br>
            <small>${hotel.address}</small>`)
        .openOn(map);
}

function animateToMarker(marker) {
    const latlng = marker.getLatLng();

    map.flyTo(latlng, Math.max(map.getZoom(), 14), {
        duration: 0.6,
        easeLinearity: 0.25
    });

    map.once('moveend', () => {
        openPopup(marker);
    });
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
        marker.hotelData = hotel;

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
            showMarkerInfo(hotel.id);
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

    showMarkerInfo(hotel.id);
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
    showMarkerInfo((getHotelCard(card).id));
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
    document.querySelectorAll('hotel-list-hotel-card').forEach(card => card.classList.remove('.active'));
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

function openFilterDrawer(drawerId) {

    const overlay = document.getElementById("filter-overlay");
    overlay.classList.add('active');

    form = document.getElementById('hotel-filter-form');
    drawerSnapshot = new FormData(form);

    document.querySelectorAll('.filter-drawer').forEach(drawer => {
        drawer.classList.remove('active');
    });

    document.getElementById(drawerId).classList.add('active');

    document.body.style.overflow = 'hidden';
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

function resetDrawerInputs (drawerId){

    const drawer = document.getElementById(drawerId);

    if (drawerId === 'filter-drawer') {
        
        // price
        const minSlider = document.getElementById("min-slider");
        const maxSlider = document.getElementById("max-slider");
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

        drawer.querySelectorAll('.amenity-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            const mask = btn.querySelector("span");

            if (mask){
                mask.classList.remove("active");
            }
        });
    }

    else if (drawerId === 'amenity-filter-drawer'){
        // amenities
        document.querySelectorAll('input[name="amenities"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        drawer.querySelectorAll('.amenity-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            const mask = btn.querySelector("span");

            if (mask){
                mask.classList.remove("active");
            }
        });
    }

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
        openFilterBtn.onclick = () => openFilterDrawer('filter-drawer');
    }

    if (closeFilterBtn) {
        closeFilterBtn.onclick = () => closeFilterDrawer(true);
    }

    if (cancleFilterBtn) {
        cancleFilterBtn.onclick = () => closeFilterDrawer(true);
    }

    if (resetBtn) {
        resetBtn.onclick = () =>  resetDrawerInputs('filter-drawer');
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
        const mask = btn.querySelector('span');
        if (mask){
            mask.classList.toggle('active', input.checked);
        }
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

function getActivityDrawer() {
    return document.querySelector('.filter-drawer.action');
}
//--------------------------------//