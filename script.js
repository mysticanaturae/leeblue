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
            result.textContent = "Please choose a valid check-in and check-out date. Check-out must be after check-in.";
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
        result.innerHTML = `
            <h3>Your estimated stay</h3>
            <p>${start.toLocaleDateString("en-US", {timeZone:"UTC", year:"numeric", month:"long", day:"numeric"})}
            – ${end.toLocaleDateString("en-US", {timeZone:"UTC", year:"numeric", month:"long", day:"numeric"})}</p>
            <p>${nightCount} night${nightCount === 1 ? "" : "s"} · ${guestCount} guest${guestCount === 1 ? "" : "s"}</p>
            <ul>
                <li>High-season nights: ${highNights} × $300 = ${money(highNights * 300)}</li>
                <li>Low-season nights: ${lowNights} × $220 = ${money(lowNights * 220)}</li>
            </ul>
            <strong>Estimated accommodation total</strong>
            <span class="booking-total">${money(total)}</span>
            <p>This is a price estimate only. It does not check availability or reserve these dates. Please contact Lee Blue Pomona to confirm your stay.</p>
        `;
    });
})();

