"""Optional UI regression test. The demo itself needs no Python packages."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright


def run():
    with sync_playwright() as playwright:
        options = {"headless": True}
        if os.environ.get("CHROMIUM_EXECUTABLE"):
            options["executable_path"] = os.environ["CHROMIUM_EXECUTABLE"]
        browser = playwright.chromium.launch(**options)
        page = browser.new_page(viewport={"width": 1280, "height": 1000})
        errors, network = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("request", lambda request: network.append(request.url) if request.url.startswith(("http:", "https:")) else None)
        # Opening the file directly is the documented zero-server path.
        page.goto(Path(__file__).with_name("index.html").resolve().as_uri())
        assert page.locator(".bar").count() == 4
        assert "0 with conflicts" in page.locator("#summary").inner_text()
        first = page.locator('.bar[data-booking="DEMO-01"]')
        first.focus()
        page.keyboard.press("Enter")
        assert "2026-05-30 to 2026-06-05" in page.locator("#selection").inner_text()
        assert page.evaluate("document.activeElement.dataset.booking") == "DEMO-01"
        page.keyboard.press("Enter")  # Repeated activation keeps the selection and focus.
        assert page.locator('.bar[aria-pressed="true"]').count() == 1
        page.locator("#lesson-next").click()
        assert page.locator("#span").input_value() == "28"
        assert page.locator(".bar").count() == 5
        page.locator("#lesson-next").click()
        assert page.locator(".bar.conflict").count() == 3
        assert page.locator("#lesson-next").is_disabled()
        page.locator("#resource").select_option("Comet display")
        assert page.locator(".bar").count() == 1
        assert page.locator(".bar.conflict").count() == 0
        assert "Select a bar" in page.locator("#selection").inner_text()
        page.locator("#scenario").select_option("empty")
        assert page.locator(".bar").count() == 0
        assert "0 visible bookings" in page.locator("#summary").inner_text()
        page.locator("#reset").click()
        assert page.locator("#lesson-back").is_disabled()
        for _ in range(3):
            page.locator("#later").click()
        assert page.locator(".bar").count() == 0
        for _ in range(3):
            page.locator("#earlier").click()
        assert page.locator(".bar").count() == 4
        page.locator("details summary").click()
        page.locator('#booking-rows [data-booking="DEMO-03"]').click()
        assert "DEMO-03" in page.locator("#selection h3").inner_text()
        page.locator("details summary").click()
        page.locator("#lesson-next").click()
        page.locator("#lesson-back").click()
        assert page.locator("#span").input_value() == "14"
        page.locator("#reset").click()
        page.locator("#reset").click()
        assert page.locator(".bar").count() == 4
        page.reload()
        assert page.locator("#scenario").input_value() == "normal"
        assert "Select a bar" in page.locator("#selection").inner_text()
        screenshots = os.environ.get("SCREENSHOT_DIR")
        if screenshots:
            Path(screenshots).mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(Path(screenshots) / "desktop.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert page.locator(".chart-scroll").evaluate("e => e.scrollWidth > e.clientWidth")
        page.locator("#scenario").select_option("overlap")
        assert page.locator(".bar.conflict").count() == 3
        if screenshots:
            page.screenshot(path=str(Path(screenshots) / "mobile.png"), full_page=True)
        assert not errors, errors
        assert not network, network
        browser.close()
        print("PASS: keyboard, selection, filters, lessons, zoom, navigation, empty states, reset, reload, mobile overflow, no network")


if __name__ == "__main__":
    run()
