document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(event) {

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            event.preventDefault();
            target.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});


// LEE BLUE POMONA — seasonal booking estimate
(() => {
    const form = document.getElementById("booking-estimate-form");
    if (!form || form.dataset.bookingReady === "true") return;
    form.dataset.bookingReady = "true";

    const checkin = document.getElementById("booking-checkin");
    const checkout = document.getElementById("booking-checkout");
    const guests = document.getElementById("booking-guests");
    const result = document.getElementById("booking-estimate-result");

    const dateString = (date) => {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, "0");
        const d = String(date.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const parseDate = (value) => {
        if (!value) return null;
        const date = new Date(`${value}T00:00:00Z`);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const money = (amount) => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(amount);

    const today = new Date();
    const todayUtc = new Date(Date.UTC(
        today.getFullYear(), today.getMonth(), today.getDate()
    ));
    checkin.min = dateString(todayUtc);
    checkout.min = dateString(todayUtc);

    checkin.addEventListener("change", () => {
        const start = parseDate(checkin.value);
        if (!start) return;

        const nextDay = new Date(start.getTime() + 86400000);
        checkout.min = dateString(nextDay);

        if (checkout.value && checkout.value <= checkin.value) {
            checkout.value = "";
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const start = parseDate(checkin.value);
        const end = parseDate(checkout.value);
        const guestCount = Number(guests.value);

        if (!start || !end || end <= start) {
            result.hidden = false;
            const lang = document.documentElement.lang || "en";
            const invalid = { en: "Please choose valid check-in and check-out dates. Check-out must be after check-in.", sl: "Izberite veljavna datuma prihoda in odhoda. Odhod mora biti po prihodu.", es: "Elige fechas válidas de entrada y salida. La salida debe ser posterior a la entrada." };
            result.textContent = invalid[lang] || invalid.en;
            return;
        }

        let total = 0;
        let highNights = 0;
        let lowNights = 0;
        const nightCount = Math.round((end - start) / 86400000);

        for (let i = 0; i < nightCount; i++) {
            const night = new Date(start.getTime() + i * 86400000);
            const month = night.getUTCMonth() + 1;
            if (month >= 11 || month <= 5) {
                total += 300;
                highNights++;
            } else {
                total += 220;
                lowNights++;
            }
        }

        result.hidden = false;
        const lang = document.documentElement.lang || "en";
        const copy = {
            en: { title: "Your estimated stay", night: "night", nights: "nights", guest: "guest", guests: "guests", high: "High-season nights", low: "Low-season nights", total: "Estimated accommodation total", note: "This is a price estimate only. It does not check availability or reserve these dates. Please contact Lee Blue to confirm your stay." },
            sl: { title: "Okvirna cena bivanja", night: "noč", nights: "noči", guest: "gost", guests2: "gosta", guestsOther: "gostje", high: "Nočitve v visoki sezoni", low: "Nočitve v nizki sezoni", total: "Okvirna skupna cena nastanitve", note: "To je informativni izračun cene. Ne preverja razpoložljivosti in ne ustvari rezervacije. Za potrditev bivanja kontaktirajte Lee Blue." },
            es: { title: "Estimación de tu estancia", night: "noche", nights: "noches", guest: "huésped", guests: "huéspedes", high: "Noches de temporada alta", low: "Noches de temporada baja", total: "Precio estimado del alojamiento", note: "Este es solo un cálculo del precio. No comprueba la disponibilidad ni reserva las fechas. Contacta con Lee Blue para confirmar tu estancia." }
        };
        const t = copy[lang] || copy.en;
        const guestLabel = lang === "sl" ? (guestCount === 1 ? t.guest : (guestCount === 2 ? t.guests2 : t.guestsOther)) : (guestCount === 1 ? t.guest : t.guests);
        const dateLocale = lang === "sl" ? "sl-SI" : (lang === "es" ? "es" : "en-US");
        result.innerHTML = `
            <h3>${t.title}</h3>
            <p>${start.toLocaleDateString(dateLocale, {timeZone:"UTC", year:"numeric", month:"long", day:"numeric"})}
            – ${end.toLocaleDateString(dateLocale, {timeZone:"UTC", year:"numeric", month:"long", day:"numeric"})}</p>
            <p>${nightCount} ${nightCount === 1 ? t.night : t.nights} · ${guestCount} ${guestLabel}</p>
            <ul>
                <li>${t.high}: ${highNights} × $300 = ${money(highNights * 300)}</li>
                <li>${t.low}: ${lowNights} × $220 = ${money(lowNights * 220)}</li>
            </ul>
            <strong>${t.total}</strong>
            <span class="booking-total">${money(total)}</span>
            <p>${t.note}</p>
        `;
    });
})();

