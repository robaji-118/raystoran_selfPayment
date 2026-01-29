// scripts/seed-menus.ts
import "dotenv/config";
import mongoose from "mongoose";
import Menu from "../models/Menu";
import Category from "../models/Category";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function seedMenus() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Ambil atau buat kategori terlebih dahulu
    console.log("📋 Setting up categories...");
    
    // Cek apakah kategori sudah ada, jika tidak buat baru
    let foodCategory = await Category.findOne({ name: "Food", isActive: true });
    let drinkCategory = await Category.findOne({ name: "Drink", isActive: true });
    let snackCategory = await Category.findOne({ name: "Snack", isActive: true });
    
    if (!foodCategory) {
      foodCategory = await Category.create({
        name: "Food",
        description: "Makanan - Main dishes and rice meals",
        isActive: true
      });
      console.log("✅ Food category created");
    } else {
      console.log("✅ Food category found:", foodCategory.name);
    }
    
    if (!drinkCategory) {
      drinkCategory = await Category.create({
        name: "Drink",
        description: "Minuman - Beverages and drinks",
        isActive: true
      });
      console.log("✅ Drink category created");
    } else {
      console.log("✅ Drink category found:", drinkCategory.name);
    }

    if (!snackCategory) {
      snackCategory = await Category.create({
        name: "Snack",
        description: "Cemilan - Snacks and appetizers",
        isActive: true
      });
      console.log("✅ Snack category created");
    } else {
      console.log("✅ Snack category found:", snackCategory.name);
    }

    // Data menu untuk di-seed
    const menus = [
      // ========== FOOD ITEMS (Main Dishes) ==========
      {
        name: "Truffle Mushroom Risotto",
        description: "Creamy arborio rice with wild mushrooms and truffle oil",
        categoryId: foodCategory._id,
        price: 85000,
        image: "truffle-risotto.jpg",
        isAvailable: true,
        preparationTime: 25,
        isActive: true
      },
      {
        name: "Wagyu Beef Burger",
        description: "Premium wagyu patty with caramelized onions, aged cheddar, and truffle aioli",
        categoryId: foodCategory._id,
        price: 120000,
        image: "wagyu-burger.jpg",
        isAvailable: true,
        preparationTime: 20,
        isActive: true
      },
      {
        name: "Grilled Salmon Teriyaki",
        description: "Fresh Atlantic salmon glazed with homemade teriyaki sauce, served with jasmine rice",
        categoryId: foodCategory._id,
        price: 95000,
        image: "salmon-teriyaki.jpg",
        isAvailable: true,
        preparationTime: 18,
        isActive: true
      },
      {
        name: "Lobster Mac & Cheese",
        description: "Maine lobster tail with four-cheese macaroni and herb breadcrumbs",
        categoryId: foodCategory._id,
        price: 145000,
        image: "lobster-mac.jpg",
        isAvailable: true,
        preparationTime: 22,
        isActive: true
      },
      {
        name: "Butter Chicken Masala",
        description: "Tender chicken in creamy tomato curry with basmati rice and naan",
        categoryId: foodCategory._id,
        price: 75000,
        image: "butter-chicken.jpg",
        isAvailable: true,
        preparationTime: 20,
        isActive: true
      },
      {
        name: "Beef Wellington",
        description: "Prime beef tenderloin wrapped in puff pastry with mushroom duxelles",
        categoryId: foodCategory._id,
        price: 185000,
        image: "beef-wellington.jpg",
        isAvailable: true,
        preparationTime: 35,
        isActive: true
      },
      {
        name: "Carbonara Pasta",
        description: "Classic Italian pasta with pancetta, egg yolk, and Parmigiano-Reggiano",
        categoryId: foodCategory._id,
        price: 65000,
        image: "carbonara.jpg",
        isAvailable: true,
        preparationTime: 15,
        isActive: true
      },
      {
        name: "BBQ Ribs Platter",
        description: "Slow-cooked pork ribs with signature BBQ sauce, coleslaw, and cornbread",
        categoryId: foodCategory._id,
        price: 110000,
        image: "bbq-ribs.jpg",
        isAvailable: true,
        preparationTime: 25,
        isActive: true
      },
      {
        name: "Chicken Parmigiana",
        description: "Breaded chicken breast with marinara sauce, mozzarella, and spaghetti",
        categoryId: foodCategory._id,
        price: 78000,
        image: "chicken-parm.jpg",
        isAvailable: true,
        preparationTime: 20,
        isActive: true
      },
      {
        name: "Tom Yum Seafood",
        description: "Spicy Thai soup with prawns, squid, and fresh herbs",
        categoryId: foodCategory._id,
        price: 68000,
        image: "tom-yum.jpg",
        isAvailable: true,
        preparationTime: 15,
        isActive: true
      },
      {
        name: "Duck Confit",
        description: "French-style slow-cooked duck leg with rosemary potatoes and orange reduction",
        categoryId: foodCategory._id,
        price: 125000,
        image: "duck-confit.jpg",
        isAvailable: true,
        preparationTime: 28,
        isActive: true
      },
      {
        name: "Seafood Paella",
        description: "Spanish saffron rice with prawns, mussels, clams, and calamari",
        categoryId: foodCategory._id,
        price: 135000,
        image: "paella.jpg",
        isAvailable: true,
        preparationTime: 30,
        isActive: true
      },
      {
        name: "Lamb Rack Provencal",
        description: "Herb-crusted lamb rack with ratatouille and red wine jus",
        categoryId: foodCategory._id,
        price: 165000,
        image: "lamb-rack.jpg",
        isAvailable: true,
        preparationTime: 30,
        isActive: true
      },
      {
        name: "Rendang Fusion Bowl",
        description: "Modern twist on Indonesian rendang with quinoa and pickled vegetables",
        categoryId: foodCategory._id,
        price: 72000,
        image: "rendang-bowl.jpg",
        isAvailable: true,
        preparationTime: 18,
        isActive: true
      },
      {
        name: "Poke Bowl",
        description: "Hawaiian-style marinated tuna with edamame, avocado, and sesame rice",
        categoryId: foodCategory._id,
        price: 82000,
        image: "poke-bowl.jpg",
        isAvailable: true,
        preparationTime: 12,
        isActive: true
      },

      // ========== SNACK ITEMS (Appetizers & Small Plates) ==========
      {
        name: "Wagyu Beef Tataki",
        description: "Seared wagyu beef with ponzu sauce, microgreens, and garlic chips",
        categoryId: snackCategory._id,
        price: 95000,
        image: "wagyu-tataki.jpg",
        isAvailable: true,
        preparationTime: 12,
        isActive: true
      },
      {
        name: "Tuna Tartare",
        description: "Fresh tuna with avocado, crispy wonton, and sesame dressing",
        categoryId: snackCategory._id,
        price: 78000,
        image: "tuna-tartare.jpg",
        isAvailable: true,
        preparationTime: 10,
        isActive: true
      },
      {
        name: "Crispy Calamari",
        description: "Lightly fried calamari with lemon aioli and marinara sauce",
        categoryId: snackCategory._id,
        price: 58000,
        image: "calamari.jpg",
        isAvailable: true,
        preparationTime: 12,
        isActive: true
      },
      {
        name: "Burrata Caprese",
        description: "Creamy burrata with heirloom tomatoes, basil, and balsamic reduction",
        categoryId: snackCategory._id,
        price: 68000,
        image: "burrata.jpg",
        isAvailable: true,
        preparationTime: 8,
        isActive: true
      },
      {
        name: "Truffle Fries",
        description: "Hand-cut fries with truffle oil, parmesan, and fresh herbs",
        categoryId: snackCategory._id,
        price: 48000,
        image: "truffle-fries.jpg",
        isAvailable: true,
        preparationTime: 10,
        isActive: true
      },
      {
        name: "Dragon Roll",
        description: "Eel and cucumber topped with avocado and teriyaki glaze",
        categoryId: snackCategory._id,
        price: 72000,
        image: "dragon-roll.jpg",
        isAvailable: true,
        preparationTime: 15,
        isActive: true
      },
      {
        name: "Rainbow Sushi Platter",
        description: "Assorted sashimi on California roll with chef's special sauce",
        categoryId: snackCategory._id,
        price: 85000,
        image: "rainbow-sushi.jpg",
        isAvailable: true,
        preparationTime: 18,
        isActive: true
      },
      {
        name: "Korean Fried Chicken",
        description: "Double-fried chicken wings with gochujang glaze and pickled radish",
        categoryId: snackCategory._id,
        price: 62000,
        image: "korean-chicken.jpg",
        isAvailable: true,
        preparationTime: 20,
        isActive: true
      },
      {
        name: "Foie Gras Bruschetta",
        description: "Pan-seared foie gras on toasted brioche with fig compote",
        categoryId: snackCategory._id,
        price: 125000,
        image: "foie-gras.jpg",
        isAvailable: true,
        preparationTime: 12,
        isActive: true
      },
      {
        name: "Wagyu Sliders",
        description: "Three mini wagyu burgers with different gourmet toppings (3 pcs)",
        categoryId: snackCategory._id,
        price: 88000,
        image: "wagyu-sliders.jpg",
        isAvailable: true,
        preparationTime: 15,
        isActive: true
      },
      {
        name: "Charcuterie Board",
        description: "Artisan cured meats, imported cheeses, nuts, and house-made preserves",
        categoryId: snackCategory._id,
        price: 135000,
        image: "charcuterie.jpg",
        isAvailable: true,
        preparationTime: 10,
        isActive: true
      },
      {
        name: "Nachos Supreme",
        description: "Loaded nachos with wagyu beef, guacamole, jalapeños, and three-cheese blend",
        categoryId: snackCategory._id,
        price: 75000,
        image: "nachos.jpg",
        isAvailable: true,
        preparationTime: 12,
        isActive: true
      },
      {
        name: "Gyoza Premium",
        description: "Pan-fried Japanese dumplings with truffle ponzu sauce (6 pcs)",
        categoryId: snackCategory._id,
        price: 52000,
        image: "gyoza.jpg",
        isAvailable: true,
        preparationTime: 10,
        isActive: true
      },
      {
        name: "Lobster Tempura",
        description: "Crispy lobster tail tempura with yuzu mayo and tobiko",
        categoryId: snackCategory._id,
        price: 115000,
        image: "lobster-tempura.jpg",
        isAvailable: true,
        preparationTime: 15,
        isActive: true
      },
      {
        name: "Beef Carpaccio",
        description: "Thinly sliced premium beef with arugula, capers, and truffle aioli",
        categoryId: snackCategory._id,
        price: 82000,
        image: "carpaccio.jpg",
        isAvailable: true,
        preparationTime: 10,
        isActive: true
      },

      // ========== DRINK ITEMS (Signature Beverages) ==========
      {
        name: "Cold Brew Nitro",
        description: "Smooth cold brew coffee infused with nitrogen for creamy texture",
        categoryId: drinkCategory._id,
        price: 42000,
        image: "nitro-cold-brew.jpg",
        isAvailable: true,
        preparationTime: 5,
        isActive: true
      },
      {
        name: "Matcha Latte Supreme",
        description: "Premium Japanese matcha with oat milk and honey",
        categoryId: drinkCategory._id,
        price: 48000,
        image: "matcha-latte.jpg",
        isAvailable: true,
        preparationTime: 7,
        isActive: true
      },
      {
        name: "Signature Mojito",
        description: "Fresh mint, lime, and premium rum with soda water",
        categoryId: drinkCategory._id,
        price: 65000,
        image: "mojito.jpg",
        isAvailable: true,
        preparationTime: 8,
        isActive: true
      },
      {
        name: "Passion Fruit Cooler",
        description: "Fresh passion fruit with sparkling water and mint",
        categoryId: drinkCategory._id,
        price: 38000,
        image: "passion-cooler.jpg",
        isAvailable: true,
        preparationTime: 6,
        isActive: true
      },
      {
        name: "Espresso Martini",
        description: "Classic cocktail with vodka, coffee liqueur, and fresh espresso",
        categoryId: drinkCategory._id,
        price: 78000,
        image: "espresso-martini.jpg",
        isAvailable: true,
        preparationTime: 8,
        isActive: true
      },
      {
        name: "Butterfly Pea Lemonade",
        description: "Color-changing lemonade with butterfly pea flower and fresh lemon",
        categoryId: drinkCategory._id,
        price: 35000,
        image: "butterfly-lemonade.jpg",
        isAvailable: true,
        preparationTime: 6,
        isActive: true
      },
      {
        name: "Affogato Classic",
        description: "Vanilla gelato drowned in hot espresso shot",
        categoryId: drinkCategory._id,
        price: 45000,
        image: "affogato.jpg",
        isAvailable: true,
        preparationTime: 5,
        isActive: true
      },
      {
        name: "Yuzu Sparkling",
        description: "Japanese yuzu citrus with sparkling water and honey",
        categoryId: drinkCategory._id,
        price: 42000,
        image: "yuzu-sparkling.jpg",
        isAvailable: true,
        preparationTime: 5,
        isActive: true
      },
      {
        name: "Salted Caramel Frappe",
        description: "Blended coffee with salted caramel and whipped cream",
        categoryId: drinkCategory._id,
        price: 52000,
        image: "caramel-frappe.jpg",
        isAvailable: true,
        preparationTime: 7,
        isActive: true
      },
      {
        name: "Lavender Honey Latte",
        description: "Espresso with steamed milk, lavender syrup, and wildflower honey",
        categoryId: drinkCategory._id,
        price: 48000,
        image: "lavender-latte.jpg",
        isAvailable: true,
        preparationTime: 7,
        isActive: true
      },
      {
        name: "Dragon Fruit Smoothie",
        description: "Fresh dragon fruit blended with coconut milk and chia seeds",
        categoryId: drinkCategory._id,
        price: 45000,
        image: "dragon-smoothie.jpg",
        isAvailable: true,
        preparationTime: 6,
        isActive: true
      },
      {
        name: "Classic Old Fashioned",
        description: "Premium bourbon with bitters, sugar, and orange peel",
        categoryId: drinkCategory._id,
        price: 85000,
        image: "old-fashioned.jpg",
        isAvailable: true,
        preparationTime: 8,
        isActive: true
      },
      {
        name: "Acai Berry Blast",
        description: "Superfood acai blended with mixed berries and granola",
        categoryId: drinkCategory._id,
        price: 52000,
        image: "acai-blast.jpg",
        isAvailable: true,
        preparationTime: 7,
        isActive: true
      },
      {
        name: "Golden Turmeric Latte",
        description: "Anti-inflammatory golden milk with turmeric, ginger, and almond milk",
        categoryId: drinkCategory._id,
        price: 42000,
        image: "turmeric-latte.jpg",
        isAvailable: true,
        preparationTime: 6,
        isActive: true
      },
      {
        name: "Aperol Spritz",
        description: "Italian aperitif with prosecco and soda water",
        categoryId: drinkCategory._id,
        price: 72000,
        image: "aperol-spritz.jpg",
        isAvailable: true,
        preparationTime: 6,
        isActive: true
      },
      {
        name: "Iced Spanish Latte",
        description: "Sweetened condensed milk espresso over ice",
        categoryId: drinkCategory._id,
        price: 38000,
        image: "spanish-latte.jpg",
        isAvailable: true,
        preparationTime: 5,
        isActive: true
      },
      {
        name: "Kombucha Ginger Lime",
        description: "Probiotic fermented tea with ginger and lime",
        categoryId: drinkCategory._id,
        price: 45000,
        image: "kombucha.jpg",
        isAvailable: true,
        preparationTime: 4,
        isActive: true
      },
      {
        name: "San Pellegrino Sparkling",
        description: "Premium Italian sparkling mineral water",
        categoryId: drinkCategory._id,
        price: 25000,
        image: "san-pellegrino.jpg",
        isAvailable: true,
        preparationTime: 2,
        isActive: true
      },
    ];

    // Hapus semua menu yang ada (opsional - comment jika tidak ingin hapus)
    console.log("🗑️  Clearing existing menus...");
    await Menu.deleteMany({});
    console.log("✅ Existing menus cleared");

    // Insert menu baru
    console.log("📝 Inserting menus...");
    const result = await Menu.insertMany(menus);
    console.log(`✅ Successfully inserted ${result.length} menus`);

    // Tampilkan data yang berhasil di-insert
    console.log("\n📊 Inserted Menus:");
    const foodItems = result.filter(m => m.categoryId.toString() === foodCategory._id.toString());
    const drinkItems = result.filter(m => m.categoryId.toString() === drinkCategory._id.toString());
    const snackItems = result.filter(m => m.categoryId.toString() === snackCategory._id.toString());
    
    console.log(`\n  🍽️  FOOD - Main Dishes (${foodItems.length} items):`);
    foodItems.forEach((menu) => {
      console.log(`     - ${menu.name} - Rp ${menu.price.toLocaleString()} (${menu.preparationTime} min)`);
    });
    
    console.log(`\n  🍱 SNACKS - Appetizers & Small Plates (${snackItems.length} items):`);
    snackItems.forEach((menu) => {
      console.log(`     - ${menu.name} - Rp ${menu.price.toLocaleString()} (${menu.preparationTime} min)`);
    });
    
    console.log(`\n  🥤 DRINKS - Signature Beverages (${drinkItems.length} items):`);
    drinkItems.forEach((menu) => {
      console.log(`     - ${menu.name} - Rp ${menu.price.toLocaleString()} (${menu.preparationTime} min)`);
    });

    console.log("\n🎉 Menu seeding completed successfully!");
    console.log(`\n📈 Total Summary:`);
    console.log(`   • Food: ${foodItems.length} items`);
    console.log(`   • Snacks: ${snackItems.length} items`);
    console.log(`   • Drinks: ${drinkItems.length} items`);
    console.log(`   • TOTAL: ${result.length} items`);
  } catch (error) {
    console.error("❌ Error seeding menus:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Jalankan seeder
seedMenus();