from playwright.sync_api import sync_playwright
import json

url = "https://ver-anime.com/episodio/31255/naruto-latino-1-sub-espa-ol"

def op4(page):
    opcion_span4 = page.query_selector("span.fa-play-circle:text('4')")
    opcion_span3= page.query_selector("span.fa-play-circle:text('3')")
    if opcion_span4:
        opcion_span4.click()
        print("Se hizo clic en la opción 4")
    elif opcion_span3:
        opcion_span3.click()
        print("Se hizo clic en la opción 3")
    else:
        print("No se encontró el span con '4' o '3'")

def reproducir(page):
    try:
        # Seleccionar el iframe dentro de #video-container
        iframe_element = page.query_selector("#video-container iframe")
        if not iframe_element:
            print("No se encontró el iframe dentro de #video-container")
            return False

        # Obtener el frame asociado al iframe
        frame = iframe_element.content_frame()
        if not frame:
            print("No se pudo acceder al contenido del iframe")
            return False

        # Buscar el div padre dentro del iframe
        padre = frame.query_selector("#fluid_video_wrapper_content_video")
        if not padre:
            print("No se encontró el div padre dentro del iframe")
            return False

        # Conseguir el menú contextual
        contextual = padre.query_selector("#content_video_fluid_context_menu")
        if not contextual:
            print("No se encontró el menú contextual dentro del padre")
            return False

        # Cambiar el display a block
        frame.evaluate("document.querySelector('#content_video_fluid_context_menu').style.display = 'block'")
        valor_display = contextual.evaluate("el => el.style.display")
        print("Display actual del menú contextual:", valor_display)

        # Hacer clic en Play
        click=frame.click("#content_videocontext_option_play")
        if click: 
            print("Se hizo clic en 'Play'")
        page.wait_for_timeout(5000)

        return True
    except Exception as e:
        print("Error en reproducir:", e)
        return False

def conseguir_iframe(page, links, i):
    for frame in page.frames: 
        url = frame.url 
        if "ok.ru/videoembed" in url:
            entry = {
                "i": i,
                "link": url,
                "relleno": False  # aquí decides si es relleno o no
            }
            links.append(entry)
            print(f"\033[31mLink OK.ru encontrado (i={i}):\033[39m", url)

def sig_cap(page):
    # Buscar enlace con texto "Episodio siguiente"
    next_link = page.query_selector("a:has-text('Episodio siguiente')")
    if next_link:
        href = next_link.get_attribute("href")
        print("Avanzando a:", href)
        page.goto(href)
        return True
    else:
        print("No hay más episodios siguientes. Fin del bucle.")
        return False

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto(url)

    all_links = []
    i = 1
    while True:
        op4(page)  # seleccionar opción 4
        page.wait_for_timeout(3000)
        if not reproducir(page):  # Reproduce el vídeo para conseguir el iframe
            break        
        conseguir_iframe(page, all_links, i)  # extraer iframe con índice
        page.wait_for_timeout(3000)
        if not sig_cap(page):  # si no hay siguiente, romper
            break
        i += 1


    # Guardar todos los enlaces al final
    with open("videos.json", "w", encoding="utf-8") as f:
        json.dump(all_links, f, indent=4, ensure_ascii=False)

    print("Links guardados:", all_links)
    browser.close()