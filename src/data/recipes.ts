import {EXPANDED_RECIPES} from './expandedRecipes';
import type {Recipe} from '../domain/types';
import {RESEARCHED_RECIPES} from './researchedRecipes';
/** Working editorial dataset: NOT yet independently reviewed for release. */
const BASE_RECIPES: Recipe[] = [
  {
    "id": "recipe-001",
    "title": "املت گوجه‌فرنگی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian",
      "snack"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 3,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 15,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 3,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "گوجه را خرد کن و در تابه با روغن و زردچوبه روی حرارت متوسط بپز تا آب اضافی تبخیر شود."
      },
      {
        "title": "مرحله 2",
        "body": "تخم‌مرغ‌ها را جداگانه بشکن و از سالم‌بودنشان مطمئن شو. به گوجه اضافه کن."
      },
      {
        "title": "مرحله 3",
        "body": "هم بزن تا سفیده و زرده کاملاً بسته شوند. با نان سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-002",
    "title": "سیب‌زمینی آب‌پز و تخم‌مرغ",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian",
      "snack",
      "light"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 25,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "potato",
        "quantity": {
          "amount": 400,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 2,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 3,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "pepper",
        "quantity": {
          "amount": 1,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "سیب‌زمینی‌ها را بشوی و در آب بجوشان تا با چنگال به‌آسانی سوراخ شوند."
      },
      {
        "title": "مرحله 2",
        "body": "تخم‌مرغ‌ها را جداگانه بپز تا کاملاً سفت شوند."
      },
      {
        "title": "مرحله 3",
        "body": "مواد را پوست بگیر و خرد کن. نمک و فلفل را اضافه کن و گرم سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-003",
    "title": "کوکو سیب‌زمینی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian"
    ],
    "servings": 3,
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "potato",
        "quantity": {
          "amount": 600,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 3,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 100,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 45,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 4,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "سیب‌زمینی‌ها را آب‌پز کن، پوست بگیر و بکوب."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز را رنده کن و آب اضافی آن را بگیر؛ با تخم‌مرغ و چاشنی به سیب‌زمینی اضافه کن."
      },
      {
        "title": "مرحله 3",
        "body": "مایه را به بخش‌های کوچک تقسیم کن و با حرارت متوسط از هر دو طرف سرخ کن تا مغزپخت و طلایی شود."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-004",
    "title": "عدسی خانگی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian",
      "light"
    ],
    "servings": 3,
    "prepMinutes": 10,
    "cookMinutes": 50,
    "difficulty": "medium",
    "ingredients": [
      {
        "ingredientId": "lentil",
        "quantity": {
          "amount": 250,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 150,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato_paste",
        "quantity": {
          "amount": 25,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 15,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 1000,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "عدس را پاک کن، بشوی و اگر لازم بود از قبل بخیسان."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز خردشده را کمی تفت بده، زردچوبه و رب را اضافه کن."
      },
      {
        "title": "مرحله 3",
        "body": "عدس و آب را بیفزا و آرام بپز تا عدس کاملاً نرم شود. غلظت را با آب تنظیم کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-005",
    "title": "خوراک لوبیا چیتی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian"
    ],
    "servings": 3,
    "prepMinutes": 15,
    "cookMinutes": 100,
    "difficulty": "medium",
    "ingredients": [
      {
        "ingredientId": "bean",
        "quantity": {
          "amount": 280,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 140,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato_paste",
        "quantity": {
          "amount": 30,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 20,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 1100,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "لوبیا را از شب قبل در یخچال بخیسان و آب خیساندن را دور بریز."
      },
      {
        "title": "مرحله 2",
        "body": "لوبیا را در آب تازه بجوشان تا کاملاً نرم شود؛ زمان بسته به نوع لوبیا متفاوت است."
      },
      {
        "title": "مرحله 3",
        "body": "پیاز را تفت بده و رب را اضافه کن، سپس با لوبیای پخته ترکیب کن و بگذار جا بیفتد."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-006",
    "title": "برنج کته ساده",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 35,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "rice",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 500,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 4,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 10,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "برنج را چند بار با آب بشوی."
      },
      {
        "title": "مرحله 2",
        "body": "برنج، آب، نمک و روغن را در قابلمه مناسب بجوشان تا آب نزدیک سطح برنج برسد."
      },
      {
        "title": "مرحله 3",
        "body": "در قابلمه را بگذار و با حرارت کم بپز تا دانه‌ها نرم و مغزپخت شوند."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-007",
    "title": "دمی گوجه",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian"
    ],
    "servings": 3,
    "prepMinutes": 15,
    "cookMinutes": 40,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "rice",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 350,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "potato",
        "quantity": {
          "amount": 200,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 120,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 25,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 4,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "پیاز را تفت بده و زردچوبه اضافه کن؛ گوجه خردشده را بیفزا."
      },
      {
        "title": "مرحله 2",
        "body": "سیب‌زمینی خردشده و برنج شسته را اضافه کن و با مقدار آب کنترل‌شده بپز."
      },
      {
        "title": "مرحله 3",
        "body": "پس از جذب آب، دم‌کنی بگذار و با حرارت ملایم دم کن تا برنج و سیب‌زمینی کاملاً پخته شوند."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-008",
    "title": "خوراک مرغ و سیب‌زمینی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian"
    ],
    "servings": 3,
    "prepMinutes": 20,
    "cookMinutes": 50,
    "difficulty": "medium",
    "ingredients": [
      {
        "ingredientId": "chicken",
        "quantity": {
          "amount": 500,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "potato",
        "quantity": {
          "amount": 400,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 150,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato_paste",
        "quantity": {
          "amount": 35,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 25,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 350,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "مرغ خام را از سایر خوراکی‌ها دور نگه دار و تخته و دست‌ها را پس از تماس بشوی."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز را تفت بده؛ مرغ، زردچوبه، رب و آب را اضافه کن."
      },
      {
        "title": "مرحله 3",
        "body": "پس از نیم‌پز شدن مرغ، سیب‌زمینی را اضافه کن و بپز تا مرکز مرغ حداقل به ۷۴ درجه سانتی‌گراد برسد."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-009",
    "title": "کتلت گوشت",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian"
    ],
    "servings": 4,
    "prepMinutes": 20,
    "cookMinutes": 30,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "ground_beef",
        "quantity": {
          "amount": 450,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "potato",
        "quantity": {
          "amount": 400,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 150,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 1,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 70,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 5,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "سیب‌زمینی و پیاز را رنده و آب اضافی آن‌ها را بگیر."
      },
      {
        "title": "مرحله 2",
        "body": "گوشت چرخ‌کرده، تخم‌مرغ و چاشنی‌ها را مخلوط کن و شکل بده."
      },
      {
        "title": "مرحله 3",
        "body": "کتلت‌ها را در تابه داغ با حرارت متوسط بپز تا مرکز آن‌ها کاملاً پخته شود؛ با گوشت چرخ‌کرده دمای ایمن ۷۱ درجه است."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-010",
    "title": "کشک بادمجان بدون کشک",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian",
      "light"
    ],
    "servings": 2,
    "prepMinutes": 15,
    "cookMinutes": 40,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "eggplant",
        "quantity": {
          "amount": 500,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 140,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "garlic",
        "quantity": {
          "amount": 15,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "mint",
        "quantity": {
          "amount": 5,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "olive_oil",
        "quantity": {
          "amount": 20,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 3,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "بادمجان‌ها را روی سینی در فر بپز تا نرم شوند و پوست بگیر."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز و سیر را با روغن زیتون نرم کن و نعنا را کوتاه گرم کن تا نسوزد."
      },
      {
        "title": "مرحله 3",
        "body": "بادمجان را بکوب و با پیاز و سیر مخلوط کن؛ بدون کشک و با نام درست سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-011",
    "title": "سالاد خیار و گوجه",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "light",
      "snack"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 1,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "cucumber",
        "quantity": {
          "amount": 250,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 250,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 60,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "lemon_juice",
        "quantity": {
          "amount": 20,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "خیار و گوجه و پیاز را کاملاً بشوی و خرد کن."
      },
      {
        "title": "مرحله 2",
        "body": "مواد را با هم مخلوط کن؛ آب‌لیمو و نمک را نزدیک زمان سرو اضافه کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-012",
    "title": "سالاد مرغ ساده",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "light"
    ],
    "servings": 2,
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "chicken",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "cucumber",
        "quantity": {
          "amount": 180,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "lettuce",
        "quantity": {
          "amount": 180,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "yogurt",
        "quantity": {
          "amount": 80,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "lemon_juice",
        "quantity": {
          "amount": 10,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "مرغ را کامل بپز تا دمای مرکز آن به ۷۴ درجه سانتی‌گراد برسد، سپس خنک و خرد کن."
      },
      {
        "title": "مرحله 2",
        "body": "کاهو و خیار شسته را خرد کن؛ مرغ خنک‌شده را اضافه کن."
      },
      {
        "title": "مرحله 3",
        "body": "ماست و آب‌لیمو را به‌عنوان سس مخلوط کن و بلافاصله سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-013",
    "title": "اسفناج و تخم‌مرغ",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "light",
      "iranian"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "spinach",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 2,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 100,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "olive_oil",
        "quantity": {
          "amount": 12,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "اسفناج را چند مرتبه بشوی و آبکش کن."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز را با روغن زیتون کمی نرم کن، اسفناج را اضافه کن تا حجمش کم شود."
      },
      {
        "title": "مرحله 3",
        "body": "تخم‌مرغ‌ها را اضافه کن و با حرارت ملایم بپز تا کاملاً بسته شوند."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-014",
    "title": "سوپ هویج و عدس",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "light",
      "iranian"
    ],
    "servings": 3,
    "prepMinutes": 15,
    "cookMinutes": 40,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "lentil",
        "quantity": {
          "amount": 180,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "carrot",
        "quantity": {
          "amount": 200,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 100,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 900,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "عدس و سبزیجات را بشوی و هویج را ریز خرد کن."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز، هویج و عدس را با آب و زردچوبه در قابلمه بجوشان."
      },
      {
        "title": "مرحله 3",
        "body": "با شعله ملایم بپز تا عدس و هویج نرم شوند؛ در صورت تمایل کمی از سوپ را پوره کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-015",
    "title": "املت قارچ",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "snack",
      "light"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 3,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "mushroom",
        "quantity": {
          "amount": 180,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "oil",
        "quantity": {
          "amount": 12,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 3,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "قارچ‌ها را پاک و ورقه کن و در تابه با حرارت متوسط بپز تا آبشان کم شود."
      },
      {
        "title": "مرحله 2",
        "body": "تخم‌مرغ‌های سالم را با کمی نمک بزن و روی قارچ بریز."
      },
      {
        "title": "مرحله 3",
        "body": "با حرارت ملایم بپز تا همه بخش‌ها کاملاً بسته شوند."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-016",
    "title": "اوتمیل موز",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "snack",
      "light"
    ],
    "servings": 1,
    "prepMinutes": 5,
    "cookMinutes": 10,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "oats",
        "quantity": {
          "amount": 60,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "milk",
        "quantity": {
          "amount": 200,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "banana",
        "quantity": {
          "amount": 1,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "cinnamon",
        "quantity": {
          "amount": 1,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "جو دوسر و شیر را با حرارت کم گرم کن و پیوسته هم بزن."
      },
      {
        "title": "مرحله 2",
        "body": "وقتی جو نرم و مخلوط غلیظ شد، قابلمه را از حرارت بردار."
      },
      {
        "title": "مرحله 3",
        "body": "موز را حلقه کن و همراه دارچین روی اوتمیل قرار بده."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-017",
    "title": "ماست و موز و گردو",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "snack"
    ],
    "servings": 1,
    "prepMinutes": 5,
    "cookMinutes": 1,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "yogurt",
        "quantity": {
          "amount": 180,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "banana",
        "quantity": {
          "amount": 1,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "walnut",
        "quantity": {
          "amount": 20,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "موز را پوست بگیر و حلقه کن."
      },
      {
        "title": "مرحله 2",
        "body": "ماست را در کاسه بریز و موز و گردوی خردشده را روی آن اضافه کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-018",
    "title": "خرما و گردو",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "snack"
    ],
    "servings": 2,
    "prepMinutes": 5,
    "cookMinutes": 1,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "dates",
        "quantity": {
          "amount": 8,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "walnut",
        "quantity": {
          "amount": 40,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "خرماها را باز کن و هسته را کاملاً خارج کن."
      },
      {
        "title": "مرحله 2",
        "body": "در هر خرما کمی گردو قرار بده و به تعداد نفرات تقسیم کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-019",
    "title": "سیب دارچینی گرم",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "snack",
      "light"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "apple",
        "quantity": {
          "amount": 2,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "cinnamon",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 70,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "سیب‌ها را بشوی، هسته بگیر و به قاچ‌های مناسب خرد کن."
      },
      {
        "title": "مرحله 2",
        "body": "سیب‌ها را با کمی آب در ظرف دربسته روی حرارت ملایم بپز تا نرم شوند."
      },
      {
        "title": "مرحله 3",
        "body": "دارچین را اضافه کن و بدون افزودن شکر سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-020",
    "title": "ساندویچ تخم‌مرغ",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "fastfood",
      "snack"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 12,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "egg",
        "quantity": {
          "amount": 3,
          "unit": "pcs"
        },
        "essential": true
      },
      {
        "ingredientId": "bread",
        "quantity": {
          "amount": 200,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "cucumber",
        "quantity": {
          "amount": 100,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "lettuce",
        "quantity": {
          "amount": 80,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "تخم‌مرغ‌ها را تا سفت شدن کامل آب‌پز و پوست بگیر."
      },
      {
        "title": "مرحله 2",
        "body": "خیار و کاهو را شسته و خرد کن."
      },
      {
        "title": "مرحله 3",
        "body": "تخم‌مرغ را خرد کن و با سبزیجات در نان قرار بده؛ فوراً سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-021",
    "title": "پاستا با سس گوجه",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "fastfood"
    ],
    "servings": 3,
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "pasta",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 400,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 100,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "garlic",
        "quantity": {
          "amount": 10,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "olive_oil",
        "quantity": {
          "amount": 25,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 5,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "پاستا را در آب جوش مطابق زمان روی بسته بپز و آبکش کن."
      },
      {
        "title": "مرحله 2",
        "body": "پیاز و سیر را با روغن زیتون نرم کن؛ گوجه خردشده را اضافه کن و بجوشان تا سس غلیظ شود."
      },
      {
        "title": "مرحله 3",
        "body": "پاستا را به سس اضافه کن، کمی مخلوط کن و گرم سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-022",
    "title": "ساندویچ مرغ خانگی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "fastfood"
    ],
    "servings": 2,
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "chicken",
        "quantity": {
          "amount": 300,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "bread",
        "quantity": {
          "amount": 200,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "lettuce",
        "quantity": {
          "amount": 80,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 100,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "yogurt",
        "quantity": {
          "amount": 50,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "مرغ را در تابه یا قابلمه بپز تا مرکز آن به ۷۴ درجه سانتی‌گراد برسد و سپس ریش‌ریش کن."
      },
      {
        "title": "مرحله 2",
        "body": "سبزیجات شسته را خرد کن و ماست را به‌عنوان سس آماده کن."
      },
      {
        "title": "مرحله 3",
        "body": "مرغ پخته و سبزیجات را میان نان بگذار و بلافاصله سرو کن."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-023",
    "title": "پیتزای نانی خانگی",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "fastfood"
    ],
    "servings": 2,
    "prepMinutes": 15,
    "cookMinutes": 15,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "bread",
        "quantity": {
          "amount": 240,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "cheese",
        "quantity": {
          "amount": 140,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 180,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "mushroom",
        "quantity": {
          "amount": 160,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "bell_pepper",
        "quantity": {
          "amount": 120,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "نان‌های تخت را روی سینی مناسب فر بچین و روی آن گوجه خردشده پخش کن."
      },
      {
        "title": "مرحله 2",
        "body": "قارچ و فلفل دلمه‌ای را اضافه کن؛ پنیر را یکنواخت روی مواد بریز."
      },
      {
        "title": "مرحله 3",
        "body": "در فر از قبل گرم‌شده بپز تا پنیر ذوب شود و قارچ کاملاً بپزد."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-024",
    "title": "سیب‌زمینی تنوری",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "fastfood",
      "light"
    ],
    "servings": 2,
    "prepMinutes": 10,
    "cookMinutes": 35,
    "difficulty": "easy",
    "ingredients": [
      {
        "ingredientId": "potato",
        "quantity": {
          "amount": 500,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "olive_oil",
        "quantity": {
          "amount": 20,
          "unit": "ml"
        },
        "essential": true
      },
      {
        "ingredientId": "salt",
        "quantity": {
          "amount": 4,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "red_pepper",
        "quantity": {
          "amount": 2,
          "unit": "g"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "فر را پیش‌گرم کن؛ سیب‌زمینی‌های شسته را به قاچ‌های یک‌اندازه برش بزن."
      },
      {
        "title": "مرحله 2",
        "body": "با روغن و چاشنی مخلوط کن و با فاصله روی سینی بچین."
      },
      {
        "title": "مرحله 3",
        "body": "تا زمانی که داخلشان نرم و رویه طلایی شود بپز؛ زمان به اندازه قاچ‌ها بستگی دارد."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  },
  {
    "id": "recipe-025",
    "title": "خوراک نخود و گوجه",
    "description": "دستور خانگی با مواد مشخص و مراحل گام‌به‌گام.",
    "categories": [
      "iranian",
      "light"
    ],
    "servings": 3,
    "prepMinutes": 15,
    "cookMinutes": 80,
    "difficulty": "medium",
    "ingredients": [
      {
        "ingredientId": "chickpea",
        "quantity": {
          "amount": 280,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "tomato",
        "quantity": {
          "amount": 320,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "onion",
        "quantity": {
          "amount": 140,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "turmeric",
        "quantity": {
          "amount": 3,
          "unit": "g"
        },
        "essential": true
      },
      {
        "ingredientId": "water",
        "quantity": {
          "amount": 1000,
          "unit": "ml"
        },
        "essential": true
      }
    ],
    "steps": [
      {
        "title": "مرحله 1",
        "body": "نخود خشک را از شب قبل بخیسان و آب خیساندن را دور بریز."
      },
      {
        "title": "مرحله 2",
        "body": "نخود را در آب تازه تا نرم‌شدن کامل بپز."
      },
      {
        "title": "مرحله 3",
        "body": "پیاز و گوجه را جدا تفت بده و با نخود پخته ترکیب کن، چند دقیقه بجوشان تا طعم‌ها مخلوط شوند."
      }
    ],
    "contentStatus": "draft",
    "provenance": {
      "kind": "editorial"
    }
  }
];

/** Exact topic reference; this is NOT equivalent to editorial or rights approval. */
const potatoKuku=BASE_RECIPES.find(r=>r.id==='recipe-003');
if(potatoKuku)potatoKuku.provenance={kind:'source',url:'https://irancook.com/recipes/tarze-tahaye-coco-sibzamini/'};
/** Apply the documented USDA poultry temperature rule also to legacy editorial drafts. */
for(const recipe of BASE_RECIPES){
 if(recipe.ingredients.some(item=>item.ingredientId==='ground_beef')){
  const final=recipe.steps[recipe.steps.length-1];
  if(final&&!final.safetyNote)final.safetyNote='گوشت چرخ‌کرده را تا دمای داخلی دست‌کم ۷۱ درجه سانتی‌گراد کاملاً بپز.';
 }
 if(recipe.ingredients.some(item=>item.ingredientId==='chicken')){
  const final=recipe.steps[recipe.steps.length-1];
  if(final&&!final.safetyNote)final.safetyNote='مرغ باید تا دمای داخلی دست‌کم ۷۴ درجه سانتی‌گراد کاملاً بپزد؛ گوشت خام را از غذای آماده جدا نگه دار.';
 }
}
/** Distinct original local recipes. Editorial status remains draft until verified. */
export const RECIPES:Recipe[]=[...BASE_RECIPES,...EXPANDED_RECIPES,...RESEARCHED_RECIPES];
