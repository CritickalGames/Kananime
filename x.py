from playwright.sync_api import sync_playwright

url = "https://ver-anime.com/episodio/32210/naruto-latino-169-sub-espa-ol"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto(url)

    page.wait_for_timeout(5000)

    # Buscar el span que contiene el número 4
    opcion_span = page.query_selector("span.fa-play-circle:text('4')")
    if opcion_span:
        opcion_span.click()
        print("Se hizo clic en la opción 4")
    else:
        print("No se encontró el span con '4'")

    page.wait_for_timeout(10000)
    browser.close()
