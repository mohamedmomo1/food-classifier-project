# مجلد صور الأطعمة - Food Images Setup

## 📁 موقع مجلد الصور
```
/c/final_gp_pro/backend/static/food_images/
```

## 📷 أسماء الصور المطلوبة (66 صورة)

يجب وضع صور JPG أو PNG لكل أطعمة في المجلد أعلاه بالأسماء التالية:

### Breakfast (الفطار) - 12 صورة
- meat.jpg
- boiled_eggs.jpg
- fried_eggs.jpg
- omelette.jpg
- white_bread.jpg
- baladi_bread.jpg
- toast_bread.jpg
- oats.jpg
- milk_full_cream.jpg
- tea_with_sugar.jpg
- cottage_cheese.jpg
- feta_cheese.jpg

### Lunch (الغداء) - 16 صورة
- rice.jpg
- salad.jpg
- burger.jpg
- chicken.jpg
- pane_chicken.jpg
- lentil_soup.jpg
- grilled_fish.jpg
- fried_fish.jpg
- salmon.jpg
- koshary.jpg
- ful_mudammas.jpg
- mahshi.jpg
- shawarma_meat.jpg
- shawarma_chicken.jpg
- macaroni_bechamel.jpg
- fatteh.jpg

### Dinner (العشاء) - 5 صور
- pizza.jpg
- hawawshi.jpg
- tuna_canned.jpg
- pasta_boiled.jpg
- yogurt.jpg

### Snacks (سناك) - 19 صورة
- fries.jpg
- cola.jpg
- banana.jpg
- falafel.jpg
- konafa.jpg
- orange.jpg
- apple.jpg
- strawberry.jpg
- mango.jpg
- dates.jpg
- peach.jpg
- guava.jpg
- potato_chips.jpg
- ketchup.jpg
- basbousa.jpg
- dark_chocolate.jpg
- avocado_juice.jpg
- mango_juice.jpg
- popcorn.jpg

### Others (الأخرى) - 14 صورة
- cucumber.jpg
- tomato.jpg
- mulukhiyah.jpg
- potato_boiled.jpg
- sweet_potato.jpg
- indomie.jpg
- rice_pudding.jpg
- watermelon.jpg
- grapes.jpg
- onion.jpg
- garlic.jpg
- spinach.jpg
- carrot.jpg
- broccoli.jpg
- pea.jpg

## 🔗 كيف يتم استخدام الصور

### 1. في API البحث (Search API)
```
GET /api/foods/search/?query=ك
```
**الـ Response يتضمن**:
```json
{
  "success": true,
  "foods": [
    {
      "_id": "...",
      "name": "Koshary",
      "name_ar": "كشري",
      "image_url": "/static/food_images/koshary.jpg",
      "calories": 1.6,
      ...
    }
  ]
}
```

### 2. في API التنبؤ (Predict API)
```
POST /api/foods/predict/
Content-Type: multipart/form-data
image: [image_file]
```
**الـ Response يتضمن**:
```json
{
  "success": true,
  "predictions": [
    {
      "food_id": "...",
      "name_ar": "كشري",
      "name_en": "Koshary",
      "image_url": "/static/food_images/koshary.jpg",
      "calories": 1.6,
      ...
    }
  ]
}
```

## ⚙️ إعدادات Django

تم تحديث `settings.py` و `urls.py` لخدمة الصور تلقائياً:

- **STATIC_URL**: `/static/`
- **STATIC_ROOT**: `/c/final_gp_pro/backend/staticfiles/`
- **STATICFILES_DIRS**: `/c/final_gp_pro/backend/static/`

في **Development** (DEBUG=True)، يتم خدمة الصور تلقائياً.

## 📝 ملاحظات مهمة

- جميع صور الأطعمة يجب أن تكون بصيغة JPG أو PNG
- يتم الوصول إلى الصور عبر الـ URL: `http://localhost:8000/static/food_images/{image_name}`
- في **Production**، يجب تشغيل `python manage.py collectstatic` لجمع الصور

## 🔄 تحديث قاعدة البيانات

بعد وضع الصور في المجلد، قم بـ seed قاعدة البيانات:

```bash
curl http://localhost:8000/api/seed-food/
```

أو من داخل Django shell:
```python
python manage.py shell
from api_app.seed_food import seed_food_database
```

هذا سيُحدّث `image_url` لجميع الأطعمة بالـ URLs الصحيحة!
