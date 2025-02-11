from bs4 import BeautifulSoup
import requests

def google_image_search(query):
    url = f"https://www.google.com/search?tbm=isch&q={query.replace(' ', '+')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    
    images = []
    for img in soup.find_all("img"):
        src = img.get("src")
        if src and "http" in src:
            images.append(src)

    return images