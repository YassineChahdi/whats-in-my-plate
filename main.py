import sys
from google import genai
import PIL.Image

def prompt_gemini(query, image_path = None):
    if image_path is None:
        client = genai.Client(api_key="AIzaSyCu7ejCbzZi1yaljLPdcWf0B2GIzkYDQ-8")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[query])
        return response.text

    image = PIL.Image.open(image_path)
    client = genai.Client(api_key="AIzaSyCu7ejCbzZi1yaljLPdcWf0B2GIzkYDQ-8")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[query, image])

    return response.text

def get_macros(img_path):
    query = "Give me only total macros (protein, carbs, fat) and caloric approximations in the format: " \
    "Proteins: <proteins>\n" \
    "Carbs: <carbs>\n" \
    "Fat: <fat>\n" \
    "Calories: <calories>" \
    
    return prompt_gemini(query, img_path)


def is_food(img_path):
    query = "Respond 'yes' if the image represents food, 'no' otherwise."
    if prompt_gemini(query, img_path) == "yes":
        return True
    return False

img_path = "imgs/" + "food2.webp"


if __name__ == "__main__":
    img_path = sys.argv[1]
    if is_food(img_path):
        print(get_macros(img_path))

    else:
        print("Food not recognized")
