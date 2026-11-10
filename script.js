document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function(event) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// LEE BLUE — stay estimate with length-of-stay rates and camping add-on
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
        return y + "-" + m + "-" + d;
    };
    const parseDate = (value) => {
        if (!value) return null;
        const date = new Date(value + "T00:00:00Z");
        return Number.isNaN(date.getTime()) ? null : date;
    };
    const money = (amount) => new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", maximumFractionDigits: 0
    }).format(amount);

    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    checkin.min = dateString(todayUtc);
    checkout.min = dateString(todayUtc);

    checkin.addEventListener("change", () => {
        const start = parseDate(checkin.value);
        if (!start) return;
        const nextDay = new Date(start.getTime() + 86400000);
        checkout.min = dateString(nextDay);
        if (checkout.value && checkout.value <= checkin.value) checkout.value = "";
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const start = parseDate(checkin.value);
        const end = parseDate(checkout.value);
        const guestCount = Number(guests.value);
        const nightCount = start && end && end > start
            ? Math.round((end - start) / 86400000) : 0;
        const lang = document.documentElement.lang || "en";

        const messages = {
            en: {
                invalid: "Please choose valid check-in and check-out dates.",
                min: "The minimum stay is 3 nights. Please choose a longer stay.",
                title: "Your estimated stay", night: "night", nights: "nights",
                guest: "guest", guests: "guests", high: "Main-season house nights",
                low: "Slow-season house nights", camping: "Additional camping guests",
                total: "Estimated accommodation total",
                note: "This is an estimate only. It does not check availability or reserve these dates. Camping is available only with a full-house reservation. Please contact Lee Blue to confirm your stay."
            },
            sl: {
                invalid: "Izberite veljavna datuma prihoda in odhoda.",
                min: "Minimalno bivanje je 3 noči. Prosimo, izberite daljše bivanje.",
                title: "Okvirna cena bivanja", night: "noč", nights: "noči",
                guest: "gost", guests: "gostje", high: "Nočitve v glavni sezoni",
                low: "Nočitve v počasni sezoni", camping: "Dodatni kampisti",
                total: "Okvirna skupna cena nastanitve",
                note: "To je informativni izračun. Ne preverja razpoložljivosti in ne ustvari rezervacije. Kampiranje je mogoče samo ob najemu celotne hiške. Za potrditev bivanja kontaktirajte Lee Blue."
            },
            es: {
                invalid: "Elige fechas válidas de entrada y salida.",
                min: "La estancia mínima es de 3 noches. Elige una estancia más larga.",
                title: "Estimación de tu estancia", night: "noche", nights: "noches",
                guest: "huésped", guests: "huéspedes", high: "Noches de temporada principal",
                low: "Noches de temporada tranquila", camping: "Huéspedes adicionales de camping",
                total: "Precio estimado del alojamiento",
                note: "Este es solo un cálculo. No comprueba disponibilidad ni reserva las fechas. El camping solo está disponible al reservar toda la casa. Contacta con Lee Blue para confirmar tu estancia."
            }
        };
        const t = messages[lang] || messages.en;

        if (!start || !end || nightCount <= 0) {
            result.hidden = false;
            result.textContent = t.invalid;
            return;
        }
        if (nightCount < 3) {
            result.hidden = false;
            result.textContent = t.min;
            return;
        }
        if (nightCount >= 30) {
            result.hidden = false;
            result.textContent = lang === "sl"
                ? "Za bivanje 30 noči ali več nam pošljite povpraševanje za individualno ponudbo."
                : lang === "es"
                    ? "Para estancias de 30 noches o más, contáctanos para recibir una cotización personalizada."
                    : "For stays of 30 nights or more, please contact us for a tailored quote.";
            return;
        }

        const tier = nightCount >= 21 ? 3 : nightCount >= 14 ? 2 : nightCount >= 7 ? 1 : 0;
        const highRates = [170, 160, 150, 140];
        const lowRates = [120, 110, 100, 90];
        const highRate = highRates[tier];
        const lowRate = lowRates[tier];
        const campingGuests = Math.max(0, guestCount - 4);
        let highNights = 0;
        let lowNights = 0;

        for (let i = 0; i < nightCount; i++) {
            const night = new Date(start.getTime() + i * 86400000);
            const month = night.getUTCMonth() + 1;
            if (month >= 11 || month <= 5) highNights++;
            else lowNights++;
        }

        const houseTotal = highNights * highRate + lowNights * lowRate;
        const campingTotal = campingGuests * 25 * nightCount;
        const total = houseTotal + campingTotal;
        const locale = lang === "sl" ? "sl-SI" : lang === "es" ? "es" : "en-US";
        const guestLabel = guestCount === 1 ? t.guest : t.guests;
        const tierLabels = {
            en: ["3–6 nights", "7–13 nights", "14–20 nights", "21–29 nights"],
            sl: ["3–6 noči", "7–13 noči", "14–20 noči", "21–29 noči"],
            es: ["3–6 noches", "7–13 noches", "14–20 noches", "21–29 noches"]
        };
        const tierLabel = (tierLabels[lang] || tierLabels.en)[tier];

        result.hidden = false;
        result.innerHTML = [
            "<h3>" + t.title + "</h3>",
            "<p>" + start.toLocaleDateString(locale, {timeZone:"UTC",year:"numeric",month:"long",day:"numeric"}) +
                " – " + end.toLocaleDateString(locale, {timeZone:"UTC",year:"numeric",month:"long",day:"numeric"}) + "</p>",
            "<p>" + nightCount + " " + (nightCount === 1 ? t.night : t.nights) + " · " + guestCount + " " + guestLabel + " · " + tierLabel + "</p>",
            "<ul>",
            "<li>" + t.high + ": " + highNights + " × " + money(highRate) + " = " + money(highNights * highRate) + "</li>",
            "<li>" + t.low + ": " + lowNights + " × " + money(lowRate) + " = " + money(lowNights * lowRate) + "</li>",
            campingGuests > 0 ? "<li>" + t.camping + ": " + campingGuests + " × " + money(25) + " × " + nightCount + " = " + money(campingTotal) + "</li>" : "",
            "</ul>",
            "<strong>" + t.total + "</strong>",
            "<span class=\"booking-total\">" + money(total) + "</span>",
            "<p>" + t.note + "</p>"
        ].join("");
    });
})();