import requests

# رابط الـ API بتاعك اللي السيرفر قايم عليه حالياً
url = 'http://127.0.0.1:8000/api/predict/'

# مسار صورة التجربة (تأكد من الاسم والامتداد صح)
image_path = image_path = r'C:\final_gp_pro\ai_model\unseen_data\test.jpg.png'
try:
    # فتح الصورة وإرسالها في الـ Request
    with open(image_path, 'rb') as img:
        files = {'image': img}
        print("Sending image to Django server...")
        response = requests.post(url, files=files)
        
    # طباعة النتيجة اللي رجعت من الديجانجو والموديل
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())

except Exception as e:
    print("Error:", str(e))